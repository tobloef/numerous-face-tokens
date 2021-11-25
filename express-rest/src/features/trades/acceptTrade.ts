import {
    err,
    ok,
} from "neverthrow";
import ApiError from "../../ApiError";
import { PrivateFeature } from "../../types/Feature";
import SetupRequest from "../../types/SetupRequest";
import {
    Nft,
    Trade,
    User,
} from "@prisma/client";
import deleteProp from "../../utils/deleteProp";
import assert from "assert";
import Markdown from "../../types/Markdown";
import { CURRENCY_SYMBOL } from "../../utils/constants";
import { getNftImageLink } from "../../utils/getNftImageLink";

export type AcceptTradeRequest = {
  id: string,
};

export type AcceptTradeResponse =
  & Trade
  & {
  nft: Nft;
  seller: User;
  buyer: User;
};

export const acceptTrade: PrivateFeature<AcceptTradeRequest, AcceptTradeResponse> = async (
  request,
  ctx,
) => {
  const trade = await ctx.prisma.trade.findUnique({
    where: {
      id: request.id,
    },
    include: {
      nft: {
        include: {
          highestTrade: true,
          lastTrade: true,
        },
      },
      buyer: true,
      seller: true,
      highestTradeOfNft: true,
      lastTradeOfNft: true,
    },
  });

  if (trade == null) {
    return err(new ApiError("Trade not found", 404));
  }

  assert(trade.seller !== null);
  assert(trade.sellerId !== null);

  if (
    trade.sellerId !== ctx.user.id &&
    trade.buyerId !== ctx.user.id &&
    trade.buyer !== null
  ) {
    return err(new ApiError("Cannot accept trade you are not participating in", 403));
  }

  if (
    (trade.sellerId === ctx.user.id && trade.sellerAccepted) ||
    (trade.buyerId === ctx.user.id && trade.buyerAccepted)
  ) {
    return err(new ApiError("Already accepted", 400));
  }

  const buyer: User = trade.buyer ?? ctx.user;

  if (buyer.balance < trade.price) {
    return err(new ApiError("Insufficient funds", 400));
  }

  if (trade.buyerId === null) {
    await ctx.prisma.trade.update({
      where: {
        id: request.id,
      },
      data: {
        buyerId: ctx.user.id,
      },
    });
  }

  const updatedTradeWithPasswords = await ctx.prisma.trade.update({
    where: {
      id: request.id,
    },
    include: {
      nft: true,
      buyer: true,
      seller: true,
    },
    data: {
      buyerAccepted: trade.buyerAccepted || buyer.id === ctx.user.id,
      sellerAccepted: trade.sellerAccepted || trade.sellerId === ctx.user.id,
      soldAt: new Date(),
      buyer: {
        update: {
          balance: buyer.balance - trade.price,
        },
      },
      seller: {
        update: {
          balance: trade.seller.balance + trade.price,
        },
      },
      nft: {
        update: {
          ownerId: buyer.id,
          lastTradeId: trade.id,
          highestTradeId: (
            trade.nft.highestTrade === null ||
            trade.nft.highestTrade.price <= trade.price
          )
            ? trade.id
            : undefined,
        },
      },
    },
  });

  await ctx.prisma.trade.deleteMany({
    where: {
      nft: {
        seed: trade.nft.seed,
      },
      OR: [
        {buyerAccepted: false},
        {sellerAccepted: false},
      ],
    },
  })

  assert(updatedTradeWithPasswords.buyer !== null);
  assert(updatedTradeWithPasswords.seller !== null);

  const updatedTrade = {
    ...updatedTradeWithPasswords,
    seller: deleteProp(updatedTradeWithPasswords.seller, "passwordHash"),
    buyer: deleteProp(updatedTradeWithPasswords.buyer, "passwordHash"),
  };

  ctx.notify({
    time: new Date(),
    title: `NFT Sold`,
    description: (
      `![${trade.nft.seed}](${getNftImageLink(trade.nft.seed)})\n\n` +
      `User [${trade.seller.username}](/users/${trade.seller.username}) sold ` +
      `NFT [${trade.nft.seed}](/nfts/${trade.nft.seed}) to ` +
      `user [${buyer.username}](/users/${buyer.username}) for ` +
      `${CURRENCY_SYMBOL}${trade.price}.`
    ) as Markdown,
  })

  return ok(updatedTrade);
};

export const setupAcceptTradeRequest: SetupRequest<AcceptTradeRequest, { id: string }> = (req) => {
  return ok({
    id: req.params.id,
  });
}

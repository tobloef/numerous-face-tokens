import { is } from "typescript-is";
import {
    err,
    ok,
} from "neverthrow";
import ApiError from "../../ApiError";
import { PrivateFeature } from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import {
    Nft,
    Trade,
    User,
} from "@prisma/client";
import deleteProp from "../../utils/deleteProp";
import generateId from "../../utils/generateId";
import Markdown from "../../types/Markdown";
import { CURRENCY_SYMBOL } from "../../utils/constants";
import { getNftImageLink } from "../../utils/getNftImageLink";

export type CreateTradeRequest = {
  sellerUsername: string,
  buyerUsername: string | null,
  nftSeed: string,
  price: number,
};

export type CreateTradeResponse =
  & Trade
  & {
  nft: Nft;
  seller: User;
  buyer: User | null;
};

export const createTrade: PrivateFeature<CreateTradeRequest, CreateTradeResponse> = async (
  request,
  ctx,
) => {
  if (
    request.sellerUsername !== ctx.user.username &&
    request.buyerUsername !== ctx.user.username
  ) {
    return err(new ApiError("Cannot create trade you are not participating in", 403));
  }

  if (request.sellerUsername === request.buyerUsername) {
    return err(new ApiError("Cannot create trade with yourself", 400));
  }

  const seller = await ctx.prisma.user.findUnique({
    where: {
      username: request.sellerUsername,
    },
  });

  if (seller === null) {
    return err(new ApiError("Seller not found", 404));
  }

  let buyer;
  if (request.buyerUsername !== null) {
    buyer = await ctx.prisma.user.findUnique({
      where: {
        username: request.buyerUsername,
      },
    });

    if (buyer === null) {
      return err(new ApiError("Buyer not found", 404));
    }
  }

  const nft = await ctx.prisma.nft.findUnique({
    where: {
      seed: request.nftSeed,
    },
  });

  if (nft === null) {
    return err(new ApiError("NFT not found", 404));
  }

  if (nft.ownerId !== seller.id) {
    return err(new ApiError("Seller does not own the NFT", 403));
  }

  if (request.price < 0) {
    return err(new ApiError("Price cannot be negative", 400));
  }

  const tradeWithUserPasswords = await ctx.prisma.trade.create({
    data: {
      id: generateId(),
      price: request.price,
      sellerId: seller.id,
      buyerId: buyer?.id,
      nftId: nft.id,
      buyerAccepted: ctx.user.username === request.buyerUsername,
      sellerAccepted: ctx.user.username === request.sellerUsername,
    },
    include: {
      buyer: true,
      nft: true,
      seller: true,
    },
  });

  const trade = {
    ...tradeWithUserPasswords,
    seller: deleteProp(tradeWithUserPasswords.seller, "passwordHash"),
    buyer: tradeWithUserPasswords.buyer !== null
      ? deleteProp(tradeWithUserPasswords.buyer, "passwordHash")
      : null,
  };

  let eventDescription: Markdown;

  if (trade.buyer !== null && ctx.user.username === trade.buyer.username) {
    eventDescription = (
      `![${nft.seed}](${getNftImageLink(nft.seed)})\n\n` +
      `User [${trade.buyer.username}](/users/${trade.buyer.username}) wants to buy ` +
      `NFT [${trade.nft.seed}](/nfts/${trade.nft.seed}) from ` +
      `user [${trade.seller.username}](/users/${trade.seller.username}) for ` +
      `${CURRENCY_SYMBOL}${trade.price}.`
    ) as Markdown;
  } else if (trade.buyer !== null && ctx.user.username === trade.seller.username) {
    eventDescription = (
      `![${nft.seed}](${getNftImageLink(nft.seed)})\n\n` +
      `User [${trade.seller.username}](/users/${trade.seller.username}) wants to sell ` +
      `NFT [${trade.nft.seed}](/nfts/${trade.nft.seed}) to ` +
      `user [${trade.buyer.username}](/users/${trade.buyer.username}) for ` +
      `${CURRENCY_SYMBOL}${trade.price}.`
    ) as Markdown;
  } else {
    eventDescription = (
      `![${nft.seed}](${getNftImageLink(nft.seed)})\n\n` +
      `User [${trade.seller.username}](/users/${trade.seller.username}) wants to sell ` +
      `NFT [${trade.nft.seed}](/nfts/${trade.nft.seed}) for ` +
      `${CURRENCY_SYMBOL}${trade.price}.`
    ) as Markdown;
  }

  ctx.notify({
    title: "Trade created",
    description: eventDescription,
    time: new Date(),
  });

  return ok(trade);
};

export const setupCreateTradeRequest: SetupRequest<CreateTradeRequest, {}> = (req) => {
  if (!is<CreateTradeRequest>(req.body)) {
    return err(new ApiError("Invalid trade", 400));
  }

  return ok(req.body);
}

import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import { PrivateFeature } from "../../types/feature";
import { SetupRequest } from "../../utils/expressHandler";
import { Nft, Trade, User } from "@prisma/client";
import deleteProp from "../../utils/deleteProp";
import assert from "assert";
import Markdown from "../../types/Markdown";
import { CURRENCY_SYMBOL } from "../../utils/constants";

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
                }
            },
            buyer: true,
            seller: true,
            highestTradeOfNft: true,
            lastTradeOfNft: true,
        }
    });

    if (trade == null) {
        return err(new ApiError("Trade not found", 404));
    }

    assert(trade.buyer !== null);
    assert(trade.buyerId !== null);
    assert(trade.seller !== null);
    assert(trade.sellerId !== null);

    if (
        trade.sellerId !== ctx.user.id &&
        trade.buyerId !== ctx.user.id
    ) {
        return err(new ApiError("Cannot accept trade you are not participating in", 403));
    }

    if (
        (trade.sellerId === ctx.user.id && trade.sellerAccepted) ||
        (trade.buyerId === ctx.user.id && trade.buyerAccepted)
    ) {
        return err(new ApiError("Already accepted", 400));
    }

    if (trade.buyer.balance < trade.price) {
        return err(new ApiError("Insufficient funds", 400));
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
            buyerAccepted: trade.buyerAccepted || trade.buyerId === ctx.user.id,
            sellerAccepted: trade.sellerAccepted || trade.sellerId === ctx.user.id,
            soldAt: new Date(),
            buyer: {
                update: {
                    balance: trade.seller.balance - trade.price,
                }
            },
            seller: {
                update: {
                    balance: trade.seller.balance + trade.price,
                }
            },
            nft: {
                update: {
                    ownerId: trade.buyerId,
                    lastTradeId: trade.id,
                    highestTradeId: (
                        trade.nft.highestTrade === null ||
                        trade.nft.highestTrade.price <= trade.price
                    )
                        ? trade.id
                        : undefined,
                }
            }
        }
    });

    await ctx.prisma.trade.deleteMany({
        where: {
            id: trade.id,
            OR: [
                { buyerAccepted: false },
                { sellerAccepted: false }
            ]
        }
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
        title: `NFT Sold` as Markdown,
        description: (
            `[${trade.seller.username}](/users/${trade.seller.username}) sold ` +
            `["${trade.nft.seed}"](/nfts/${trade.nft.seed}) to ` +
            `[${trade.buyer.username}](/users/${trade.buyer.username}) for ` +
            `${CURRENCY_SYMBOL}${trade.price}.`
        ) as Markdown
    })

    return ok(updatedTrade);
};

export const setupAcceptTradeRequest: SetupRequest<AcceptTradeRequest, { id: string }> = (req) => {
    return ok({
        id: req.params.id,
    });
}

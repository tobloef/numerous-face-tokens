import express, { request } from "express";
import { is } from "typescript-is";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import { PrivateFeature } from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import { Nft, Trade } from "@prisma/client";
import User from "../../types/User";
import deleteProp from "../../utils/deleteProp";
import assert from "assert";

type AcceptTradeRequest = {
    tradeId: string,
};

type AcceptTradeResponse = 
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
            id: request.tradeId,
        },
        include: {
            buyer: true,
            seller: true,
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

    if (trade.buyer.balance >= trade.price) {
        return err(new ApiError("Insufficient funds", 400));
    }

    const updatedTradeWithPasswords = await ctx.prisma.trade.update({
        where: {
            id: request.tradeId,
        },
        include: {
            nft: true,
            buyer: true,
            seller: true,
        },
        data: {
            ...(trade.buyerId === ctx.user.id ? {
                buyerAccepted: true,
                buyerAcceptedAt: new Date(),
            } : {}),
            ...(trade.sellerId === ctx.user.id ? {
                sellerAccepted: true,
                sellerAcceptedAt: new Date(),
            } : {}),
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
                    ownerId: trade.buyerId
                }
            }
        }
    });

    assert(updatedTradeWithPasswords.buyer !== null);
    assert(updatedTradeWithPasswords.seller !== null);

    const updatedTrade = {
        ...updatedTradeWithPasswords,
        seller: deleteProp(updatedTradeWithPasswords.seller, "passwordHash"),
        buyer: deleteProp(updatedTradeWithPasswords.buyer, "passwordHash"),
    };

    return ok(updatedTrade);
};

export const setupAcceptTradeRequest: SetupRequest<AcceptTradeRequest> = (
    req: express.Request,
) => {
    if (!is<AcceptTradeRequest>(req.body)) {
        return err(new ApiError("Invalid trade acceptation", 400));
    }
    
    return ok(req.body);
}
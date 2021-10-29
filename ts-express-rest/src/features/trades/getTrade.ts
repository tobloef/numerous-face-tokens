import { Nft, Trade } from "@prisma/client";
import express from "express";
import { err, ok } from "neverthrow";
import { is } from "typescript-is";
import ApiError from "../../ApiError";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import deleteProp from "../../utils/deleteProp";
import User from "../../types/User";

type GetTradeRequest = {
    id: string,
};

type GetTradeResponse = 
 & Trade
 & {
    nft: Nft;
    seller: User;
    buyer: User | null;
};

export const getTrade: Feature<GetTradeRequest, GetTradeResponse> = async (
    request,
    ctx,
) => {
    const tradeWithUserPasswords = await ctx.prisma.trade.findUnique({
        where: {
            id: request.id,
        },
        include: {
            buyer: true,
            nft: true,
            seller: true,
        }
    });

    if (tradeWithUserPasswords == null) {
        return err(new ApiError("Trade not found", 404));
    }
    
    const trade = {
        ...tradeWithUserPasswords,
        seller: deleteProp(tradeWithUserPasswords.seller, "passwordHash"),
        buyer: tradeWithUserPasswords.buyer !== null
            ? deleteProp(tradeWithUserPasswords.buyer, "passwordHash")
            : null,
    };

    return ok(trade);
};

export const setupGetTradeRequest: SetupRequest<GetTradeRequest> = (
    req: express.Request,
) => {
    if (!is<string>(req.params.id)) {
        return err(new ApiError("Invalid id", 400));
    }
    
    return ok({
        id: req.params.id,
    });
}
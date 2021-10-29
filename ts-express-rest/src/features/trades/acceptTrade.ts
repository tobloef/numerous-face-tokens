import express, { request } from "express";
import { is } from "typescript-is";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import { Nft, Trade } from "@prisma/client";
import User from "../../types/User";
import deleteProp from "../../utils/deleteProp";

type AcceptTradeRequest = {
    tradeId: number,
    accepterUsername: string,
};

type AcceptTradeResponse = 
    & Trade
    & {
        nft: Nft;
        seller: User;
        buyer: User;
    };

export const acceptTrade: Feature<AcceptTradeRequest, AcceptTradeResponse> = async (
    request,
    ctx,
) => {
    const trade = await ctx.prisma.trade.findUnique({
        where: {
            id: request.tradeId,
        },
    });

    if (trade == null) {
        return err(new ApiError("Trade not found", 404));
    }
    
    if (trade.sellerId === request.accepterUsername) {

        return ok();
    } else if (trade.buyerId === request.accepterUsername) {

        return ok();
    } else {
        return err(new ApiError("Cannot accept trade you are not participating in", 400));
    }
};

export const setupAcceptTradeRequest: SetupRequest<AcceptTradeRequest> = (
    req: express.Request,
) => {
    if (!is<AcceptTradeRequest>(req.body)) {
        return err(new ApiError("Invalid trade acceptation", 400));
    }

    if (req.body.accepterUsername !== req.user.username) {
        return err(new ApiError("Cannot accept trade for someone else", 400));
    }
    
    return ok(req.body);
}
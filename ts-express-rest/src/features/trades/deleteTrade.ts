import express from "express";
import { err, ok } from "neverthrow";
import { is } from "typescript-is";
import ApiError from "../../ApiError";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import { SUCCESS, Success } from "../../utils/Success";

type GetTradeRequest = {
    id: number,
};

type GetTradeResponse = Success;

export const getTrade: Feature<GetTradeRequest, GetTradeResponse> = async (
    request,
    ctx,
) => {
    const tradeWithUserPasswords = await ctx.prisma.trade.findUnique({
        where: {
            id: request.id,
        },
    });

    if (tradeWithUserPasswords == null) {
        return err(new ApiError("Trade not found", 404));
    }
    
    await ctx.prisma.trade.delete({
        where: {
            id: request.id
        }
    });

    return ok(SUCCESS);
};

export const setupGetTradeRequest: SetupRequest<GetTradeRequest> = (
    req: express.Request,
) => {
    if (!is<number>(req.params.id)) {
        return err(new ApiError("Invalid id", 400));
    }
    
    return ok({
        id: req.params.id,
    });
}
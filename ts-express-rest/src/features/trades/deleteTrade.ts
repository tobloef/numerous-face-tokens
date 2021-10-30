import express from "express";
import { err, ok } from "neverthrow";
import { is } from "typescript-is";
import ApiError from "../../ApiError";
import { PrivateFeature } from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import { SUCCESS, Success } from "../../utils/Success";

type GetTradeRequest = {
    id: string,
};

type GetTradeResponse = Success;

export const getTrade: PrivateFeature<GetTradeRequest, GetTradeResponse> = async (
    request,
    ctx,
) => {
    const trade = await ctx.prisma.trade.findUnique({
        where: {
            id: request.id,
        },
    });

    if (trade == null) {
        return err(new ApiError("Trade not found", 404));
    }

    if (
        trade.sellerId !== ctx.user.id &&
        trade.buyerId !== ctx.user.id
    ) {
        return err(new ApiError("Cannot delete trade you are not participating in", 403));
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
    if (!is<string>(req.params.id)) {
        return err(new ApiError("Invalid id", 400));
    }
    
    return ok({
        id: req.params.id,
    });
}
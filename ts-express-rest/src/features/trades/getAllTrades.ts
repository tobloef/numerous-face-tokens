import { Trade, UserWithPassword } from ".prisma/client";
import express from "express";
import { ok } from "neverthrow";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import User from "../../types/User";
import deleteProp from "../../utils/deleteProp";
 
type GetAllTradesRequest = {
    // TODO: Filtering
};

type GetAllTradesResponse = Trade[];

export const getAllTrades: Feature<GetAllTradesRequest, GetAllTradesResponse> = async (
    request,
    ctx,
) => {
    const trades = await ctx.prisma.trade.findMany();

    return ok(trades);
};

export const setupGetAllTradesRequest: SetupRequest<GetAllTradesRequest> = (
    req: express.Request,
) => {
    return ok({});
}
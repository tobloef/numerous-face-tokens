import { Trade, UserWithPassword } from ".prisma/client";
import express from "express";
import { ok } from "neverthrow";
import { PublicFeature } from "../../types/feature";
import User from "../../types/User";
import deleteProp from "../../utils/deleteProp";
import { SetupRequest } from "../../utils/expressHandler";
 
type GetAllTradesRequest = {
    // TODO: Filtering
};

type GetAllTradesResponse = Trade[];

export const getAllTrades: PublicFeature<GetAllTradesRequest, GetAllTradesResponse> = async (
    request,
    ctx,
) => {
    const trades = await ctx.prisma.trade.findMany();

    return ok(trades);
};

export const setupGetAllTradesRequest: SetupRequest<GetAllTradesRequest, {}> = (req) => {
    return ok({});
}
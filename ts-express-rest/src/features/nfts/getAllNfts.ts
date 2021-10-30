import { Nft, UserWithPassword } from ".prisma/client";
import express from "express";
import { ok } from "neverthrow";
import { PrivateFeature, PublicFeature } from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import User from "../../types/User";
import deleteProp from "../../utils/deleteProp";
 
type GetAllNftsRequest = {
    // TODO: Filtering
};

type GetAllNftsResponse = Nft[];

export const getAllNfts: PublicFeature<GetAllNftsRequest, GetAllNftsResponse> = async (
    request,
    ctx,
) => {
    const nfts = await ctx.prisma.nft.findMany();

    return ok(nfts);
};

export const setupGetAllNftsRequest: SetupRequest<GetAllNftsRequest> = (
    req: express.Request,
) => {
    return ok({});
}
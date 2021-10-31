import { Nft, UserWithPassword } from ".prisma/client";
import express from "express";
import { ok } from "neverthrow";
import { PublicFeature } from "../../types/feature";
import { SetupRequest } from "../../utils/expressHandler";
 
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

export const setupGetAllNftsRequest: SetupRequest<GetAllNftsRequest, {}> = (req) => {
    return ok({});
}
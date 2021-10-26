import express from "express";
import { is } from "typescript-is";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import { Nft } from "@prisma/client";

type CreateNftRequest = {
    seed: string,
};

type CreateNftResponse = Nft;

export const createUser: Feature<CreateNftRequest, CreateNftResponse> = async (
    request,
    ctx,
) => {
    const nft = await ctx.prisma.nft.create({
        data: {
            
        }
    });

    return ok(nft);
};

export const setupCreateUserRequest: SetupRequest<CreateNftRequest> = (
    req: express.Request,
) => {
    if (!is<CreateNftRequest>(req.body)) {
        return err(new ApiError("Invalid NFT information", 400));
    }
    
    return ok(req.body);
}
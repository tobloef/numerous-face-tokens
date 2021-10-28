import express from "express";
import { is } from "typescript-is";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import { Nft } from "@prisma/client";

type CreateNftRequest = {
    seed: string,
    title: string,
    minterId: number,
};

type CreateNftResponse = Nft;

export const createUser: Feature<CreateNftRequest, CreateNftResponse> = async (
    request,
    ctx,
) => {
    const nft = await ctx.prisma.nft.create({
        data: {
            seed: request.seed,
            title: request.title,
            minterId: request.minterId,
            ownerId: request.minterId,
        }
    });

    return ok(nft);
};

export const setupCreateUserRequest: SetupRequest<CreateNftRequest> = (
    req: express.Request,
) => {
    type RequestWithoutMinterId = Omit<CreateNftRequest, "minterId">;

    if (!is<RequestWithoutMinterId>(req.body)) {
        return err(new ApiError("Invalid NFT", 400));
    }
    
    return ok({
        minterId: req.user.id,
        seed: req.body.seed,
        title: req.body.title,
    });
}
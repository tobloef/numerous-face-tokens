import express from "express";
import { is } from "typescript-is";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import { Nft, Trade } from "@prisma/client";
import User from "../../types/User";
import deleteProp from "../../utils/deleteProp";

type CreateNftRequest = {
    seed: string,
    title: string,
    minterId: number,
};

type CreateNftResponse = 
    & Nft
    & {
        minter: User;
        owner: User;
        trades: Trade[];
    };

export const createUser: Feature<CreateNftRequest, CreateNftResponse> = async (
    request,
    ctx,
) => {
    const existingNft = await ctx.prisma.nft.findUnique({
        where: {
            seed: request.seed,
        }
    });

    if (existingNft !== null) {
        return err(new ApiError("NFT with given seed already exists", 409));
    }

    const nftWithUserPasswords = await ctx.prisma.nft.create({
        data: {
            seed: request.seed,
            title: request.title,
            minterId: request.minterId,
            ownerId: request.minterId,
        },
        include: {
            minter: true,
            owner: true,
            trades: true,
        }
    });

    const nft = {
        ...nftWithUserPasswords,
        minter: deleteProp(nftWithUserPasswords.minter, "passwordHash"),
        owner: deleteProp(nftWithUserPasswords.owner, "passwordHash"),
    };

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
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
    minterUsername: string,
};

type CreateNftResponse = 
    & Nft
    & {
        minter: User;
        owner: User;
        trades: Trade[];
    };

export const createNft: Feature<CreateNftRequest, CreateNftResponse> = async (
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

    const user = await ctx.prisma.userWithPassword.findUnique({
        where: {
            username: request.minterUsername,
        }
    });

    if (user === null) {
        return err(new ApiError("User not found", 404));
    }

    const nftWithUserPasswords = await ctx.prisma.nft.create({
        data: {
            seed: request.seed,
            title: request.title,
            minterId: user.id,
            ownerId: user.id,
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

export const setupCreateNftRequest: SetupRequest<CreateNftRequest> = (
    req: express.Request,
) => {
    if (!is<CreateNftRequest>(req.body)) {
        return err(new ApiError("Invalid NFT", 400));
    }

    if (req.body.minterUsername !== req.user.username) {
        return err(new ApiError("Cannot create NFT for someone else", 400));
    }
    
    return ok({
        minterUsername: req.user.username,
        seed: req.body.seed,
        title: req.body.title,
    });
}
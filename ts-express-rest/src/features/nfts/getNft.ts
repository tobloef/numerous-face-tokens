import { Nft, Trade } from "@prisma/client";
import express from "express";
import { err, ok } from "neverthrow";
import { is } from "typescript-is";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/feature";
import deleteProp from "../../utils/deleteProp";
import User from "../../types/User";
import { SetupRequest } from "../../utils/expressHandler";
// du er dum skriv på discord når du ser dette 

type GetNftRequest = {
    seed: string,
};

type GetNftResponse = 
 & Nft
 & {
    minter: User;
    owner: User;
    trades: Trade[];
};

export const getNft: PublicFeature<GetNftRequest, GetNftResponse> = async (
    request,
    ctx,
) => {
    const nftWithUserPasswords = await ctx.prisma.nft.findUnique({
        where: {
            seed: request.seed,
        },
        include: {
            minter: true,
            owner: true,
            trades: true,
            lastTrade: true,
            highestTrade: true,
        }
    });

    if (nftWithUserPasswords == null) {
        return err(new ApiError("NFT not found", 404));
    }
    
    const nft = {
        ...nftWithUserPasswords,
        minter: deleteProp(nftWithUserPasswords.minter, "passwordHash"),
        owner: deleteProp(nftWithUserPasswords.owner, "passwordHash"),
    };

    return ok(nft);
};

export const setupGetNftRequest: SetupRequest<GetNftRequest, { seed: string }> = (req) => {
    return ok({
        seed: req.params.seed,
    });
}
import { Nft, Trade } from "@prisma/client";
import express from "express";
import { err, ok } from "neverthrow";
import { is } from "typescript-is";
import ApiError from "../../ApiError";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import deleteProp from "../../utils/deleteProp";
import User from "../../types/User";

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

export const getNft: Feature<GetNftRequest, GetNftResponse> = async (
    request,
    ctx,
) => {
    const nftWithPasswords = await ctx.prisma.nft.findUnique({
        where: {
            seed: request.seed,
        },
        include: {
            minter: true,
            owner: true,
            trades: true,
        }
    });

    if (nftWithPasswords == null) {
        return err(new ApiError(`No NFT found with seed "${request.seed}".`, 404));
    }
    
    const nft = {
        ...nftWithPasswords,
        minter: deleteProp(nftWithPasswords.minter, "passwordHash"),
        owner: deleteProp(nftWithPasswords.owner, "passwordHash"),
    };

    return ok(nft);
};

export const setupGetNftRequest: SetupRequest<GetNftRequest> = (
    req: express.Request,
) => {
    if (!is<string>(req.params.seed)) {
        return err(new ApiError("Invalid seed", 400));
    }
    
    return ok({
        seed: req.params.seed,
    });
}
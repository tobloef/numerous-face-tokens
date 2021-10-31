import { Nft, Trade, UserWithPassword } from "@prisma/client";
import express from "express";
import { err, ok } from "neverthrow";
import { is } from "typescript-is";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/feature";
import User from "../../types/User";
import deleteProp from "../../utils/deleteProp";
import { SetupRequest } from "../../utils/expressHandler";

type GetUserRequest = {
    username: string,
};

type GetUserResponse = 
 & User
 & {
    boughtTrades: Trade[];
    soldTrades: Trade[];
    ownedNfts: Nft[];
    mintedNfts: Nft[];
};

export const getUser: PublicFeature<GetUserRequest, GetUserResponse> = async (
    request,
    ctx,
) => {
    const user = await ctx.prisma.userWithPassword.findUnique({
        where: {
            username: request.username,
        },
        include: {
            boughtTrades: true,
            soldTrades: true,
            ownedNfts: true,
            mintedNfts: true,
        }
    });

    if (user == null) {
        return err(new ApiError(`No user found with username "${request.username}".`, 404));
    }
    
    const userWithoutPassword = deleteProp(user, "passwordHash");

    return ok(userWithoutPassword);
};

export const setupGetUserRequest: SetupRequest<GetUserRequest, { username: string }> = (req) => {
    if (!is<string>(req.params.username)) {
        return err(new ApiError("Invalid username", 400));
    }
    
    return ok({
        username: req.params.username,
    });
}
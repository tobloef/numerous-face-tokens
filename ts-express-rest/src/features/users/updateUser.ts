import { Nft, Trade, UserWithPassword } from "@prisma/client";
import express from "express";
import { is } from "typescript-is";
import { err, ok } from "neverthrow";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import ApiError from "../../ApiError";
import User from "../../types/User";
import deleteProp from "../../utils/deleteProp";
import bcrypt from "bcryptjs";

type UpdateUserRequest = {
    id: string,
    patch: {
        username?: string,
        password?: string,
    },
};

type UpdateUserResponse = 
    & User
    & {
        boughtTrades: Trade[];
        soldTrades: Trade[];
        ownedNfts: Nft[];
        mintedNfts: Nft[];
    };

export const updateUser: Feature<UpdateUserRequest, UpdateUserResponse> = async (
    request,
    ctx,
) => {
    const user = await ctx.prisma.userWithPassword.update({
        where: {
            id: request.id,
        },
        data: {
            username: request.patch.username,
            passwordHash: request.patch.password !== undefined
                ? bcrypt.hashSync(request.patch.password)
                : undefined
        },
        include: {
            boughtTrades: true,
            soldTrades: true,
            ownedNfts: true,
            mintedNfts: true,
        }
    });

    const userWithoutPassword = deleteProp(user, "passwordHash");

    return ok(userWithoutPassword);
};

export const setupUpdateUserRequest: SetupRequest<UpdateUserRequest> = (
    req: express.Request,
) => {
    if (!is<string>(req.params.id)) {
        return err(new ApiError("Invalid id", 400));
    }

    if (!is<UpdateUserRequest["patch"]>(req.body)) {
        return err(new ApiError("Invalid user", 400));
    }
    
    return ok({
        id: req.params.id,
        patch: req.body,
    });
}
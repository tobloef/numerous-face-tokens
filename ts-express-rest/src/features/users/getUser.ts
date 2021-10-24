import { UserWithPassword } from "@prisma/client";
import express from "express";
import { err, ok } from "neverthrow";
import { is } from "typescript-is";
import ApiError from "../../ApiError";
import Context from "../../types/Context";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import User from "../../types/User";
import deleteProp from "../../utils/deleteProp";

type GetUserRequest = {
    username: string,
};

type GetUserResponse = User;

export const getUser: Feature<GetUserRequest, GetUserResponse> = async (
    request: GetUserRequest,
    ctx: Context,
) => {
    const user: UserWithPassword | null = await ctx.prisma.userWithPassword.findUnique({
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

export const setupGetUserRequest: SetupRequest<GetUserRequest> = (
    req: express.Request,
) => {
    if (!is<string>(req.params.username)) {
        return err(new ApiError("Invalid username given.", 400));
    }
    
    return ok({
        username: req.params.username,
    });
}
import { UserWithPassword } from "@prisma/client";
import express from "express";
import { is } from "typescript-is";
import { err, ok } from "neverthrow";
import Context from "../../types/Context";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import ApiError from "../../ApiError";
import User from "../../types/User";
import deleteProp from "../../utils/deleteProp";
import bcrypt from "bcryptjs";

type UpdateUserRequest = {
    username: string,
    patch: {
        username?: string,
        password?: string,
    },
};

type UpdateUserResponse = User;

export const updateUser: Feature<UpdateUserRequest, UpdateUserResponse> = async (
    request,
    ctx,
) => {
    const user: UserWithPassword = await ctx.prisma.userWithPassword.update({
        where: {
            username: request.username,
        },
        data: {
            username: request.patch.username,
            passwordHash: request.patch.password !== undefined
                ? bcrypt.hashSync(request.patch.password)
                : undefined
        }
    });

    const userWithoutPassword = deleteProp(user, "passwordHash");

    return ok(userWithoutPassword);
};

export const setupUpdateUserRequest: SetupRequest<UpdateUserRequest> = (
    req: express.Request,
) => {
    if (!is<string>(req.params.username)) {
        return err(new ApiError("Invalid username", 400));
    }

    if (!is<UpdateUserRequest["patch"]>(req.body)) {
        return err(new ApiError("Invalid user", 400));
    }
    
    return ok({
        username: req.params.username,
        patch: req.body,
    });
}
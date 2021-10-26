import { UserWithPassword } from "@prisma/client";
import express from "express";
import { is } from "typescript-is";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import deleteProp from "../../utils/deleteProp";
import User from "../../types/User";
import bcrypt from "bcryptjs";


type CreateUserRequest = {
    username: string,
    password: string,
};

type CreateUserResponse = User;

export const createUser: Feature<CreateUserRequest, CreateUserResponse> = async (
    request,
    ctx,
) => {
    const user: UserWithPassword = await ctx.prisma.userWithPassword.create({
        data: {
            username: request.username,
            passwordHash: bcrypt.hashSync(request.password),
            balance: 0,
        }
    });

    const userWithoutPassword = deleteProp(user, "passwordHash");

    return ok(userWithoutPassword);
};

export const setupCreateUserRequest: SetupRequest<CreateUserRequest> = (
    req: express.Request,
) => {
    if (!is<CreateUserRequest>(req.body)) {
        return err(new ApiError("Invalid user information", 400));
    }
    
    return ok(req.body);
}
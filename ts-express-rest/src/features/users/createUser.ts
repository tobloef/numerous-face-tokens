import { User } from "@prisma/client";
import express from "express";
import { ok } from "neverthrow";
import Context from "../../types/Context";
import Feature from "../../types/feature";
import Never from "../../types/Never";
import SetupRequest from "../../types/SetupRequest";
import deleteProp from "../../utils/deleteProp";

type CreateUserRequest = {
    username: string,
    password: string,
};

type CreateUserResponse = Never<User, "passwordHash">;

export const createUser: Feature<CreateUserRequest, CreateUserResponse> = async (
    request: CreateUserRequest,
    ctx: Context,
) => {
    const user: User = await ctx.prisma.user.create({
        data: {
            username: request.username,
            passwordHash: request.password,
            balance: 0,
        }
    });

    const userWithoutPassword = deleteProp(user, "passwordHash");

    return ok(userWithoutPassword);
};

export const setupCreateUserRequest: SetupRequest<CreateUserRequest> = (
    req: express.Request,
    res: express.Response,
) => {
    
}
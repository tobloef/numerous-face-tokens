import { UserWithPassword } from ".prisma/client";
import express from "express";
import { ok } from "neverthrow";
import Context from "../../types/Context";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import User from "../../types/User";
import deleteProp from "../../utils/deleteProp";

type GetAllUsersRequest = undefined;

type GetAllUsersResponse = User[];

export const getAllUsers: Feature<GetAllUsersRequest, GetAllUsersResponse> = async (
    request: GetAllUsersRequest,
    ctx: Context,
) => {
    const userWithPasswords: UserWithPassword[] = await ctx.prisma.userWithPassword.findMany();

    const users = userWithPasswords.map((user) => deleteProp(user, "passwordHash"));

    return ok(users);
};

export const setupGetAllUsersRequest: SetupRequest<GetAllUsersRequest> = (
    req: express.Request,
) => {
    return ok(undefined);
}
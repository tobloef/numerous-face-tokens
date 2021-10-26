import { UserWithPassword } from ".prisma/client";
import express from "express";
import { ok } from "neverthrow";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import User from "../../types/User";
import deleteProp from "../../utils/deleteProp";
 
// TODO: Move these types elsewhere when finished
type Sorts<Keys extends string | number | symbol> = Partial<Record<Keys, "desc" | "asc">>
type FilterOps = {
    gt: number | Date,
    gte: number | Date,
    lt: number | Date,
    lte: number | Date,
    eq: string | number | Date,
    search: string,
};
type Filters<Keys extends string | number | symbol> = Partial<Record<Keys, Partial<FilterOps>>>;

type GetAllUsersRequest = {
    page?: number,
    limit?: number,
    sorts?: Sorts<
        | "username"
        | "createdAt"
        | "ownedNftsCount"
        | "mintedNftsCount"
    >,
    filters?: Filters<
        | "username" // TODO: This is not how this type should work
    >
};

type GetAllUsersResponse = User[];

export const getAllUsers: Feature<GetAllUsersRequest, GetAllUsersResponse> = async (
    request,
    ctx,
) => {
    const userWithPasswords: UserWithPassword[] = await ctx.prisma.userWithPassword.findMany();

    const users = userWithPasswords.map((user) => deleteProp(user, "passwordHash"));

    return ok(users);
};

export const setupGetAllUsersRequest: SetupRequest<GetAllUsersRequest> = (
    req: express.Request,
) => {
    return ok({});
}
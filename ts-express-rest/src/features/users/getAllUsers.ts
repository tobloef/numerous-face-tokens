import { UserWithPassword } from ".prisma/client";
import express from "express";
import { err, ok } from "neverthrow";
import { assertType, is } from "typescript-is";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/feature";
import Never from "../../types/Never";
import User from "../../types/User";
import deleteProp from "../../utils/deleteProp";
import { SetupRequest } from "../../utils/expressHandler";
 
// TODO: Move these types elsewhere when finished
type Sorts<Keys extends string | number | symbol> = Partial<Record<Keys, "desc" | "asc">>

type NumberFilterOps = {
    gt: number,
    gte: number,
    lt: number,
    lte: number,
    eq: number,
};

type StringFilterOps = {
    eq: string,
    search: string,
}

type DateFilterOps = {
    gt: Date,
    gte: Date,
    lt: Date,
    lte: Date,
    eq: Date,
}

type FilterOps<T> = T extends string
    ? StringFilterOps
    : (T extends number
        ? NumberFilterOps
        : (T extends Date
            ? DateFilterOps
            : never
        )
    );

// TODO: Make it so you can't pass in "sorts" | "limit" | "page" | "filters"
type Filters<Keys extends string> = Partial<Record<Keys, Partial<FilterOps>>>

type GetAllUsersRequest = 
    & {
        page?: number,
        limit?: number,
    }
    & {
        sorts?: Sorts<
            | "username"
            | "createdAt"
            | "ownedNftsCount"
            | "mintedNftsCount"
        >
    }
    & Filters<
        | "username"
    >;

type GetAllUsersResponse = User[];

export const getAllUsers: PublicFeature<GetAllUsersRequest, GetAllUsersResponse> = async (
    request,
    ctx,
) => {
    const userWithPasswords: UserWithPassword[] = await ctx.prisma.userWithPassword.findMany({
        where: queryToPrismaFilters(request.)
    });

    const users = userWithPasswords.map((user) => deleteProp(user, "passwordHash"));

    return ok(users);
};

export const setupGetAllUsersRequest: SetupRequest<GetAllUsersRequest, {}> = (req) => {
    console.debug(req.query);

    assertType<GetAllUsersRequest>(req.query);

    if (!is<GetAllUsersRequest>(req.query)) {
        return err(new ApiError("Invalid query", 400));
    }

    return ok(req.query)
}
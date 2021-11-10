import { Prisma, User } from "@prisma/client";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/feature";
import { DEFAULT_TAKE } from "../../utils/constants";
import { SetupRequest } from "../../utils/expressHandler";
import { createQueryProp, parseNumber, parseDate, parseFilters, parseIfDefined, parseSort, SortOrder, parseString, createToWhereMap } from "../../utils/query";

export type GetAllUsersRequest = {
    skip?: number,
    take: number,
    sort: Array<OrderBy>,
    filters?: Where,
}

export type OverviewUserDto = {
    username: string,
    createdAt: Date,
    balance: number,
    ownedNftsCount: number,
    mintedNftsCount: number,
};

export type GetAllUsersResponse = OverviewUserDto[];

export const getAllUsers: PublicFeature<GetAllUsersRequest, GetAllUsersResponse> = async (
    request,
    ctx,
) => {
    const users: User[] = await ctx.prisma.user.findMany({
        take: request.take,
        skip: request.skip,
        orderBy: request.sort,
        where: request.filters,
    });

    return ok(users);
};

export const setupGetAllUsersRequest: SetupRequest<GetAllUsersRequest, {}> = (req) => {
    const { take, skip, sort, ...filters } = req.query;

    const takeResult = parseIfDefined(take, parseNumber);
    const skipResult = parseIfDefined(skip, parseNumber);
    const sortResult = parseIfDefined(sort, (input) => parseSort(input, queryPropMap));
    const filtersResult = parseIfDefined(filters, (input) => parseFilters(input, queryPropMap));

    if (takeResult.isErr()) {
        return err(new ApiError(`Invalid 'take' query parameter. ${takeResult.error}.`, 400));
    }
    if (skipResult.isErr()) {
        return err(new ApiError(`Invalid 'skip' query parameter. ${skipResult.error}.`, 400));
    }
    if (sortResult.isErr()) {
        return err(new ApiError(`Invalid 'sort' query parameter. ${sortResult.error}.`, 400));
    }
    if (filtersResult.isErr()) {
        return err(new ApiError(`Invalid 'filters' query parameter. ${filtersResult.error}.`, 400));
    }

    return ok({
        take: takeResult.value ?? DEFAULT_TAKE,
        skip: skipResult.value,
        sort: sortResult.value ?? [{ createdAt: "desc" }],
        filters: filtersResult.value,
    });
}

type OrderBy = Prisma.UserOrderByWithRelationInput;
type Where = Prisma.UserWhereInput;

const queryPropMap = {
    username: createQueryProp({
        deserialize: parseString,
        toOrderBy: (order: SortOrder): OrderBy => ({ username: order }),
        toWhere: createToWhereMap(
            ["equals", "contains"],
            (val: string, op: string): Where => ({ username: { [op]: val } })
        ),
    }),
    createdAt: createQueryProp({
        deserialize: parseDate,
        toOrderBy: (order: SortOrder): OrderBy => ({ createdAt: order }),
        toWhere: createToWhereMap(
            ["equals", "gt", "gte", "lt", "lte"],
            (val: Date, op: string): Where => ({ createdAt: { [op]: val } })
        ),
    }),
    balance: createQueryProp({
        deserialize: parseNumber,
        toOrderBy: (order: SortOrder): OrderBy => ({ balance: order }),
        toWhere: createToWhereMap(
            ["equals", "gt", "gte", "lt", "lte"],
            (val: number, op: string): Where => ({ balance: { [op]: val } })
        ),
    }),
    ownedNftsCount: createQueryProp<number, OrderBy, Where>({
        deserialize: parseNumber,
        toOrderBy: (order: SortOrder): OrderBy => ({ ownedNfts: { _count: order } }),
    }),
    mintedNftsCount: createQueryProp<number, OrderBy, Where>({
        deserialize: parseNumber,
        toOrderBy: (order: SortOrder): OrderBy =>  ({ mintedNfts: { _count: order } }),
    }),
} as const;

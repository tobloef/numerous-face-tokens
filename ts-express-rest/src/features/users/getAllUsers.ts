import { Prisma, UserWithPassword } from "@prisma/client";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/feature";
import User from "../../types/User";
import { DEFAULT_TAKE } from "../../utils/constants";
import deleteProp from "../../utils/deleteProp";
import { SetupRequest } from "../../utils/expressHandler";
import { createQueryProp, parseNumber, parseDate, parseFilters, parseIfDefined, parseSort, SortOrder, parseString, createToWhereMap } from "../../utils/query";

type GetAllUsersRequest = {
    skip?: number,
    take: number,
    sort: Array<OrderBy>,
    filters?: Where,
}

type GetAllUsersResponse = User[];

export const getAllUsers: PublicFeature<GetAllUsersRequest, GetAllUsersResponse> = async (
    request,
    ctx,
) => {
    const userWithPasswords: UserWithPassword[] = await ctx.prisma.userWithPassword.findMany({
        take: request.take,
        skip: request.skip,
        orderBy: request.sort,
        where: request.filters,
    });

    const users: User[] = userWithPasswords.map((user) => deleteProp(user, "passwordHash"));

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

type OrderBy = Prisma.UserWithPasswordOrderByWithRelationInput;
type Where = Prisma.UserWithPasswordWhereInput;

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
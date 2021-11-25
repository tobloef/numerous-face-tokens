import { Prisma } from "@prisma/client";
import {
  err,
  ok,
} from "neverthrow";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/feature";
import { DEFAULT_TAKE } from "../../utils/constants";
import { SetupRequest } from "../../utils/expressHandler";
import {
  createToWhereMap,
  filtersToWhere,
  parseDate,
  parseFilters,
  parseIfDefined,
  parseNumber,
  parseSort,
  parseString,
  QueryFilters,
  QuerySort,
  SortOrder,
} from "../../utils/query";

export type GetAllUsersSort = QuerySort<typeof queryPropMap>;

export type GetAllUsersFilters = QueryFilters<typeof queryPropMap>;

export type GetAllUsersRequest = {
  skip?: number,
  take: number,
  sorts: GetAllUsersSort[],
  filters?: GetAllUsersFilters,
}

export type OverviewUserDto = {
  username: string,
  createdAt: Date,
  balance: number,
  ownedNftsCount: number,
  mintedNftsCount: number,
};

export type GetAllUsersResponse = {
  users: OverviewUserDto[],
  totalCount: number,
};

export const getAllUsers: PublicFeature<GetAllUsersRequest, GetAllUsersResponse> = async (
  request,
  ctx,
) => {
  const where = filtersToWhere<typeof queryPropMap, Where>(request.filters ?? {}, queryPropMap);
  const orderBy = request.sorts.map(([key, order]) => queryPropMap[key].toOrderBy(order));

  const users = await ctx.prisma.user.findMany({
    take: request.take,
    skip: request.skip,
    orderBy,
    where,
    include: {
      _count: {
        select: {
          mintedNfts: true,
          ownedNfts: true,
        },
      },
    },
  });

  const userDtos: OverviewUserDto[] = users.map((user) => ({
    username: user.username,
    createdAt: user.createdAt,
    balance: user.balance,
    mintedNftsCount: user._count?.mintedNfts ?? 0,
    ownedNftsCount: user._count?.ownedNfts ?? 0,
  }));

  const totalCount: number = await ctx.prisma.user.count({
    where,
  });

  return ok({
    users: userDtos,
    totalCount,
  });
};

export const setupGetAllUsersRequest: SetupRequest<GetAllUsersRequest, {}> = (req) => {
  const {take, skip, sorts, ...filters} = req.query;

  const takeResult = parseIfDefined(take, parseNumber);
  const skipResult = parseIfDefined(skip, parseNumber);
  const sortResult = parseIfDefined(sorts, (input) => parseSort(input, queryPropMap));
  const filtersResult = parseIfDefined(filters, (input) => parseFilters(input, queryPropMap));

  if (takeResult.isErr()) {
    return err(new ApiError(`Invalid 'take' query parameter. ${takeResult.error}.`, 400));
  }
  if (skipResult.isErr()) {
    return err(new ApiError(`Invalid 'skip' query parameter. ${skipResult.error}.`, 400));
  }
  if (sortResult.isErr()) {
    return err(new ApiError(`Invalid 'sorts' query parameter. ${sortResult.error}.`, 400));
  }
  if (filtersResult.isErr()) {
    return err(new ApiError(`Invalid 'filters' query parameter. ${filtersResult.error}.`, 400));
  }

  return ok({
    take: takeResult.value ?? DEFAULT_TAKE,
    skip: skipResult.value,
    sorts: sortResult.value ?? [["createdAt", "desc"]],
    filters: filtersResult.value,
  });
}

type OrderBy = Prisma.UserOrderByWithRelationInput;
type Where = Prisma.UserWhereInput;

const queryPropMap = {
  username: {
    deserialize: parseString,
    toOrderBy: (order: SortOrder): OrderBy => ({username: order}),
    toWhere: createToWhereMap(
      ["equals", "contains"] as const,
      (val: string, op: string): Where => ({username: {[op]: val}}),
    ),
  },
  createdAt: {
    deserialize: parseDate,
    toOrderBy: (order: SortOrder): OrderBy => ({createdAt: order}),
    toWhere: createToWhereMap(
      ["equals", "gt", "gte", "lt", "lte"] as const,
      (val: Date, op: string): Where => ({createdAt: {[op]: val}}),
    ),
  },
  balance: {
    deserialize: parseNumber,
    toOrderBy: (order: SortOrder): OrderBy => ({balance: order}),
    toWhere: createToWhereMap(
      ["equals", "gt", "gte", "lt", "lte"] as const,
      (val: number, op: string): Where => ({balance: {[op]: val}}),
    ),
  },
  ownedNftsCount: {
    deserialize: parseNumber,
    toOrderBy: (order: SortOrder): OrderBy => ({ownedNfts: {_count: order}}),
  },
  mintedNftsCount: {
    deserialize: parseNumber,
    toOrderBy: (order: SortOrder): OrderBy => ({mintedNfts: {_count: order}}),
  },
} as const;

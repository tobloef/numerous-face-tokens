import { Prisma } from "@prisma/client";
import {
  err,
  ok,
} from "neverthrow";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/Feature";
import { DEFAULT_TAKE } from "../../utils/constants";
import SetupRequest from "../../types/SetupRequest";
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

export type GetAllNftsSort = QuerySort<typeof queryPropMap>;

export type GetAllNftsFilters = QueryFilters<typeof queryPropMap>;

export type GetAllNftsRequest = {
  skip?: number,
  take: number,
  sorts: GetAllNftsSort[],
  filters?: GetAllNftsFilters,
};

export type OverviewNftDTO = {
  seed: string
  mintedAt: Date
  ownerUsername: string
  highestSellPrice?: number
};

export type GetAllNftsResponse = {
  nfts: OverviewNftDTO[],
  totalCount: number,
};

export const getAllNfts: PublicFeature<GetAllNftsRequest, GetAllNftsResponse> = async (
  request,
  ctx,
) => {
  const where = filtersToWhere<typeof queryPropMap, Where>(request.filters ?? {}, queryPropMap);
  const orderBy = request.sorts.map(([key, order]) => queryPropMap[key].toOrderBy(order));

  const nfts = await ctx.prisma.nft.findMany({
    take: request.take,
    skip: request.skip,
    orderBy,
    where,
    include: {
      minter: {
        select: {
          username: true,
        },
      },
      owner: {
        select: {
          username: true,
        },
      },
      highestTrade: {
        select: {
          price: true,
        },
      },
    },
  });

  const nftDtos = nfts.map((nft) => ({
    seed: nft.seed,
    minterUsername: nft.minter.username,
    mintedAt: nft.mintedAt,
    ownerUsername: nft.owner.username,
    highestTradePrice: nft.highestTrade?.price,
  }));

  const totalCount: number = await ctx.prisma.nft.count({
    where,
  });

  return ok({
    nfts: nftDtos,
    totalCount,
  });
};

export const setupGetAllNftsRequest: SetupRequest<GetAllNftsRequest, {}> = (req) => {
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
    sorts: sortResult.value ?? [["mintedAt", "desc"]],
    filters: filtersResult.value,
  });
}

type OrderBy = Prisma.NftOrderByWithRelationInput;
type Where = Prisma.NftWhereInput;

const queryPropMap = {
  seed: {
    deserialize: parseString,
    toOrderBy: (order: SortOrder): OrderBy => ({seed: order}),
    toWhere: createToWhereMap(
      ["equals", "contains"],
      (val: string, op: string): Where => ({seed: {[op]: val}}),
    ),
  },
  mintedAt: {
    deserialize: parseDate,
    toOrderBy: (order: SortOrder): OrderBy => ({mintedAt: order}),
    toWhere: createToWhereMap(
      ["equals", "gt", "gte", "lt", "lte"],
      (val: Date, op: string): Where => ({mintedAt: {[op]: val}}),
    ),
  },
  lastSellPrice: {
    deserialize: parseNumber,
    toOrderBy: (order: SortOrder): OrderBy => ({lastTrade: {price: order}}),
    toWhere: createToWhereMap(
      ["equals", "gt", "gte", "lt", "lte"],
      (val: number, op: string): Where => ({lastTrade: {price: {[op]: val}}}),
    ),
  },
  lastSoldAt: {
    deserialize: parseDate,
    toOrderBy: (order: SortOrder): OrderBy => ({lastTrade: {soldAt: order}}),
    toWhere: createToWhereMap(
      ["equals", "gt", "gte", "lt", "lte"],
      (val: Date, op: string): Where => ({lastTrade: {soldAt: {[op]: val}}}),
    ),
  },
  highestSellPrice: {
    deserialize: parseNumber,
    toOrderBy: (order: SortOrder): OrderBy => ({highestTrade: {price: order}}),
    toWhere: createToWhereMap(
      ["equals", "gt", "gte", "lt", "lte"],
      (val: number, op: string): Where => ({highestTrade: {price: {[op]: val}}}),
    ),
  },
  ownerUsername: {
    deserialize: parseString,
    toOrderBy: (order: SortOrder): OrderBy => ({owner: {username: order}}),
    toWhere: createToWhereMap(
      ["equals", "gt", "gte", "lt", "lte"],
      (val: string, op: string): Where => ({owner: {username: {[op]: val}}}),
    ),
  },
} as const;

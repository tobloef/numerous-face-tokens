import { Nft, Prisma } from "@prisma/client";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/feature";
import { DEFAULT_TAKE } from "../../utils/constants";
import { SetupRequest } from "../../utils/expressHandler";
import {
    parseDate,
    parseNumber,
    parseIfDefined,
    parseSort,
    parseFilters,
    SortOrder,
    parseString,
    createToWhereMap,
    QuerySorts,
    QueryFilters,
    filtersToWhere,
} from "../../utils/query";

export type GetAllNftsRequest = {
    skip?: number,
    take: number,
    sorts: QuerySorts<typeof queryPropMap>,
    filters?: QueryFilters<typeof queryPropMap>,
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
    const nfts = await ctx.prisma.nft.findMany({
        take: request.take,
        skip: request.skip,
        orderBy: request.sorts.map(([key, order]) => queryPropMap[key].toOrderBy(order)),
        where: filtersToWhere<typeof queryPropMap, Where>(request.filters ?? {}, queryPropMap),
        include: {
            minter: {
                select: {
                    username: true,
                }
            },
            owner: {
                select: {
                    username: true,
                }
            },
            highestTrade: {
                select: {
                    price: true,
                }
            },
        }
    });

    const nftDtos = nfts.map((nft) => ({
        seed: nft.seed,
        minterUsername: nft.minter.username,
        mintedAt: nft.mintedAt,
        ownerUsername: nft.owner.username,
        highestTradePrice: nft.highestTrade?.price,
    }));

    const totalCount: number = await ctx.prisma.nft.count({
        where: request.filters,
    });

    return ok({
        nfts: nftDtos,
        totalCount
    });
};

export const setupGetAllNftsRequest: SetupRequest<GetAllNftsRequest, {}> = (req) => {
    const { take, skip, sorts, ...filters } = req.query;

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
        toOrderBy: (order: SortOrder): OrderBy => ({ seed: order }),
        toWhere: createToWhereMap(
            ["equals", "contains"],
            (val: string, op: string): Where => ({ seed: { [op]: val } })
        ),
    },
    mintedAt: {
        deserialize: parseDate,
        toOrderBy: (order: SortOrder): OrderBy => ({ mintedAt: order }),
        toWhere: createToWhereMap(
            ["equals", "gt", "gte", "lt", "lte"],
            (val: Date, op: string): Where => ({ mintedAt: { [op]: val } })
        ),
    },
    lastSellPrice: {
        deserialize: parseNumber,
        toOrderBy: (order: SortOrder): OrderBy => ({ lastTrade: { price: order } }),
        toWhere: createToWhereMap(
            ["equals", "gt", "gte", "lt", "lte"],
            (val: number, op: string): Where => ({ lastTrade: { price: { [op]: val } } })
        ),
    },
    lastSoldAt: {
        deserialize: parseDate,
        toOrderBy: (order: SortOrder): OrderBy => ({ lastTrade: { soldAt: order } }),
        toWhere: createToWhereMap(
            ["equals", "gt", "gte", "lt", "lte"],
            (val: Date, op: string): Where => ({ lastTrade: { soldAt: { [op]: val } } })
        ),
    },
    highestSellPrice: {
        deserialize: parseNumber,
        toOrderBy: (order: SortOrder): OrderBy => ({ highestTrade: { price: order } }),
        toWhere: createToWhereMap(
            ["equals", "gt", "gte", "lt", "lte"],
            (val: number, op: string): Where => ({ highestTrade: { price: { [op]: val } } })
        ),
    },
    ownerUsername: {
        deserialize: parseString,
        toOrderBy: (order: SortOrder): OrderBy => ({ owner: { username: order } }),
        toWhere: createToWhereMap(
            ["equals", "gt", "gte", "lt", "lte"],
            (val: string, op: string): Where => ({ owner: { username: { [op]: val } } })
        ),
    },
} as const;

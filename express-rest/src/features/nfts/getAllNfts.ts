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
    Sort,
    Filters,
} from "../../utils/query";

type GetAllNftsRequest = {
    skip?: number,
    take: number,
    sort: Sort<typeof queryPropMap>,
    filters?: Filters<typeof queryPropMap>,
};

type GetAllNftsResponse = Nft[];

export const getAllNfts: PublicFeature<GetAllNftsRequest, GetAllNftsResponse> = async (
    request,
    ctx,
) => {
    const nfts = await ctx.prisma.nft.findMany({
        take: request.take,
        skip: request.skip,
        orderBy: request.sort,
        where: request.filters,
    });

    return ok(nfts);
};

export const setupGetAllNftsRequest: SetupRequest<GetAllNftsRequest, {}> = (req) => {
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
        sort: sortResult.value ?? [{ mintedAt: "desc" }],
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
    title: {
        deserialize: parseString,
        toOrderBy: (order: SortOrder): OrderBy => ({ title: order }),
        toWhere: createToWhereMap(
            ["equals", "contains"],
            (val: string, op: string): Where => ({ title: { [op]: val } })
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

import { Nft, Prisma } from "@prisma/client";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/feature";
import { DEFAULT_TAKE } from "../../utils/constants";
import { SetupRequest } from "../../utils/expressHandler";
import { identityResult } from "../../utils/identity";
import { createQueryProp, parseDate, parseNumber, parseIfDefined, parseSort, parseFilters, SortOrder } from "../../utils/query";

type GetAllNftsRequest = {
    skip?: number,
    take: number,
    sort: Array<OrderBy>,
    filters?: Where,
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
    seed: createQueryProp({
        toWhere: {
            equals: (value: string): Where => ({ seed: { equals: value } }),
            contains: (value: string): Where => ({ seed: { contains: value } }),
        },
        toOrderBy: (order: SortOrder): OrderBy => ({ seed: order }),
        deserialize: identityResult,
    }),
    title: createQueryProp({
        toWhere: {
            equals: (value: string): Where => ({ title: { equals: value } }),
            contains: (value: string): Where => ({ title: { contains: value } }),
        },
        toOrderBy: (order: SortOrder): OrderBy => ({ title: order }),
        deserialize: identityResult,
    }),
    mintedAt: createQueryProp({
        toWhere: {
            equals: (val: Date): Where => ({ mintedAt: { equals: val } }),
            gt: (val: Date): Where => ({ mintedAt: { gt: val } }),
            gte: (val: Date): Where => ({ mintedAt: { gte: val } }),
            lt: (val: Date): Where => ({ mintedAt: { lt: val } }),
            lte: (val: Date): Where => ({ mintedAt: { lte: val } }),
        },
        toOrderBy: (order: SortOrder): OrderBy => ({ mintedAt: order }),
        deserialize: parseDate,
    }),
    lastSellPrice: createQueryProp({
         toWhere: {
            equals: (val: number): Where => ({ lastTrade: { price: { equals: val } } }),
            gt: (val: number): Where => ({ lastTrade: { price: { gt: val } } }),
            gte: (val: number): Where => ({ lastTrade: { price: { gte: val } } }),
            lt: (val: number): Where => ({ lastTrade: { price: { lt: val } } }),
            lte: (val: number): Where => ({ lastTrade: { price: { lte: val } } }),
        },
        toOrderBy: (order: SortOrder): OrderBy => ({ lastTrade: { price: order } }),
        deserialize: parseNumber,
    }),
    lastSoldAt: createQueryProp({
         toWhere: {
            equals: (val: Date): Where => ({ lastTrade: { soldAt: { equals: val } } }),
            gt: (val: Date): Where => ({ lastTrade: { soldAt: { gt: val } } }),
            gte: (val: Date): Where => ({ lastTrade: { soldAt: { gte: val } } }),
            lt: (val: Date): Where => ({ lastTrade: { soldAt: { lt: val } } }),
            lte: (val: Date): Where => ({ lastTrade: { soldAt: { lte: val } } }),
        },
        toOrderBy: (order: SortOrder): OrderBy => ({ lastTrade: { soldAt: order } }),
        deserialize: parseDate,
    }),
    highestSellPrice: createQueryProp({
         toWhere: {
            equals: (val: number): Where => ({ highestTrade: { price: { equals: val } } }),
            gt: (val: number): Where => ({ highestTrade: { price: { gt: val } } }),
            gte: (val: number): Where => ({ highestTrade: { price: { gte: val } } }),
            lt: (val: number): Where => ({ highestTrade: { price: { lt: val } } }),
            lte: (val: number): Where => ({ highestTrade: { price: { lte: val } } }),
        },
        toOrderBy: (order: SortOrder): OrderBy => ({ highestTrade: { price: order } }),
        deserialize: parseNumber,
    }),
    ownerUsername: createQueryProp({
         toWhere: {
            equals: (val: string): Where => ({ owner: { username: { equals: val } } }),
            contains: (val: string): Where => ({ owner: { username: { contains: val } } }),
        },
        toOrderBy: (order: SortOrder): OrderBy => ({ owner: { username: order } }),
        deserialize: identityResult,
    }),
} as const;
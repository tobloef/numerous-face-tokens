import { Nft, Prisma } from "@prisma/client";
import { err, ok } from "neverthrow";
import { PublicFeature } from "../../types/feature";
import { DEFAULT_TAKE } from "../../utils/constants";
import { SetupRequest } from "../../utils/expressHandler";
import { Filters, parseFiltersIfDefined } from "../../utils/request/filters";
import { Skip, parseSkipIfDefined } from "../../utils/request/skip";
import { parseSortIfDefined, Sort, SortOrder } from "../../utils/request/sort";
import { Take, parseTakeIfDefined } from "../../utils/request/take";
 
type OrderBy = Prisma.NftOrderByWithRelationInput;
type Where = Prisma.NftWhereInput;
type SortKeyToOrderByMap = typeof sortKeyToOrderByMap;
type FilterKeyToWhereMap = typeof filterKeyToWhereMap;

const sortKeyToOrderByMap = {
    "seed": (o: SortOrder): OrderBy => ({ seed: o }),
    "title": (o: SortOrder): OrderBy => ({ title: o }),
    "mintedAt": (o: SortOrder): OrderBy => ({ mintedAt: o }),
    "lastSellPrice": (o: SortOrder): OrderBy => ({ lastTrade: { price: o } }),
    "lastSoldAt": (o: SortOrder): OrderBy => ({ lastTrade: { soldAt: o } }),
    "highestSellPrice": (o: SortOrder): OrderBy => ({ highestTrade: { price: o } }),
    "ownerUsername": (o: SortOrder): OrderBy => ({ owner: { username: o } }),
} as const;

const filterKeyToWhereMap = {
    "seed": {
        equals: (val: string): Where => ({ seed: { equals: val } }),
        contains: (val: string): Where => ({ seed: { contains: val } }),
    },
    "title": {
        equals: (val: string): Where => ({ title: { equals: val } }),
        contains: (val: string): Where => ({ title: { contains: val } }),
    },
    "mintedAt": {
        equals: (val: Date): Where => ({ mintedAt: { equals: val } }),
        gt: (val: Date): Where => ({ mintedAt: { gt: val } }),
        gte: (val: Date): Where => ({ mintedAt: { gte: val } }),
        lt: (val: Date): Where => ({ mintedAt: { lt: val } }),
        lte: (val: Date): Where => ({ mintedAt: { lte: val } }),
    },
    "lastSellPrice": {
        equals: (val: number): Where => ({ lastTrade: { price: { equals: val } } }),
        gt: (val: number): Where => ({ lastTrade: { price: { gt: val } } }),
        gte: (val: number): Where => ({ lastTrade: { price: { gte: val } } }),
        lt: (val: number): Where => ({ lastTrade: { price: { lt: val } } }),
        lte: (val: number): Where => ({ lastTrade: { price: { lte: val } } }),
    },
    "lastSoldAt": {
        equals: (val: Date): Where => ({ lastTrade: { soldAt: { equals: val } } }),
        gt: (val: Date): Where => ({ lastTrade: { soldAt: { gt: val } } }),
        gte: (val: Date): Where => ({ lastTrade: { soldAt: { gte: val } } }),
        lt: (val: Date): Where => ({ lastTrade: { soldAt: { lt: val } } }),
        lte: (val: Date): Where => ({ lastTrade: { soldAt: { lte: val } } }),
    },
    "highestSellPrice": {
        equals: (val: number): Where => ({ highestTrade: { price: { equals: val } } }),
        gt: (val: number): Where => ({ highestTrade: { price: { gt: val } } }),
        gte: (val: number): Where => ({ highestTrade: { price: { gte: val } } }),
        lt: (val: number): Where => ({ highestTrade: { price: { lt: val } } }),
        lte: (val: number): Where => ({ highestTrade: { price: { lte: val } } }),
    },
    "ownerUsername": {
        equals: (val: string): Where => ({ owner: { username: { equals: val } } }),
        contains: (val: string): Where => ({ owner: { username: { contains: val } } }),
    },
} as const;

type GetAllNftsRequest = {
    skip: Skip,
    take: Take,
    sort: Sort<SortKeyToOrderByMap, keyof SortKeyToOrderByMap, OrderBy>,
    filters: Filters<FilterKeyToWhereMap, Where>,
};

type GetAllNftsResponse = Nft[];

export const getAllNfts: PublicFeature<GetAllNftsRequest, GetAllNftsResponse> = async (
    request,
    ctx,
) => {
    const nfts = await ctx.prisma.nft.findMany({
        take: request.take,
        skip: request.skip,
        orderBy: request.sort.map(([key, order]) => sortKeyToOrderByMap[key](order)),
        where: request.filters,
    });

    return ok(nfts);
};

export const setupGetAllNftsRequest: SetupRequest<GetAllNftsRequest, {}> = (req) => {
    const {
        take: unparsedTake,
        skip: unparsedSkip,
        sort: unparsedSort,
        ...unparsedFilters
    } = req.query;

    const takeResult = parseTakeIfDefined(unparsedTake);
    const skipResult = parseSkipIfDefined(unparsedSkip);
    const sortResult = parseSortIfDefined(unparsedSort, sortKeyToOrderByMap);
    const filtersResult = parseFiltersIfDefined(unparsedFilters, filterKeyToWhereMap);

    if (sortResult.isErr()) {
        return err(sortResult.error);
    }
    if (takeResult.isErr()) {
        return err(takeResult.error);
    }
    if (skipResult.isErr()) {
        return err(skipResult.error);
    }
    if (filtersResult.isErr()) {
        return err(filtersResult.error);
    }
    
    return ok({
        take: takeResult.value ?? DEFAULT_TAKE,
        skip: skipResult.value,
        sort: sortResult.value ?? [["mintedAt", "desc"]],
        filters: filtersResult.value,
    })
}
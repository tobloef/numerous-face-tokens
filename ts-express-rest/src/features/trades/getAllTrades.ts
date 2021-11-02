import { Trade, Prisma } from "@prisma/client";
import { err, ok } from "neverthrow";
import { PublicFeature } from "../../types/feature";
import { DEFAULT_TAKE } from "../../utils/constants";
import { SetupRequest } from "../../utils/expressHandler";
import { Filters, parseFiltersIfDefined } from "../../utils/request/filters";
import { Skip, parseSkipIfDefined } from "../../utils/request/skip";
import { parseSortIfDefined, Sort, SortOrder } from "../../utils/request/sort";
import { Take, parseTakeIfDefined } from "../../utils/request/take";
 
type OrderBy = Prisma.TradeOrderByWithRelationInput;
type Where = Prisma.TradeWhereInput;
type SortKeyToOrderByMap = typeof sortKeyToOrderByMap;
type FilterKeyToWhereMap = typeof filterKeyToWhereMap;

const sortKeyToOrderByMap = {
    "nftSeed": (o: SortOrder): OrderBy => ({ nft: { seed: o } }),
    "price": (o: SortOrder): OrderBy => ({ price: o }),
    "buyerUsername": (o: SortOrder): OrderBy => ({ buyer: { username: o } }),
    "sellerUsername": (o: SortOrder): OrderBy => ({ seller: { username: o } }),
    "createdAt": (o: SortOrder): OrderBy =>  ({ createdAt: o }),
    "sellerAccepted": (o: SortOrder): OrderBy =>  ({ sellerAccepted: o }),
    "buyerAccepted": (o: SortOrder): OrderBy =>  ({ buyerAccepted: o }),
} as const;

const filterKeyToWhereMap = {
    "nftSeed": {
        equals: (val: string): Where => ({ nft: { seed: { equals: val } } }),
        contains: (val: string): Where => ({ nft: { seed: { contains: val } } }),
    },
    "price": {
        equals: (val: number): Where => ({ price: { equals: val } }),
        gt: (val: number): Where => ({ price: { gt: val } }),
        gte: (val: number): Where => ({ price: { gte: val } }),
        lt: (val: number): Where => ({ price: { lt: val } }),
        lte: (val: number): Where => ({ price: { lte: val } }),
    },
    "buyerUsername": {
        equals: (val: string): Where => ({ buyer: { username: { equals: val} } }),
        contains: (val: string): Where => ({ buyer: { username: { contains: val} } }),
    },
    "sellerUsername": {
        equals: (val: string): Where => ({ seller: { username: { equals: val} } }),
        contains: (val: string): Where => ({ seller: { username: { contains: val} } }),
    },
    "createdAt": {
        equals: (val: Date): Where => ({ createdAt: { equals: val } }),
        gt: (val: Date): Where => ({ createdAt: { gt: val } }),
        gte: (val: Date): Where => ({ createdAt: { gte: val } }),
        lt: (val: Date): Where => ({ createdAt: { lt: val } }),
        lte: (val: Date): Where => ({ createdAt: { lte: val } }),
    },
    "sellerAccepted": {
        equals: (val: boolean): Where => ({ sellerAccepted: val }),
    },
    "buyerAccepted": {
        equals: (val: boolean): Where => ({ buyerAccepted: val }),
    },
} as const;

type GetAllTradesRequest = {
    skip: Skip,
    take: Take,
    sort: Sort<SortKeyToOrderByMap, keyof SortKeyToOrderByMap, OrderBy>,
    filters: Filters<FilterKeyToWhereMap, Where>,
};

type GetAllTradesResponse = Trade[];

export const getAllTrades: PublicFeature<GetAllTradesRequest, GetAllTradesResponse> = async (
    request,
    ctx,
) => {
    const trades = await ctx.prisma.trade.findMany({
        take: request.take,
        skip: request.skip,
        orderBy: request.sort.map(([key, order]) => sortKeyToOrderByMap[key](order)),
        where: request.filters,
    });

    return ok(trades);
};

export const setupGetAllTradesRequest: SetupRequest<GetAllTradesRequest, {}> = (req) => {
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
        sort: sortResult.value ?? [["createdAt", "desc"]],
        filters: filtersResult.value,
    })
}
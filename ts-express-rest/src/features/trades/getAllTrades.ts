import { Trade, Prisma } from "@prisma/client";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/feature";
import { DEFAULT_TAKE } from "../../utils/constants";
import { SetupRequest } from "../../utils/expressHandler";
import { identityResult } from "../../utils/identity";
import { createQueryProp, parseBoolean, parseDate, parseFilters, parseIfDefined, parseNumber, parseSort } from "../../utils/query";
import { SortOrder } from "../../utils/request/sort";
 
type OrderBy = Prisma.TradeOrderByWithRelationInput;
type Where = Prisma.TradeWhereInput;

const queryPropMap = {
    nftSeed: createQueryProp({
        deserialize: identityResult,
        toOrderBy: (order: SortOrder): OrderBy => ({ nft: { seed: order } }),
        toWhere: {
            equals: (val: string): Where => ({ nft: { seed: { equals: val } } }),
            contains: (val: string): Where => ({ nft: { seed: { contains: val } } }),
        },
    }),
    price: createQueryProp({
        deserialize: parseNumber,
        toOrderBy: (order: SortOrder): OrderBy => ({ price: order }),
        toWhere: {
            equals: (val: number): Where => ({ price: { equals: val } }),
            gt: (val: number): Where => ({ price: { gt: val } }),
            gte: (val: number): Where => ({ price: { gte: val } }),
            lt: (val: number): Where => ({ price: { lt: val } }),
            lte: (val: number): Where => ({ price: { lte: val } }),
        },
    }),
    buyerUsername: createQueryProp({
        deserialize: identityResult,
        toOrderBy: (order: SortOrder): OrderBy => ({ buyer: { username: order } }),
        toWhere: {
            equals: (val: string): Where => ({ buyer: { username: { equals: val} } }),
            contains: (val: string): Where => ({ buyer: { username: { contains: val} } }),
        },
    }),
    sellerUsername: createQueryProp({
        deserialize: identityResult,
        toOrderBy: (order: SortOrder): OrderBy => ({ buyer: { username: order } }),
        toWhere: {
            equals: (val: string): Where => ({ seller: { username: { equals: val} } }),
            contains: (val: string): Where => ({ seller: { username: { contains: val} } }),
        },
    }),
    createdAt: createQueryProp({
        deserialize: parseDate,
        toOrderBy: (order: SortOrder): OrderBy => ({ createdAt: order }),
        toWhere: {
            equals: (val: Date): Where => ({ createdAt: { equals: val } }),
            gt: (val: Date): Where => ({ createdAt: { gt: val } }),
            gte: (val: Date): Where => ({ createdAt: { gte: val } }),
            lt: (val: Date): Where => ({ createdAt: { lt: val } }),
            lte: (val: Date): Where => ({ createdAt: { lte: val } }),
        },
    }),
    sellerAccepted: createQueryProp({
        deserialize: parseBoolean,
        toOrderBy: (order: SortOrder): OrderBy => ({ sellerAccepted: order }),
        toWhere: {
            equals: (val: boolean): Where => ({ sellerAccepted: val }),
        },
    }),
    buyerAccepted: createQueryProp({
        deserialize: parseBoolean,
        toOrderBy: (order: SortOrder): OrderBy => ({ buyerAccepted: order }),
        toWhere: {
            equals: (val: boolean): Where => ({ buyerAccepted: val }),
        },
    }),
} as const;

type GetAllTradesRequest = {
    skip?: number,
    take: number,
    sort: Array<OrderBy>,
    filters?: Where,
};

type GetAllTradesResponse = Trade[];

export const getAllTrades: PublicFeature<GetAllTradesRequest, GetAllTradesResponse> = async (
    request,
    ctx,
) => {
    const trades = await ctx.prisma.trade.findMany({
        take: request.take,
        skip: request.skip,
        orderBy: request.sort,
        where: request.filters,
    });

    return ok(trades);
};

export const setupGetAllTradesRequest: SetupRequest<GetAllTradesRequest, {}> = (req) => {
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
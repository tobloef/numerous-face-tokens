import { Trade, Prisma } from "@prisma/client";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/feature";
import { DEFAULT_TAKE } from "../../utils/constants";
import { SetupRequest } from "../../utils/expressHandler";
import {
    createToWhereMap,
    QueryFilters,
    parseBoolean,
    parseDate,
    parseFilters,
    parseIfDefined,
    parseNumber,
    parseSort,
    parseString,
    QuerySorts,
    SortOrder,
    filtersToWhere,
} from "../../utils/query";

export type GetAllTradesRequest = {
    skip?: number,
    take: number,
    sorts: QuerySorts<typeof queryPropMap>,
    filters?: QueryFilters<typeof queryPropMap>,
};

export type OverviewTradeDto = {
    id: string,
    createdAt: Date,
    sellerUsername: string,
    sellerAccepted: boolean,
    buyerUsername: string | null,
    buyerAccepted: boolean,
    soldAt: Date | null,
    nftSeed: string,
    price: number,
    isCompleted: boolean,
    isPublic: boolean,
};

export type GetAllTradesResponse = {
    totalCount: number,
    trades: OverviewTradeDto[],
};

export const getAllTrades: PublicFeature<GetAllTradesRequest, GetAllTradesResponse> = async (
    request,
    ctx,
) => {
    const trades = await ctx.prisma.trade.findMany({
        take: request.take,
        skip: request.skip,
        orderBy: request.sorts.map(([key, order]) => queryPropMap[key].toOrderBy(order)),
        where: filtersToWhere<typeof queryPropMap, Where>(request.filters ?? {}, queryPropMap),
        include: {
            nft: {
                select: {
                    seed: true,
                }
            },
            buyer: {
                select: {
                    username: true,
                }
            },
            seller: {
                select: {
                    username: true,
                }
            }
        }
    });

    const tradeDtos = trades.map((trade): OverviewTradeDto => ({
        id: trade.id,
        createdAt: trade.createdAt,
        nftSeed: trade.nft.seed,
        price: trade.price,
        sellerAccepted: trade.sellerAccepted,
        sellerUsername: trade.seller.username,
        buyerAccepted: trade.buyerAccepted,
        buyerUsername: trade.buyer?.username ?? null,
        soldAt: trade.soldAt,
        isCompleted: trade.soldAt !== null,
        isPublic: trade.buyer !== null,
    }));

    const totalCount: number = await ctx.prisma.trade.count({
        where: request.filters,
    });

    return ok({
        trades: tradeDtos,
        totalCount
    });
};

export const setupGetAllTradesRequest: SetupRequest<GetAllTradesRequest, {}> = (req) => {
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
        sorts: sortResult.value ?? [["createdAt", "desc" ]],
        filters: filtersResult.value,
    });
}

type OrderBy = Prisma.TradeOrderByWithRelationInput;
type Where = Prisma.TradeWhereInput;

const queryPropMap = {
    nftSeed: {
        deserialize: parseString,
        toOrderBy: (order: SortOrder): OrderBy => ({ nft: { seed: order } }),
        toWhere: createToWhereMap(
            ["equals", "contains"] as const,
            (val: string, op: string): Where => ({ nft: { seed: { [op]: val } } })
        ),
    },
    price: {
        deserialize: parseNumber,
        toOrderBy: (order: SortOrder): OrderBy => ({ price: order }),
        toWhere: createToWhereMap(
            ["equals", "gt", "gte", "lt", "lte"],
            (val: number, op: string): Where => ({ price: { [op]: val } })
        ),
    },
    buyerUsername: {
        deserialize: parseString,
        toOrderBy: (order: SortOrder): OrderBy => ({ buyer: { username: order } }),
        toWhere: createToWhereMap(
            ["equals", "contains"] as const,
            (val: string, op: string): Where => ({ buyer: { username: { [op]: val } } })
        ),
    },
    sellerUsername: {
        deserialize: parseString,
        toOrderBy: (order: SortOrder): OrderBy => ({ buyer: { username: order } }),
        toWhere: createToWhereMap(
            ["equals", "contains"] as const,
            (val: string, op: string): Where => ({ seller: { username: { [op]: val } } })
        ),
    },
    createdAt: {
        deserialize: parseDate,
        toOrderBy: (order: SortOrder): OrderBy => ({ createdAt: order }),
        toWhere: createToWhereMap(
            ["equals", "gt", "gte", "lt", "lte"] as const,
            (val: Date, op: string): Where => ({ createdAt: { [op]: val } })
        ),
    },
    sellerAccepted: {
        deserialize: parseBoolean,
        toOrderBy: (order: SortOrder): OrderBy => ({ sellerAccepted: order }),
        toWhere: createToWhereMap(
            ["equals"] as const,
            (val: boolean, op: string): Where => ({ sellerAccepted: { [op]: val } })
        ),
    },
    buyerAccepted: {
        deserialize: parseBoolean,
        toOrderBy: (order: SortOrder): OrderBy => ({ buyerAccepted: order }),
        toWhere: createToWhereMap(
            ["equals"] as const,
            (val: boolean, op: string): Where => ({ buyerAccepted: { [op]: val } })
        ),
    },
} as const;

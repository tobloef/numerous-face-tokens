import { Trade, Prisma } from "@prisma/client";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/feature";
import { DEFAULT_TAKE } from "../../utils/constants";
import { SetupRequest } from "../../utils/expressHandler";
import { createQueryProp, createToWhereMap, parseBoolean, parseDate, parseFilters, parseIfDefined, parseNumber, parseSort, parseString, SortOrder } from "../../utils/query";

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

type OrderBy = Prisma.TradeOrderByWithRelationInput;
type Where = Prisma.TradeWhereInput;

const queryPropMap = {
    nftSeed: createQueryProp({
        deserialize: parseString,
        toOrderBy: (order: SortOrder): OrderBy => ({ nft: { seed: order } }),
        toWhere: createToWhereMap(
            ["equals", "contains"],
            (val: string, op: string): Where => ({ nft: { seed: { [op]: val } } })
        ),
    }),
    price: createQueryProp({
        deserialize: parseNumber,
        toOrderBy: (order: SortOrder): OrderBy => ({ price: order }),
        toWhere: createToWhereMap(
            ["equals", "gt", "gte", "lt", "lte"],
            (val: number, op: string): Where => ({ price: { [op]: val } })
        ),
    }),
    buyerUsername: createQueryProp({
        deserialize: parseString,
        toOrderBy: (order: SortOrder): OrderBy => ({ buyer: { username: order } }),
        toWhere: createToWhereMap(
            ["equals", "contains"],
            (val: string, op: string): Where => ({ buyer: { username: { [op]: val } } })
        ),
    }),
    sellerUsername: createQueryProp({
        deserialize: parseString,
        toOrderBy: (order: SortOrder): OrderBy => ({ buyer: { username: order } }),
        toWhere: createToWhereMap(
            ["equals", "contains"],
            (val: string, op: string): Where => ({ seller: { username: { [op]: val } } })
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
    sellerAccepted: createQueryProp({
        deserialize: parseBoolean,
        toOrderBy: (order: SortOrder): OrderBy => ({ sellerAccepted: order }),
        toWhere: createToWhereMap(
            ["equals"],
            (val: boolean, op: string): Where => ({ sellerAccepted: { [op]: val } })
        ),
    }),
    buyerAccepted: createQueryProp({
        deserialize: parseBoolean,
        toOrderBy: (order: SortOrder): OrderBy => ({ buyerAccepted: order }),
        toWhere: createToWhereMap(
            ["equals"],
            (val: boolean, op: string): Where => ({ buyerAccepted: { [op]: val } })
        ),
    }),
} as const;
import { Trade } from ".prisma/client";
import { err, ok } from "neverthrow";
import { PublicFeature } from "../../types/feature";
import { DEFAULT_TAKE } from "../../utils/constants";
import { SetupRequest } from "../../utils/expressHandler";
import { Filters, parseFiltersIfDefined } from "../../utils/request/filters";
import { Skip, parseSkipIfDefined } from "../../utils/request/skip";
import { Sort, sortToOrderBy, parseSortIfDefined } from "../../utils/request/sort";
import { Take, parseTakeIfDefined } from "../../utils/request/take";
 
const SORT_KEYS = [
    "nftSeed",
    "price",
    "buyerName",
    "sellerName",
    "createdAt",
    "sellerAccepted",
    "buyerAccepted",
] as const;

type SortKeys = (typeof SORT_KEYS)[number];

// Seed
// Buyer
// Seller
// Price

const FILTER_KEYS = [
    "nftSeed",
    "price",
    "buyerName",
    "sellerName",
    "createdAt",
    "sellerAccepted",
    "buyerAccepted",
] as const;

type FilterKeys = (typeof FILTER_KEYS)[number];

type GetAllTradesRequest = {
    skip: Skip,
    take: Take,
    sort: Sort<SortKeys>,
    //filters: Filters<Trade, FilterKeys>,
};

type GetAllTradesResponse = Trade[];

export const getAllTrades: PublicFeature<GetAllTradesRequest, GetAllTradesResponse> = async (
    request,
    ctx,
) => {
    const trades = await ctx.prisma.trade.findMany({
        take: request.take,
        skip: request.skip,
        orderBy: sortToOrderBy(request.sort),
        //where: request.filters,
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
    const sortResult = parseSortIfDefined<SortKeys>(unparsedSort, SORT_KEYS);
    //const filtersResult = parseFiltersIfDefined<Trade, FilterKeys>(unparsedFilters, FILTER_KEYS);

    if (sortResult.isErr()) {
        return err(sortResult.error);
    }
    if (takeResult.isErr()) {
        return err(takeResult.error);
    }
    if (skipResult.isErr()) {
        return err(skipResult.error);
    }
    //if (filtersResult.isErr()) {
        //return err(filtersResult.error);
    //}
    
    return ok({
        take: takeResult.value ?? DEFAULT_TAKE,
        skip: skipResult.value,
        sort: sortResult.value ?? [["createdAt", "desc"]],
        //filters: filtersResult.value,
    })
}
import { Nft } from ".prisma/client";
import { err, ok } from "neverthrow";
import { PublicFeature } from "../../types/feature";
import { DEFAULT_TAKE } from "../../utils/constants";
import { SetupRequest } from "../../utils/expressHandler";
import { Filters, parseFiltersIfDefined } from "../../utils/request/filters";
import { Skip, parseSkipIfDefined } from "../../utils/request/skip";
import { Take, parseTakeIfDefined } from "../../utils/request/take";
 
const SORT_KEYS = [
    "seed",
    "title",
    "mintedAt",
    "lastSellPrice",
    "lastSoldAt",
    "highestSellPrice",
    "ownerUsername",
] as const;

type SortKeys = (typeof SORT_KEYS)[number];

const FILTER_KEYS = [
    "seed",
    "title",
    "mintedAt",
    "lastSellPrice",
    "lastSoldAt",
    "highestSellPrice",
    "ownerUsername",
] as const;

type FilterKeys = (typeof FILTER_KEYS)[number];

type GetAllNftsRequest = {
    skip: Skip,
    take: Take,
    //sort: Sort<SortKeys>,
    //filters: Filters<Nft, FilterKeys>,
};

type GetAllNftsResponse = Nft[];

export const getAllNfts: PublicFeature<GetAllNftsRequest, GetAllNftsResponse> = async (
    request,
    ctx,
) => {
    const nfts = await ctx.prisma.nft.findMany({
        take: request.take,
        skip: request.skip,
        //orderBy: sortToOrderBy(request.sort),
        //where: request.filters,
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
    //const sortResult = parseSortIfDefined<SortKeys>(unparsedSort, SORT_KEYS);
    //const filtersResult = parseFiltersIfDefined<Nft, FilterKeys>(unparsedFilters, FILTER_KEYS);

    //if (sortResult.isErr()) {
        //return err(sortResult.error);
    //}
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
        //sort: sortResult.value ?? [["mintedAt", "desc"]],
        //filters: filtersResult.value,
    })
}
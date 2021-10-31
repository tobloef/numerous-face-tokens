import { UserWithPassword } from ".prisma/client";
import { err, ok, Result } from "neverthrow";
import { ParsedQs } from "qs";
import { is } from "typescript-is";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/feature";
import User from "../../types/User";
import { DEFAULT_TAKE } from "../../utils/constants";
import deleteProp from "../../utils/deleteProp";
import { SetupRequest } from "../../utils/expressHandler";
import { Filters, parseFiltersIfDefined } from "../../utils/request/filters";
import { parseSkipIfDefined, Skip } from "../../utils/request/skip";
import { parseSortIfDefined, Sort, sortToOrderBy } from "../../utils/request/sort";
import { parseTakeIfDefined, Take } from "../../utils/request/take";

const SORT_KEYS = [
    "username",
    "createdAt",
    "balance",
    "ownedNftsCount",
    "mintedNftsCount",
] as const;

type SortKeys = (typeof SORT_KEYS)[number];

const FILTER_KEYS = [
    "username",
    "createdAt",
    "balance",
] as const;

type FilterKeys = (typeof FILTER_KEYS)[number];

type GetAllUsersRequest = {
    skip: Skip,
    take: Take,
    sort: Sort<SortKeys>,
    filters: Filters<User, FilterKeys>,
}

type GetAllUsersResponse = User[];

export const getAllUsers: PublicFeature<GetAllUsersRequest, GetAllUsersResponse> = async (
    request,
    ctx,
) => {
    const userWithPasswords: UserWithPassword[] = await ctx.prisma.userWithPassword.findMany({
        take: request.take,
        skip: request.skip,
        orderBy: sortToOrderBy(request.sort, ["mintedNftsCount", "ownedNftsCount"]),
        where: request.filters,
    });

    const users = userWithPasswords.map((user) => deleteProp(user, "passwordHash"));

    return ok(users);
};

export const setupGetAllUsersRequest: SetupRequest<GetAllUsersRequest, {}> = (req) => {
    const {
        take: unparsedTake,
        skip: unparsedSkip,
        sort: unparsedSort,
        ...unparsedFilters
    } = req.query;

    const takeResult = parseTakeIfDefined(unparsedTake);
    const skipResult = parseSkipIfDefined(unparsedSkip);
    const sortResult = parseSortIfDefined<SortKeys>(unparsedSort, SORT_KEYS);
    const filtersResult = parseFiltersIfDefined<User, FilterKeys>(unparsedFilters, FILTER_KEYS);

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
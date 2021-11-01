import { Prisma, UserWithPassword } from "@prisma/client";
import { err, ok } from "neverthrow";
import { is } from "typescript-is";
import { PublicFeature } from "../../types/feature";
import User from "../../types/User";
import { DEFAULT_TAKE } from "../../utils/constants";
import deleteProp from "../../utils/deleteProp";
import { SetupRequest } from "../../utils/expressHandler";
import { Filters, parseFiltersIfDefined } from "../../utils/request/filters";
import { parseSkipIfDefined, Skip } from "../../utils/request/skip";
import { parseSortIfDefined, Sort, SortOrder } from "../../utils/request/sort";
import { parseTakeIfDefined, Take } from "../../utils/request/take";

type OrderBy = Prisma.UserWithPasswordOrderByWithRelationInput;
type Where = Prisma.UserWithPasswordWhereInput;

const sortKeyToOrderByMap = {
    "username": (o: SortOrder): OrderBy => ({ username: o }),
    "createdAt": (o: SortOrder): OrderBy => ({ createdAt: o }),
    "balance": (o: SortOrder): OrderBy => ({ balance: o }),
    "ownedNftsCount": (o: SortOrder): OrderBy => ({ ownedNfts: { _count: o } }),
    "mintedNftsCount": (o: SortOrder): OrderBy =>  ({ mintedNfts: { _count: o } }),
} as const;

const filterKeyToWhereMap = {
    "username": {
        equals: (val: string): Where => ({ username: { equals: val } }),
        contains: (val: string): Where => ({ username: { contains: val } }),
    },
} as const;

type BaseRequest<SortMap, FilterMap> = {
    skip: Skip,
    take: Take,
    sort: Sort<typeof sortKeyToOrderByMap, keyof typeof sortKeyToOrderByMap, OrderBy>,
    filters: Filters<typeof filterKeyToWhereMap, Where>,
}

type GetAllUsersRequest = {
    skip: Skip,
    take: Take,
    sort: Sort<typeof sortKeyToOrderByMap, keyof typeof sortKeyToOrderByMap, OrderBy>,
    filters: Filters<typeof filterKeyToWhereMap, Where>,
}

type GetAllUsersResponse = User[];

export const getAllUsers: PublicFeature<GetAllUsersRequest, GetAllUsersResponse> = async (
    request,
    ctx,
) => {
    const userWithPasswords: UserWithPassword[] = await ctx.prisma.userWithPassword.findMany({
        take: request.take,
        skip: request.skip,
        orderBy: request.sort.map(([key, order]) => sortKeyToOrderByMap[key](order)),
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
    const sortResult = parseSortIfDefined(unparsedSort, sortKeyToOrderByMap);
    const filtersResult = parseFiltersIfDefined<Where>(unparsedFilters, filterKeyToWhereMap);

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
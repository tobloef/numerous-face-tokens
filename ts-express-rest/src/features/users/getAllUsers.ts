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

// TODO: Move these types elsewhere when finished
 
type SortOrder = "desc" | "asc";

type Sort<Keys extends string> = Array<[Keys, SortOrder]>;

type NumberFilterOps = {
    gt: number,
    gte: number,
    lt: number,
    lte: number,
    equals: number,
};

type StringFilterOps = {
    equals: string,
    contains: string,
}

type DateFilterOps = {
    gt: Date,
    gte: Date,
    lt: Date,
    lte: Date,
    equals: Date,
}

type FilterOps<T> = T extends string
    ? StringFilterOps
    : (T extends number
        ? NumberFilterOps
        : (T extends Date
            ? DateFilterOps
            : never
        )
    );

type FilterProps = Record<string, string | number | Date>;

// TODO: Make it so you can't pass in "sort" | "skip" | "take" | "filters"
type Filters<Props extends FilterProps> = {
    [Key in keyof Props]?: Partial<FilterOps<Props[Key]>>
} | undefined;

type Skip = number | undefined;

type Take = number;

/////////////////////////////////////////////////////////////////////////////////////////

const parseNumberIfDefined = (input: unknown | undefined): Result<number | undefined, string> => {
    if (input === undefined) {
        return ok(undefined);
    }

    const number = Number(input);

    if (Number.isNaN(number)) {
        return err(`${input} is not a number`);
    }

    return ok(number);
};

const parseSortIfDefined = <SortKeys extends string>(
    input: unknown | undefined,
    validKeys: readonly SortKeys[],
): Result<Sort<SortKeys> | undefined, string> => {
    if (input === undefined) {
        ok(undefined);
    }
    
    if (!is<string>(input)) {
        return err("Must be a string");
    }
    
    if (!input.match(/([+-][a-z_]+,)*[+-][a-z_]+/)) {
        return err(`Invalid structure`);
    }

    const parts = input.split(",");

    let sort: Sort<SortKeys> = [];

    for (const part of parts) {
        const sign = part.slice(0, 1);
        const key = part.slice(1);
        const order = sign === "+" ? "asc" : "desc";

        if (!validKeys.includes(key as SortKeys)) {
            return err(`Invalid key to sort on. Valid keys: ${validKeys.join(", ")}`);
        }

        sort.push([key as SortKeys, order]);
    }

    return ok(sort);
};

const sortToOrderBy = <Keys extends string>(sort: Sort<Keys>, countKeys?: Array<Keys>) => {
    return sort.map(([key, order]) => {
        if (countKeys?.includes(key)) {
            return {
                [key]: { _count: order },
            }
        }

        return {
            [key]: order,
        }
    })
}

/////////////////////////////////////////////////////////////////////////////////////////

const SORT_KEYS = [
    "username",
    "createdAt",
    "balance",
    "ownedNftsCount",
    "mintedNftsCount",
] as const;

type SortKeys = (typeof SORT_KEYS)[number];

type GetAllUsersRequest = {
    skip: Skip,
    take: Take,
    sort: Sort<SortKeys>,
    filters: Filters<{
        username: string,
    }>,
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
        where: {
            [key]: {
                [op]: value
            }
        },
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

    const sortResult = parseSortIfDefined(unparsedSort, SORT_KEYS);
    const takeResult = parseNumberIfDefined(unparsedTake);
    const skipResult = parseNumberIfDefined(unparsedSkip);
    const filtersResult = parseFiltersIfDefined(unparsedFilters);

    if (sortResult.isErr()) {
        return err(new ApiError(`Invalid sort parameter. ${sortResult.error}.`, 400));
    }
    if (takeResult.isErr()) {
        return err(new ApiError(`Invalid take parameter. ${takeResult.error}.`, 400));
    }
    if (skipResult.isErr()) {
        return err(new ApiError(`Invalid skip parameter. ${skipResult.error}.`, 400));
    }
    if (filtersResult.isErr()) {
        return err(new ApiError(`Invalid filter parameters. ${filtersResult.error}.`, 400));
    }
    
    return ok({
        take: takeResult.value ?? DEFAULT_TAKE,
        skip: skipResult.value,
        sort: sortResult.value ?? [["createdAt", "desc"]],
        filters: {

        },
    })
}
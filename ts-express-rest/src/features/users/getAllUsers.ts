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
 
type SortOrder = "desc" | "asc";

// TODO: Move these types elsewhere when finished
type Sort<Keys extends string> = Partial<Record<Keys, SortOrder>>;

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

// TODO: Make it so you can't pass in "sort" | "skip" | "take" | "filters"
type Filters<Props extends object> = {
    [Key in keyof Props]?: Partial<FilterOps<Props[Key]>>
} | undefined;

type Skip = number | undefined;

type Take = number;

type BaseGetAllRequest<SortKeys extends string, FilterProps extends object> = {
    skip: Skip,
    take: Take,
    sort: Sort<SortKeys>,
    filters: Filters<FilterProps>,
}

const sortKeys = ["username", "createdAt", "balance", "ownedNftsCount", "mintedNftsCount"] as const;
type SortKeys = (typeof sortKeys)[number];

type GetAllUsersRequest = BaseGetAllRequest<SortKeys,
    {
        username: string,
    }
>

type GetAllUsersResponse = User[];

const countIfDefined = (prop: SortOrder | undefined) => prop !== undefined
    ? { _count: prop }
    : undefined;

export const getAllUsers: PublicFeature<GetAllUsersRequest, GetAllUsersResponse> = async (
    request,
    ctx,
) => {
    const userWithPasswords: UserWithPassword[] = await ctx.prisma.userWithPassword.findMany({
        take: request.take,
        skip: request.skip,
        orderBy: {
            username: request.sort.username,
            createdAt: request.sort.createdAt,
            balance: request.sort.balance,
            ownedNfts: countIfDefined(request.sort.ownedNftsCount),
            mintedNfts: countIfDefined(request.sort.mintedNftsCount),
        },
        where: request.filters,
    });

    const users = userWithPasswords.map((user) => deleteProp(user, "passwordHash"));

    return ok(users);
};

const parseNumberIfDefined = (input?: unknown): Result<Skip | undefined, string> => {
    if (input === undefined) {
        return ok(undefined);
    }

    const number = Number(input);

    if (Number.isNaN(number)) {
        return err(`${input} is not a number`);
    }

    return ok(number);
};

const parseSortIfDefined = <Keys extends string>(
    input: unknown | undefined,
    keys: readonly string[]
): Result<Sort<Keys> | undefined, string> => {
    if (input === undefined) {
        ok(undefined);
    }
    
    if (!is<string>(input)) {
        return err("Must be a string");
    }
    
    if (!input.match(/([+-][a-z_]+,)*[+-][a-z_]+/)) {
        return err(`Invalid structure`);
    }

    let sort: Sort<Keys> = {};

    const parts = input.split(",");

    for (const part of parts) {
        const sign = part.slice(0, 1);
        const key = part.slice(1);

        const order = sign === "+" ? "asc" : "desc";

        if (!keys.includes(key)) {
            return err(`Invalid key ('${key}') to sort on. Valid keys: ${keys.join(", ")}`);
        }

        sort[key as Keys] = order;
    }

    return ok(sort);
};

const parseFiltersIfDefined = <Props extends object>(input?: object): Result<Filters<Props> | undefined, string> => {
    if (input === undefined) {
        return ok(undefined);
    }

    // TODO

    return ok({});
};

const parseBaseGetAllQuery = <SortKeys extends string, FilterProps extends object>(
    query: ParsedQs,
    sortKeys: readonly string[],
): Result<Partial<BaseGetAllRequest<SortKeys, FilterProps>>, string> => {
    const {
        take: unparsedTake,
        skip: unparsedSkip,
        sort: unparsedSort,
        ...unparsedFilters
    } = query;

    const takeResult = parseNumberIfDefined(unparsedTake);
    const skipResult = parseNumberIfDefined(unparsedSkip);
    const sortResult =  parseSortIfDefined(unparsedSort, sortKeys);
    const filtersResult = parseFiltersIfDefined(unparsedFilters);

    if (takeResult.isErr()) {
        return err(`Invalid take parameter. ${takeResult.error}`);
    }
    if (skipResult.isErr()) {
        return err(`Invalid skip parameter. ${skipResult.error}`);
    }
    if (sortResult.isErr()) {
        return err(`Invalid sort parameter. ${sortResult.error}`);
    }
    if (filtersResult.isErr()) {
        return err(`Invalid filter parameters. ${filtersResult.error}`);
    }

    return ok({
        take: takeResult.value,
        skip: skipResult.value,
        sort: sortResult.value,
        filters: filtersResult.value,
    });
}

export const setupGetAllUsersRequest: SetupRequest<GetAllUsersRequest, {}> = (req) => {
    console.debug("query", req.query);

    const baseRequestResult = parseBaseGetAllQuery(req.query, sortKeys);

    if (baseRequestResult.isErr()) {
        return err(new ApiError(baseRequestResult.error, 400));
    }

    const request: GetAllUsersRequest = {
        take: baseRequestResult.value.take ?? DEFAULT_TAKE,
        skip: baseRequestResult.value.skip,
        sort: baseRequestResult.value.sort ?? { createdAt: "desc" },
        filters: baseRequestResult.value.filters,
    };

    console.debug("request", request);

    return ok(request)
}
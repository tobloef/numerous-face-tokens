import { Result, err, ok } from "neverthrow";
import { is } from "typescript-is";
import ApiError from "../../ApiError";

export type SortOrder = "desc" | "asc";

export type Sort<Keys extends string> = Array<[Keys, SortOrder]>;

export const parseSortIfDefined = <Keys extends string>(
    unparsedSort: unknown | undefined,
    validKeys: readonly Keys[],
): Result<Sort<Keys> | undefined, ApiError> => {
    if (unparsedSort === undefined) {
        return ok(undefined);
    }
    
    if (!is<string>(unparsedSort)) {
        return err(new ApiError(`Sort query parameter (${unparsedSort}) must be a string`, 400));
    }
    
    if (!unparsedSort.match(/([+-][a-z_]+,)*[+-][a-z_]+/)) {
        return err(new ApiError(`Sort query parameter (${unparsedSort}) has an invalid structure`, 400));
    }

    const parts = unparsedSort.split(",");

    let sort: Sort<Keys> = [];

    for (const part of parts) {
        const sign = part.slice(0, 1);
        const key = part.slice(1);
        const order = sign === "+" ? "asc" : "desc";

        if (!validKeys.includes(key as Keys)) {
            return err(new ApiError(`Invalid key ('${key}') to sort on. Valid keys: ${validKeys.join(", ")}`, 400));
        }

        sort.push([key as Keys, order]);
    }

    return ok(sort);
};

export const sortToOrderBy = <Keys extends string>(sort: Sort<Keys>, countKeys?: Array<Keys>) => {
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
import { Result, err, ok } from "neverthrow";
import { is } from "typescript-is";
import ApiError from "../../ApiError";

export type SortOrder = "desc" | "asc";

type SortKeyToOrderByMap<Keys extends string, OrderBy> = { [key in Keys]: (o: SortOrder) => OrderBy };

export type Sort<Map extends SortKeyToOrderByMap<Keys, OrderBy>, Keys extends string, OrderBy> = Array<[keyof Map, SortOrder]>;

export const parseSortIfDefined = <Keys extends string, OrderBy>(
    unparsedSort: unknown | undefined,
    sortKeyToOrderByMap: SortKeyToOrderByMap<Keys, OrderBy>,
): Result<Sort<typeof sortKeyToOrderByMap, Keys, OrderBy> | undefined, ApiError> => {
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

    let sort: Sort<typeof sortKeyToOrderByMap, Keys, OrderBy> = [];

    for (const part of parts) {
        const sign = part.slice(0, 1);
        const key = part.slice(1);
        const order = sign === "+" ? "asc" : "desc";

        const validKeys = Object.keys(sortKeyToOrderByMap);

        if (!validKeys.includes(key)) {
            return err(new ApiError(`Invalid key ('${key}') to sort on. Valid keys: ${validKeys.join(", ")}`, 400));
        }

        sort.push([key as Keys, order]);
    }

    return ok(sort);
};

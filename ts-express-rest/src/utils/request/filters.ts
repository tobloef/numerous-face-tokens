import { Result, err, ok } from "neverthrow";
import { is } from "typescript-is";
import ApiError from "../../ApiError";

const FILTER_OPS = [
    "gt",
    "gte",
    "lt",
    "lte",
    "equals",
    "contains",
] as const;

export type FilterOps = (typeof FILTER_OPS)[number];

export type Filters<Obj extends object, Keys extends keyof Obj> = {
    [Key in Keys]?: Partial<Record<FilterOps, Obj[Key]>>
} | undefined;

export const parseFiltersIfDefined = <Obj extends object, Keys extends keyof Obj>(
    unparsedFilters: Record<string, unknown>,
    validKeys: readonly Keys[],
): Result<Filters<Obj, Keys>, ApiError> => {
    if (unparsedFilters === undefined) {
        return ok(undefined);
    }

    for (const filterKey in unparsedFilters) {
        if (!validKeys.includes(filterKey as Keys)) {
            return err(new ApiError(`Invalid key ('${filterKey}') to filter on. Valid keys: ${validKeys.join(", ")}`, 400));
        }

        if (!is<object>(unparsedFilters[filterKey])) {
            return err(new ApiError(`Invalid filter value for key '${filterKey}'`, 400));
        }

        for (const filterOp in unparsedFilters[filterKey] as object) {
            if (!FILTER_OPS.includes(filterOp as FilterOps)) {
                return err(new ApiError(`Invalid filter operation ('${filterOp}') for key '${filterKey}'. Valid operations: ${FILTER_OPS.join(", ")}`, 400));
            }
        }
    }

    return ok(unparsedFilters as Filters<Obj, Keys>);
}
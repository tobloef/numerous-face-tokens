import { Result, err, ok } from "neverthrow";
import { is } from "typescript-is";
import ApiError from "../../ApiError";

type FilterKeyToWhereMap<Where> = { [key: string]: { [key: string]: (val: any) => Where } }

export type Filters<Map extends FilterKeyToWhereMap<Where>, Where> = {
    [Key in keyof Map]?: {
        [Op in keyof Map[Key]]: any
    }
} | undefined;

export const parseFiltersIfDefined = <Where>(
    unparsedFilters: Record<string, unknown>,
    filterKeyToWhereMap: FilterKeyToWhereMap<Where>,
): Result<Filters<typeof filterKeyToWhereMap, Where>, ApiError> => {
    if (unparsedFilters === undefined) {
        return ok(undefined);
    }

    for (const filterKey in unparsedFilters) {
        const validKeys = Object.keys(filterKeyToWhereMap);
        
        if (!validKeys.includes(filterKey)) {
            return err(new ApiError(`Invalid key ('${filterKey}') to filter on. Valid keys: ${validKeys.join(", ")}`, 400));
        }

        if (!is<object>(unparsedFilters[filterKey])) {
            return err(new ApiError(`Invalid filter value for key '${filterKey}'`, 400));
        }

        const validOps = Object.keys(filterKeyToWhereMap[filterKey]);

        for (const filterOp in unparsedFilters[filterKey] as object) {
            if (!validOps.includes(filterOp)) {
                return err(new ApiError(`Invalid filter operation ('${filterOp}') for key '${filterKey}'. Valid operations: ${validOps.join(", ")}`, 400));
            }
        }
    }

    return ok(unparsedFilters as Filters<typeof filterKeyToWhereMap, Where>);
}
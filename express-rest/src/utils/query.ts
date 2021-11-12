import { merge } from "lodash";
import { Result, err, ok } from "neverthrow";
import { is } from "typescript-is";
import SubType from "../types/SubType";

export type SortOrder = "asc" | "desc";

export type CreateQueryProperty<T, OrderBy, Where> = {
    toWhere?: Record<string, (value: T) => Where>,
    toOrderBy?: (order: SortOrder) => OrderBy,
    deserialize: (input: string) => Result<T, string>,
};

export type BaseQueryPropMap = Record<string, {
    toWhere?: Record<string, Function>,
    toOrderBy?: Function,
    deserialize: Function
}>

export type Sort<QueryPropMap extends BaseQueryPropMap> = Array<{
    [Key in keyof SubType<QueryPropMap, { toOrderBy: any }>]?: SortOrder
}>;

export type Filters<QueryPropMap extends BaseQueryPropMap> = {
    [Key in keyof SubType<QueryPropMap, { toWhere: any }>]?: {
        [InnerKey in keyof QueryPropMap[Key]["toWhere"]]?: (
          Parameters<QueryPropMap[Key]["toWhere"][InnerKey]>[0]
          )
    }
};

export const createQueryProp = <T, OrderBy, Where>(props: {
    toWhere?: Record<string, (value: T) => Where>,
    toOrderBy?: (order: SortOrder) => OrderBy,
    deserialize: (input: string) => Result<T, string>,
}): CreateQueryProperty<T, OrderBy, Where> => (props);

export const parseIfDefined = <I, O, E>(
  input: I | undefined,
  fn: ((i: I) => Result<O, E>)
): Result<O | undefined, E> => {
    if (input === undefined) {
        return ok(undefined);
    }

    return fn(input);
}

export const parseDate = (input: string | unknown): Result<Date, string> => {
    if (!is<string>(input) || Number.isNaN(Date.parse(input))) {
        return err(`'${input}' is not a valid date`);
    }

    return ok(new Date(Date.parse(input)));
}

export const parseString = (input: string | unknown): Result<string, string> => {
    if (!is<string>(input)) {
        return err(`'${input}' is not a valid string`);
    }

    return ok(input);
}

export const parseNumber = (input: string | unknown): Result<number, string> => {
    if (!is<string>(input) || Number.isNaN(Number(input))) {
        return err(`'${input}' is not a valid number`);
    }

    return ok(Number(input));
};

export const parseBoolean = (input: string | unknown): Result<boolean, string> => {
    if (!is<string>(input) || (input !== "true" && input !== "false")) {
        return err(`'${input}' is not a valid boolean`);
    }

    return ok(input === "true");
};

export const parseSort = <QueryPropMap extends BaseQueryPropMap>(
  input: string | unknown,
  queryPropMap: QueryPropMap,
): Result<Sort<QueryPropMap>, string> => {
    if (!is<string>(input) || !input.match(/([+-][a-z_]+,)*[+-][a-z_]+/)) {
        return err(`Invalid structure. Example structure: '?sort=+foo,-bar' to sort by 'foo' ascending and 'bar' descending.`);
    }

    const parts = input.split(",");

    let sort: Sort<QueryPropMap> = [];

    for (const part of parts) {
        const sign = part.slice(0, 1);
        const sortKey = part.slice(1);
        const order: SortOrder = sign === "+" ? "asc" : "desc";

        const validKeys = Object.entries(queryPropMap)
            .filter(([_, queryProp]) => queryProp.toOrderBy !== undefined)
            .map(([key, _]) => key);

        if (!validKeys.includes(sortKey)) {
            return err(`Invalid key '${sortKey}' to sort on. Valid keys: ${validKeys.join(", ")}`);
        }

        sort = [
            ...sort,
            { [sortKey]: order }
        ] as Sort<QueryPropMap>;
    }

    return ok(sort);
}

export const parseFilters = <QueryPropMap extends BaseQueryPropMap>(
  input: Record<string, any> | unknown,
  queryPropMap: QueryPropMap,
): Result<Filters<QueryPropMap>, string> =>{
    if (!is<Record<string, any>>(input)) {
        return err(`Invalid structure. Example structure: '?foo[equals]=bar' to show entries where 'foo' equals 'bar'`);
    }

    let filters: Filters<QueryPropMap> = {};

    for (const filterKey in input) {
        const validKeys = Object.entries(queryPropMap)
            .filter(([_, queryProp]) => queryProp.toWhere !== undefined)
            .map(([key, _]) => key);

        if (!validKeys.includes(filterKey)) {
            return err(`Invalid key '${filterKey}' to filter on. Valid keys: ${validKeys.join(", ")}`);
        }

        if (!is<object>(input[filterKey])) {
            return err(`Invalid structure for filter on '${filterKey}'. Example structure: '?foo[equals]=bar' to show entries where 'foo' equals 'bar'`);
        }

        const validOps = Object.keys(queryPropMap[filterKey].toWhere!);

        const inputOps = input[filterKey] as Record<string, string>;


        for (const filterOp of Object.keys(inputOps)) {
            if (!validOps.includes(filterOp)) {
                return err(`Invalid filter operator '${filterOp}' for key '${filterKey}'. Valid operators: ${validOps.join(", ")}`);
            }

            const deserializedResult = queryPropMap[filterKey].deserialize(inputOps[filterOp]);

            if (deserializedResult.isErr()) {
                return err(`Invalid filter value '${inputOps[filterOp]}' for key '${filterKey}'. ${deserializedResult.error}.`);
            }

            filters = merge(filters, {[filterKey]: {[filterOp]: deserializedResult.value }});
        }
    }

    return ok(filters);
}

export const createToWhereMap = <Where, T, Ops extends readonly string[]>(
    ops: Ops,
    getWhere: ((val: T, op: string) => Where),
): Record<Ops[number], (val: T) => Where> => {
    return ops.reduce((acc, op) => ({
        ...acc,
        [op]: (val: T) => getWhere(val, op)
    }), {} as Record<Ops[number], (val: T) => Where>);
}
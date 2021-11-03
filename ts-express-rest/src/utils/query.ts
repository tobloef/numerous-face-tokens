import { merge } from "lodash";
import { Result, err, ok } from "neverthrow";
import { is } from "typescript-is";

export type SortOrder = "asc" | "desc";

export type CreateQueryProperty<T, OrderBy, Where> = {
    toWhere?: Record<string, (value: T) => Where>,
    toOrderBy?: (order: SortOrder) => OrderBy,
    deserialize: (input: string) => Result<T, string>,
};

export const createQueryProp = <T, OrderBy, Where>(props: {
    toWhere?: Record<string, (value: T) => Where>,
    toOrderBy?: (order: SortOrder) => OrderBy,
    deserialize: (input: string) => Result<T, string>,
}): CreateQueryProperty<T, OrderBy, Where> => (props);

export const parseIfDefined = <I, O, E>(input: I | undefined, fn: ((i: I) => Result<O, E>)): Result<O | undefined, E> => {
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

export const parseSort = <OrderBy, Where>(input: string | unknown, queryPropMap: Record<string, CreateQueryProperty<any, OrderBy, Where>>): Result<Array<OrderBy>, string> =>{
    if (!is<string>(input) || !input.match(/([+-][a-z_]+,)*[+-][a-z_]+/)) {
        return err(`Invalid structure. Example structure: '?sort=+foo,-bar' to sort by 'foo' ascending and 'bar' descending.`);
    }

    const parts = input.split(",");

    let sort: Array<OrderBy> = [];

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

        const orderBy: OrderBy = queryPropMap[sortKey].toOrderBy!(order);

        sort.push(orderBy);
    }

    return ok(sort);
}

export const parseFilters = <OrderBy, Where>(input: Record<string, any> | unknown, queryPropMap: Record<string, CreateQueryProperty<any, OrderBy, Where>>): Result<Where, string> =>{
    if (!is<Record<string, any>>(input)) {
        return err(`Invalid structure. Example structure: '?foo[equals]=bar' to show entries where 'foo' equals 'bar'`);
    }
    
    let where: Where = {} as Where;
    
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

            where = merge(where, queryPropMap[filterKey].toWhere![filterOp](deserializedResult.value));
        }
    }

    return ok(where);
}
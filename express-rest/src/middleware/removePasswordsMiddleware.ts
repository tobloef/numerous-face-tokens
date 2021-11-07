import express from "express";
import { is } from "typescript-is";

const removePropertiesRecursively = (input: any, keysToRemove: string[]): any => {   
    if (!is<object>(input)) {
        return input;
    }

    return Object.entries(input)
        .reduce((acc, [key, value]) => {
            if (keysToRemove.includes(key)) {
                return acc;
            }

            return {
                ...acc,
                [key]: removePropertiesRecursively(value, keysToRemove),
            }
        }, {});
};

export const removePropertiesRecursivelyMiddleware = (keysToRemove: string[]) => {
    return (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        const oldJson = res.json;
        res.json = (data) => {
          const newData = removePropertiesRecursively(data, keysToRemove);
          res.json = oldJson;
          return res.json(newData);
        }
        next();
    };
}
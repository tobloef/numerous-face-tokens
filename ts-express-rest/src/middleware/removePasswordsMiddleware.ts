import express from "express";
import { is } from "typescript-is";

const removePropertiesRecursivelyFromObject = (input: object, keysToRemove: string[]): object => {
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
}

const removePropertiesRecursively = (input: any, keysToRemove: string[]): any => {
    let obj: object;
    
    if (is<string>(input)) {
        try {
            obj = JSON.parse(input);
            const newObj = removePropertiesRecursivelyFromObject(obj, keysToRemove);
            return JSON.stringify(newObj);
        } catch (error) {
            // Ignored
        }
    }
    
    if (is<object>(input)) {
        return removePropertiesRecursivelyFromObject(input, keysToRemove);
    }

    return input;
};

export const removePropertiesRecursivelyMiddleware = (keysToRemove: string[]) => {
    return (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        const oldSend = res.send;
        res.send = (data) => {
          const newData = removePropertiesRecursively(data, keysToRemove);
          res.send = oldSend;
          return res.send(newData);
        }
        next();
    };
}
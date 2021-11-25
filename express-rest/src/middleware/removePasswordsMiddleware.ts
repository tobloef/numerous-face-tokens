import express from "express";

const removePropertiesRecursively = (input: any, keysToRemove: string[]): any => {
  if (input != null && input.constructor === Array) {
    return input.map((i) => removePropertiesRecursively(i, keysToRemove));
  }

  if (input != null && input.constructor === Object) {
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

  return input;
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

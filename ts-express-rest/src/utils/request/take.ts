import { err, ok, Result } from "neverthrow";
import ApiError from "../../ApiError";

export type Take = number;

export const parseTakeIfDefined = (
    unparsedNumber: unknown | undefined
): Result<number | undefined, ApiError> => {
    if (unparsedNumber === undefined) {
        return ok(undefined);
    }

    const number = Number(unparsedNumber);

    if (Number.isNaN(number)) {
        return err(new ApiError(`Take query parameter (${unparsedNumber}) is not a number.`, 400));
    }

    return ok(number);
};
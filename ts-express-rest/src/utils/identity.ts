import { ok, Result } from "neverthrow";

export const identity = <T>(input: T): T => input;

export const identityResult = <T>(input: T): Result<T, string> => ok(input);
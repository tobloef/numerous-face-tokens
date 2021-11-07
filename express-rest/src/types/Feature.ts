import { Result } from "neverthrow";
import ApiError from "../ApiError";
import { PrivateContext, PublicContext } from "./Context";

export type PublicFeature<Request, Response> = (
    request: Request,
    ctx: PublicContext,
) => Promise<Result<Response, ApiError>>;

export type PrivateFeature<Request, Response> = (
    request: Request,
    ctx: PrivateContext,
) => Promise<Result<Response, ApiError>>;

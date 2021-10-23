import { Result } from "neverthrow";
import ApiError from "./ApiError";
import Context from "./Context";

type UseCase<Request, Response> = (request: Request, ctx: Context) => (
    Promise<Result<Response, ApiError>>
);

export default UseCase;
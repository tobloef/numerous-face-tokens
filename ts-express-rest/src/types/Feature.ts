import { Result } from "neverthrow";
import ApiError from "../ApiError";
import Context from "./Context";

type Feature<Request, Response> = (
    request: Request,
    ctx: Context,
) => Promise<Result<Response, ApiError>>;

export default Feature;
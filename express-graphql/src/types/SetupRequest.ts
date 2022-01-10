import express from "express";
import { Result } from "neverthrow";
import ApiError from "../ApiError";

type SetupRequest<Request, Params extends object> = (
  req: express.Request<Params>,
) => Result<Request, ApiError>;

export default SetupRequest;

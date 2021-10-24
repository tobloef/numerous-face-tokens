import express from "express";
import { Result } from "neverthrow";
import ApiError from "../ApiError";

type SetupRequest<Request> = (
    req: express.Request,
) => Result<Request, ApiError>;

export default SetupRequest;
import express from "express";
import { Result } from "neverthrow";
import ApiError from "../ApiError";

type SetupRequest<Request> = (
    req: express.Request,
    res: express.Response,
) => Result<Request, ApiError>;

export default SetupRequest;
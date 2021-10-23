import express, { Request } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client"
import { getUsersOverview, setupGetUsersOverviewRequest } from "./features/users/getUsersOverview";
import { getUserDetails, setupGetUserDetailsRequest } from "./features/users/getUserDetails";
import Context from "./types/Context";
import { Result } from "neverthrow";
import ApiError from "./ApiError";
import Feature from "./types/feature";
import SetupRequest from "./types/SetupRequest";
import { createUser, setupCreateUserRequest } from "./features/users/createUser";
import { setupUpdateUserRequest, updateUser } from "./features/users/updateUser";

dotenv.config({ path: "../.env" });

const ctx: Context = {
  prisma: new PrismaClient(),
}

const handleApiError = (
  req: express.Request,
  res: express.Response,
  error: ApiError,
): void => {
  res.status(error.statusCode).send(error.message);
}

function createHandler<Request, Response>(
  setupRequest: SetupRequest<Request>,
  feature: Feature<Request, Response>,
): ((req: express.Request, res: express.Response) => Promise<void>) {
  return async (req: express.Request, res: express.Response) => {
    const requestResult = setupRequest(req, res);
    if (requestResult.isErr()) {
      handleApiError(req, res, requestResult.error);
      return;
    }

    const responseResult = await feature(requestResult.value, ctx);
    if (responseResult.isErr()) {
      handleApiError(req, res, responseResult.error);
      return;
    }

    res.status(200).json(responseResult.value);
  }
}

const app = express();

app.get("/users", createHandler(setupGetUsersOverviewRequest, getUsersOverview));
app.get("/users/:id", createHandler(setupGetUserDetailsRequest, getUserDetails));
app.post("/users", createHandler(setupCreateUserRequest, createUser));
app.patch("/users/:id", createHandler(setupUpdateUserRequest, updateUser));

app.listen(process.env.API_PORT, () => {
  console.info(`Started API on port ${process.env.API_PORT}.`);
});
import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client"
import Context from "./types/Context";
import ApiError from "./ApiError";
import Feature from "./types/feature";
import SetupRequest from "./types/SetupRequest";
import { createUser, setupCreateUserRequest } from "./features/users/createUser";
import { setupUpdateUserRequest, updateUser } from "./features/users/updateUser";
import { getUser, setupGetUserRequest } from "./features/users/getUser";
import { getAllUsers, setupGetAllUsersRequest } from "./features/users/getAllUsers";

dotenv.config({ path: "../.env" });

const ctx: Context = {
  prisma: new PrismaClient(),
}

const handleApiError = (
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
    const requestResult = setupRequest(req);
    if (requestResult.isErr()) {
      handleApiError(res, requestResult.error);
      return;
    }

    const responseResult = await feature(requestResult.value, ctx);
    if (responseResult.isErr()) {
      handleApiError(res, responseResult.error);
      return;
    }

    res.status(200).json(responseResult.value);
  }
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/users", createHandler(setupGetAllUsersRequest, getAllUsers));
app.get("/users/:username", createHandler(setupGetUserRequest, getUser));
app.post("/users", createHandler(setupCreateUserRequest, createUser));
app.patch("/users/:username", createHandler(setupUpdateUserRequest, updateUser));

app.listen(process.env.API_PORT, () => {
  console.info(`Started API on port ${process.env.API_PORT}.`);
});
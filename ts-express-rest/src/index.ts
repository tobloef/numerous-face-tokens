import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client"
import Context from "./types/Context";
import ApiError from "./ApiError";
import Feature from "./types/feature";
import SetupRequest from "./types/SetupRequest";
import { setupUpdateUserRequest, updateUser } from "./features/users/updateUser";
import { getUser, setupGetUserRequest } from "./features/users/getUser";
import { getAllUsers, setupGetAllUsersRequest } from "./features/users/getAllUsers";
import authMiddleware from "./middleware/authMiddleware";
import { login, setupLoginRequest } from "./features/auth/login";
import { setupSignupRequest, signup } from "./features/auth/signup";
import { Result } from "neverthrow";

dotenv.config({ path: "../.env" });

const prismaClient = new PrismaClient();

const ctx: Context = {
  prisma: prismaClient,
};

const handleApiError = (
  res: express.Response,
  error: ApiError,
): void => {
  res.status(error.statusCode).json({ error: error.message });
}

function createHandler<Request, Response>(
  setupRequest: SetupRequest<Request>,
  feature: Feature<Request, Response>,
): ((req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {      
      const requestResult = setupRequest(req);
      if (requestResult.isErr()) {
        handleApiError(res, requestResult.error);
        return;
      }

      let responseResult: Result<Response, ApiError>;

      try {
        await prismaClient.$transaction(async (transactionPrisma) => {
          responseResult = await feature(
            requestResult.value,
            {
              ...ctx,
              prisma: transactionPrisma,
            }
          );
        });
      } catch (error) {
        next(error);
        return;
      }

      // @ts-ignore
      responseResult = responseResult as Result<Response, ApiError>

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

app.post("/login", createHandler(setupLoginRequest, login));
app.post("/signup", createHandler(setupSignupRequest, signup));
app.get("/users", createHandler(setupGetAllUsersRequest, getAllUsers));
app.get("/users/:username", createHandler(setupGetUserRequest, getUser));
app.patch("/users/:username", authMiddleware(ctx), createHandler(setupUpdateUserRequest, updateUser));

app.listen(process.env.API_PORT, () => {
  console.info(`Started API on port ${process.env.API_PORT}.`);
});
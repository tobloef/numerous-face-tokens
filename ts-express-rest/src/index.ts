import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client"
import ApiError from "./ApiError";
import { PrivateFeature, PublicFeature } from "./types/feature";
import SetupRequest from "./types/SetupRequest";
import { setupUpdateUserRequest, updateUser } from "./features/users/updateUser";
import { getUser, setupGetUserRequest } from "./features/users/getUser";
import { getAllUsers, setupGetAllUsersRequest } from "./features/users/getAllUsers";
import authMiddleware from "./middleware/authMiddleware";
import { login, setupLoginRequest } from "./features/auth/login";
import { setupSignupRequest, signup } from "./features/auth/signup";
import { Result } from "neverthrow";
import { PrivateContext, PublicContext } from "./types/Context";

dotenv.config({ path: "../.env" });

const prismaClient = new PrismaClient();

const handleApiError = (
  res: express.Response,
  error: ApiError,
): void => {
  res.status(error.statusCode).json({ error: error.message });
}

type HandlerProp<Request, Response> = 
  | {
    setupRequest: SetupRequest<Request>,
    feature: PrivateFeature<Request, Response>,
    auth: true
  }
  | {
    setupRequest: SetupRequest<Request>,
    feature: PublicFeature<Request, Response>,
    auth: false
  }

type ExpressHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>;

function createHandler<Request, Response>(props: HandlerProp<Request, Response>): ExpressHandler {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {      
    // TODO  
    const requestResult = props.setupRequest(req);
      if (requestResult.isErr()) {
        handleApiError(res, requestResult.error);
        return;
      }

      let responseResult: Result<Response, ApiError>;

      try {
        await prismaClient.$transaction(async (transactionPrisma) => {                   
          const publicContext = {
            prisma: transactionPrisma,
          };
          
          if (props.auth) {
            if (req.user === undefined) {
              res.status(401).send("Unauthenticated");
              return;
            }

            const privateContext = {
              ...publicContext,
              user: req.user,
            };
            
            responseResult = await props.feature(
              requestResult.value,
              privateContext,
            );
          } else {
            responseResult = await props.feature(
              requestResult.value,
              publicContext,
            );
          }
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
app.use(authMiddleware(prismaClient));

// Routes

app.post(
  "/login",
  createHandler({
    setupRequest: setupLoginRequest,
    feature: login,
    auth: false
  })
);

app.post(
  "/signup",
  createHandler({
    setupRequest: setupSignupRequest,
    feature: signup,
    auth: false
  }),
);

app.get(
  "/users",
  createHandler({
    setupRequest: setupGetAllUsersRequest,
    feature: getAllUsers,
    auth: false
  }),
);

app.get(
  "/users/:username",
  createHandler({
    setupRequest: setupGetUserRequest,
    feature: getUser,
    auth: false
  }),
);

app.patch(
  "/users/:username",
  createHandler({
    setupRequest: setupUpdateUserRequest,
    feature: updateUser,
    auth: true
  }),
);

app.listen(process.env.API_PORT, () => {
  console.info(`Started API on port ${process.env.API_PORT}.`);
});
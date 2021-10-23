import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client"
import createUser from "./features/users/createUser";
import runUseCase from "./runUseCase";
import getUsersOverview from "./features/users/getUsersOverview";
import getUserDetails from "./features/users/getUserDetails";
import updateUser from "./features/users/updateUser";
import Context from "./Context";
import ParseRouteParameters from "./ParseRouteParameters";
import ApiError from "./ApiError";
import { Result } from "neverthrow";
import UseCase from "./UseCase";

dotenv.config({ path: "../.env" });

const ctx: Context = {
  prisma: new PrismaClient(),
}

const app = express();

const route = "/users/:id";

function setupEndpoint<
  Path extends string,
  Params extends ParseRouteParameters<Path>,
  Request,
  Response,
>({
  router,
  path,
  method,
  makeRequest,
  useCase,
}: {
  router: express.Router,
  path: Path,
  method: "get" | "post" | "patch" | "delete"
  makeRequest: (req: express.Request, res: express.Response) => Result<Request, ApiError>,
  useCase: UseCase<Request, Response>,
}): void {
  app[method](route, async (req: express.Request, res: express.Response) => {
    const requestResult: Result<Request, ApiError> = makeRequest(req, res);
    if (requestResult.isErr()) {

    }
    const response: Response = await useCase(request);
  });
}

setupEndpoint({
  router: app,
  path: "/users/:id",
  makeRequest: makeCreateUser,
  useCase: createUser,
});



app.get("/users", runUseCase(getUsersOverview));
app.post("/users", runUseCase(createUser));
app.get("/users/:id", runUseCase(getUserDetails));
app.patch("/users/:id", runUseCase(updateUser));

app.listen(process.env.API_PORT, () => {
  console.info(`Started API on port ${process.env.API_PORT}.`);
});
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import express from "express";
import { PrismaClient } from "@prisma/client"
import authMiddleware from "./middleware/authMiddleware";
import authRouter from "./routers/authRouter";
import nftsRouter from "./routers/nftsRouter";
import tradesRouter from "./routers/tradesRouter";
import usersRouter from "./routers/usersRouter";
import { createRegisterRoute } from "./utils/expressHandler";
import env from "./utils/env";
import { removePropertiesRecursivelyMiddleware } from "./middleware/removePasswordsMiddleware";

const prismaClient = new PrismaClient();

const registerRoute = createRegisterRoute(prismaClient);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware(prismaClient));
app.use(removePropertiesRecursivelyMiddleware(["passwordHash"]));

app.use(authRouter(registerRoute));
app.use(nftsRouter(registerRoute));
app.use(tradesRouter(registerRoute));
app.use(usersRouter(registerRoute));

app.listen(env.API_PORT, () => {
  console.info(`Started API on port ${env.API_PORT}.`);
});

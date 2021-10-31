import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client"
import authMiddleware from "./middleware/authMiddleware";
import authRouter from "./routers/authRouter";
import nftsRouter from "./routers/nftsRouter";
import tradesRouter from "./routers/tradesRouter";
import usersRouter from "./routers/usersRouter";
import { createRegisterRoute } from "./utils/expressHandler";

dotenv.config({ path: "../.env" });

const prismaClient = new PrismaClient();

const registerRoute = createRegisterRoute(prismaClient);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware(prismaClient));

app.use(authRouter(registerRoute));
app.use(nftsRouter(registerRoute));
app.use(tradesRouter(registerRoute));
app.use(usersRouter(registerRoute));

app.listen(process.env.API_PORT, () => {
  console.info(`Started API on port ${process.env.API_PORT}.`);
});

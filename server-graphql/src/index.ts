import "reflect-metadata";

import dotenv from "dotenv";
dotenv.config({path: "../.env"});

import {
  ApolloServer,
  AuthenticationError,
} from "apollo-server";
import {
  AuthChecker,
  buildSchema,
} from "type-graphql";
import express from "express";
import jwt from "jsonwebtoken";
import { NftResolver } from "./types/nft/Nft.resolver";
import { Database } from "./utils/db";
import User from "./types/user/User.entity";
import env from "./utils/env";

const authChecker: AuthChecker<Context> = ({ context }) => {
  return context.user != null;
}

type ReqRes = {
  req: express.Request,
  res: express.Response
};

type AuthPayload = {
  userId: string,
}

const getAuthUser = async ({ req, res }: ReqRes): Promise<User | undefined> => {
  const authHeader = req.headers.authorization;

  if (authHeader == undefined) {
    return undefined;
  }

  if (!/^Bearer .+$/.test(authHeader)) {
    throw new AuthenticationError("Invalid authorization header");
  }

  const unvalidatedAuthToken = authHeader.replace(/^Bearer /, "");

  let payload: AuthPayload;

  try {
    payload = jwt.verify(unvalidatedAuthToken, env.AUTH_SECRET) as AuthPayload;
  } catch (error) {
    throw new AuthenticationError("Invalid auth token");
  }

  const user = await Database.manager.findOne(User, {
    where: {
      id: payload.userId
    }
  });

  if (user == null) {
    throw new AuthenticationError("Logged in user not found");
  }

  return user;
}

type Context = {
  user?: User,
};

(async () => {
  await Database.initialize();

  const schema = await buildSchema({
    resolvers: [NftResolver],
    authChecker,
  })

  const server = new ApolloServer({
    schema,
    context: async ({ req, res }: ReqRes): Promise<Context> => ({
      user: await getAuthUser({ req, res })
    }),
  });

  const {url} = await server.listen();
  console.info(`Started server on ${url}`);
})();

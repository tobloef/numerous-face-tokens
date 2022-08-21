import "reflect-metadata";

import dotenv from "dotenv";

dotenv.config({path: "../.env"});

import {
  ApolloServer,
} from "apollo-server";
import {
  buildSchema,
} from "type-graphql";
import { Database } from "./utils/db";
import User from "./stuff/user/User.entity";
import { ReqRes } from "./utils/types";
import getAuthUserContext from "./stuff/auth/getAuthUserContext";
import gqlAuthChecker from "./stuff/auth/gqlAuthChecker";
import { NftResolver } from "./stuff/nft/Nft.resolver";
import { UserResolver } from "./stuff/user/User.resolver";
import { AuthResolver } from "./stuff/auth/Auth.resolver";

type Context = {
  user?: User,
};

(async () => {
  await Database.initialize();

  const schema = await buildSchema({
    resolvers: [NftResolver, UserResolver, AuthResolver],
    authChecker: gqlAuthChecker,
  })

  const server = new ApolloServer({
    schema,
    context: async ({req, res}: ReqRes): Promise<Context> => ({
      user: await getAuthUserContext({req, res}),
    }),
  });

  const {url} = await server.listen();
  console.info(`Started server on ${url}`);
})();

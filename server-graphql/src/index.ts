import "reflect-metadata";

import dotenv from "dotenv";
dotenv.config({path: "../.env"});

import {
  ApolloServer,
} from "apollo-server";
import {
  buildSchema,
} from "type-graphql";
import { NftResolver } from "./types/nft/Nft.resolver";
import { Database } from "./utils/db";

(async () => {
  await Database.initialize();

  const schema = await buildSchema({
    resolvers: [NftResolver],
  })

  const server = new ApolloServer({ schema });

  const {url} = await server.listen();
  console.info(`Started server on ${url}`);
})();

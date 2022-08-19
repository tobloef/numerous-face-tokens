import "reflect-metadata";

import {
  ApolloServer,
} from "apollo-server";
import { buildSchema } from "type-graphql";
import { NftResolver } from "./models/nft/NftResolver";

(async () => {
  const schema = await buildSchema({
    resolvers: [NftResolver],
  })

  const server = new ApolloServer({ schema });

  const {url} = await server.listen();
  console.info(`Started server on ${url}`);
})();

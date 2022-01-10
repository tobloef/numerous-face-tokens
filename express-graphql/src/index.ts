import dotenv from "dotenv";
dotenv.config({path: "../.env"});

import express from "express";
import http from "http";
import WebSocket from "ws";
import {
  PrismaClient,
} from "@prisma/client"
import env from "./utils/env";
import {
  getEventCache,
} from "./eventNotifier";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphqlHTTP } from 'express-graphql';
import { DateTimeResolver } from "graphql-scalars";

/*
declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}
*/

const prismaClient = new PrismaClient();

const typeDefs = `
  scalar DateTime

  type Nft {
    id              ID!
    minterId        String!
    minter          User!
    mintedAt        DateTime
    ownerId         String!
    owner           User!
    seed            String!
    trades          [Trade!]!
    lastTradeId     String
    lastTrade       Trade
    highestTradeId  String
    highestTrade    Trade
  }
  
  type User {
    id            String!
    createdAt     DateTime!
    username      String!
    passwordHash  String!
    balance       Int!
    ownedNfts     [Nft!]!
    mintedNfts    [Nft!]!
    boughtTrades  [Trade!]!
    soldTrades    [Trade!]!
  }
  
  type Trade {
    id                   String!
    createdAt            DateTime!
    sellerId             String!
    seller               User!
    sellerAccepted       Boolean!
    buyerId              String
    buyer                User
    buyerAccepted        Boolean!
    soldAt               DateTime
    nftId                String!
    nft                  Nft!
    price                Int!
    lastTradeOfNft       Nft
    highestTradeOfNft    Nft
  }
`;

const resolvers = {
  DateTime: DateTimeResolver,
  Query: {
    allNfts: async () => {

    },
    nft: async () => {

    },
    allUsers: async () => {

    },
    user: async () => {

    },
    allTrades: async () => {

    },
    trade: async () => {

    },
  },
  Mutation: {
    login: async () => {

    },
    signup: async () => {

    },
    createNft: async () => {

    },
    acceptTrade: async () => {

    },
    createTrade: async () => {

    },
    deleteTrade: async () => {

    },
    updateUser: async () => {

    },
  }
};
export const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
});

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({
  path: "/log",
  server,
});

wss.on("connection", (client) => {
  client.send(JSON.stringify(getEventCache()));
})

//app.use(cors())
//app.use(express.json());
//app.use(express.urlencoded({extended: true}));
//app.use(authMiddleware(prismaClient));
//app.use(removePropertiesRecursivelyMiddleware(["passwordHash"]));
//app.use(morgan("tiny"));

app.use('/graphql', graphqlHTTP({
  schema,
}));

server.listen(env.API_PORT, () => {
  console.info(`Started API on port ${env.API_PORT}.`);
});

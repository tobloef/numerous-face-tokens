import {
    ApolloServer,
    gql,
} from "apollo-server";

const typeDefs = gql`
    scalar DateTime
    
    type Nft {
        minter: User!
        mintedAt: DateTime!
        owner: User!
        seed: String!
        trades: [Trade]!
        lastTrade: Trade
        highestTrade: Trade
    }
    
    type User {
        createdAt: DateTime!
        username: String!
        balance: Int!
        ownedNfts: [Nft]!
        mintedNfts: [Nft]!
        boughtTrades: [Trade]!
        soldTrades: [Trade]!
    }
    
    type Trade {
        createdAt: DateTime!
        seller: User!
        buyer: User
        sellerAccepted: Boolean!
        buyerAccepted: Boolean!
        soldAt: DateTime
        nft: Nft!
        price: Int
    }
    
    type Query {
        users: [User]
        trades: [Trade]
        nfts: [Nft]
    }
`;

const resolvers = {
    Query: {
        users: () => users,
        trades: () => trades,
        nfts: () => nfts,
    }
}

const users = [];
const trades = [];
const nfts = [];

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

(async () => {
    const { url } = await server.listen();
    console.info(`Started server on ${url}`);
})();

import express from "express";
import { createNft, setupCreateNftRequest } from "../features/nfts/createNft";
import { getAllNfts, setupGetAllNftsRequest } from "../features/nfts/getAllNfts";
import { getNft, setupGetNftRequest } from "../features/nfts/getNft";
import { RegisterRoute } from "../utils/expressHandler";

const makeRouter = (registerRoute: RegisterRoute): express.Router => {
    const router = express.Router();

    registerRoute({
        path: "/nfts",
        method: 'get',
        feature: getAllNfts,
        setupRequest: setupGetAllNftsRequest,
        auth: false,
        router,
    });

    registerRoute({
        path: "/nfts",
        method: 'post',
        feature: createNft,
        setupRequest: setupCreateNftRequest,
        auth: true,
        router,
    });

    registerRoute({
        path: "/nfts/:seed",
        method: 'get',
        feature: getNft,
        setupRequest: setupGetNftRequest,
        auth: false,
        router,
    });

    return router;
}

export default makeRouter;

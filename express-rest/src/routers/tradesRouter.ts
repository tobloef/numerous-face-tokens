import express from "express";
import { acceptTrade, setupAcceptTradeRequest } from "../features/trades/acceptTrade";
import { createTrade, setupCreateTradeRequest } from "../features/trades/createTrade";
import { deleteTrade, setupDeleteTradeRequest } from "../features/trades/deleteTrade";
import { getAllTrades, setupGetAllTradesRequest } from "../features/trades/getAllTrades";
import { getTrade, setupGetTradeRequest } from "../features/trades/getTrade";
import { RegisterRoute } from "../utils/expressHandler";

const makeRouter = (registerRoute: RegisterRoute): express.Router => {
    const router = express.Router();

    registerRoute({
        path: "/trades",
        method: 'get',
        feature: getAllTrades,
        setupRequest: setupGetAllTradesRequest,
        auth: false,
        router,
    });

    registerRoute({
        path: "/trades",
        method: 'post',
        feature: createTrade,
        setupRequest: setupCreateTradeRequest,
        auth: true,
        router,
    });

    registerRoute({
        path: "/trades/:id",
        method: 'get',
        feature: getTrade,
        setupRequest: setupGetTradeRequest,
        auth: false,
        router,
    });

    registerRoute({
        path: "/trades/:id",
        method: 'delete',
        feature: deleteTrade,
        setupRequest: setupDeleteTradeRequest,
        auth: true,
        router,
    });

    registerRoute({
        path: "/trades/:id/accept",
        method: 'post',
        feature: acceptTrade,
        setupRequest: setupAcceptTradeRequest,
        auth: true,
        router,
    });

    return router;
}

export default makeRouter;

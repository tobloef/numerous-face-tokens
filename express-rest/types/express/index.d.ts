import { User } from "@prisma/client";
import expressWs from "express-ws"

declare module 'express-serve-static-core' {
    interface Request {
        user?: User
    }

    interface Express {
        ws: expressWs.WebsocketMethod<this>;
    }

    interface Router {
        ws: expressWs.WebsocketMethod<this>;
    }
}
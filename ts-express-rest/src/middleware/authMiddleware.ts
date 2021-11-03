import { PrismaClient } from ".prisma/client";
import express from "express";
import jwt from "jsonwebtoken";
import AuthPayload from "../types/AuthPayload";
import deleteProp from "../utils/deleteProp";
import env from "../utils/env";

const authMiddleware = (prisma: PrismaClient) => (
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const authHeader = req.header("Authorization");

        if (authHeader === undefined) {
            next();
            return;
        }
    
        if (!/^Bearer .+$/.test(authHeader)) {
            res.status(400).json({ error: "Invalid authorization header" });
            return;
        }
    
        const unvalidatedAuthToken = authHeader.replace(/^Bearer /, "");

        let payload: AuthPayload;
        
        try {
            payload = jwt.verify(unvalidatedAuthToken, env.AUTH_SECRET!) as AuthPayload;
        } catch (error) {
            res.status(401).json({ error: "Invalid auth token" })
            return;
        }

        const userWithPassword = await prisma.userWithPassword.findUnique({
            where: {
                id: payload.user.id,
            }
        });

        if (userWithPassword === null) {
            res.status(401).json({ error: "User not found" })
            return;
        }

        const user = deleteProp(userWithPassword, "passwordHash");

        req.user = user;
        next();
    }
)

export default authMiddleware;
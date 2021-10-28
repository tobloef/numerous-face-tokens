import { UserWithPassword } from "@prisma/client";
import express from "express";
import { is } from "typescript-is";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import deleteProp from "../../utils/deleteProp";
import User from "../../types/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AuthToken from "../../types/AuthToken";
import AuthPayload from "../../types/AuthPayload";

type LoginRequest = {
    username: string,
    password: string,
};

type LoginResponse = AuthToken;

export const login: Feature<LoginRequest, LoginResponse> = async (
    request,
    ctx,
) => {
    const userWithPassword = await ctx.prisma.userWithPassword.findUnique({
        where: {
            username: request.username,
        }
    });

    if (userWithPassword === null) {
        return err(new ApiError("User not found", 404));
    }

    if (!bcrypt.compareSync(request.password, userWithPassword.passwordHash)) {
        return err(new ApiError("Wrong password", 401));
    }

    const user = deleteProp(userWithPassword, "passwordHash");

    const authPayload: AuthPayload = {
        user,
    };

    const token = jwt.sign(authPayload, process.env.AUTH_SECRET!) as AuthToken;

    return ok(token)
};

export const setupLoginRequest: SetupRequest<LoginRequest> = (
    req: express.Request,
) => {
    if (!is<LoginRequest>(req.body)) {
        return err(new ApiError("Invalid login info", 400));
    }
    
    return ok(req.body);
}
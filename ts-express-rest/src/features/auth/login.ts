import { UserWithPassword } from "@prisma/client";
import express from "express";
import { is } from "typescript-is";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/feature";
import deleteProp from "../../utils/deleteProp";
import User from "../../types/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AuthToken from "../../types/AuthToken";
import AuthPayload from "../../types/AuthPayload";
import { SetupRequest } from "../../utils/expressHandler";

type LoginRequest = {
    username: string,
    password: string,
};

type LoginResponse = AuthToken;

export const login: PublicFeature<LoginRequest, LoginResponse> = async (
    request,
    ctx,
) => {
    const username = request.username.toLowerCase();

    const userWithPassword = await ctx.prisma.userWithPassword.findUnique({
        where: {
            username,
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

export const setupLoginRequest: SetupRequest<LoginRequest, {}> = (req) => {
    if (!is<LoginRequest>(req.body)) {
        return err(new ApiError("Invalid login info", 400));
    }
    
    return ok(req.body);
}
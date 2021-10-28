import { UserWithPassword } from "@prisma/client";
import express from "express";
import { is } from "typescript-is";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AuthPayload from "../../types/AuthPayload";
import deleteProp from "../../utils/deleteProp";
import AuthToken from "../../types/AuthToken";

type SignupRequest = {
    username: string,
    password: string,
};

type SignupResponse = AuthToken;

export const signup: Feature<SignupRequest, SignupResponse> = async (
    request,
    ctx,
) => {
    const existingUser = await ctx.prisma.userWithPassword.findUnique({
        where: {
            username: request.username,
        }
    });

    if (existingUser !== null) {
        return err(new ApiError("Username taken", 409));
    }

    const newUserWithPassword: UserWithPassword = await ctx.prisma.userWithPassword.create({
        data: {
            username: request.username,
            passwordHash: bcrypt.hashSync(request.password),
        }
    });

    const newUser = deleteProp(newUserWithPassword, "passwordHash");

    const authPayload: AuthPayload = {
        user: newUser,
    };

    const token = jwt.sign(authPayload, process.env.AUTH_SECRET!) as AuthToken;

    return ok(token);
};

export const setupSignupRequest: SetupRequest<SignupRequest> = (
    req: express.Request,
) => {
    if (!is<SignupRequest>(req.body)) {
        return err(new ApiError("Invalid signup info", 400));
    }
    
    return ok(req.body);
}
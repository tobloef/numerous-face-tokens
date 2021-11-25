import { is } from "typescript-is";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AuthPayload from "../../types/AuthPayload";
import deleteProp from "../../utils/deleteProp";
import AuthToken from "../../types/AuthToken";
import { PublicFeature } from "../../types/feature";
import { SetupRequest } from "../../utils/expressHandler";
import generateId from "../../utils/generateId";
import env from "../../utils/env";
import * as domain from "domain";
import Markdown from "../../types/Markdown";

const VALID_USERNAME_REGEX = /^[a-z0-9]{1,20}$/i;

export type SignupRequest = {
    username: string,
    password: string,
};

export type SignupResponse = AuthToken;

export const signup: PublicFeature<SignupRequest, SignupResponse> = async (
    request,
    ctx,
) => {
    if (!VALID_USERNAME_REGEX.test(request.username)) {
        return err(new ApiError("Invalid username", 400));
    }

    const existingUser = await ctx.prisma.user.findFirst({
        where: {
            username: {
                equals: request.username,
                mode: 'insensitive',
            }
        }
    });

    if (existingUser !== null) {
        return err(new ApiError("Username taken", 409));
    }

    const user = await ctx.prisma.user.create({
        data: {
            id: generateId(),
            username: request.username,
            passwordHash: bcrypt.hashSync(request.password),
            balance: 1000,
        }
    });

    const userWithoutPassword = deleteProp(user, "passwordHash");

    const authPayload: AuthPayload = {
        user: userWithoutPassword,
    };

    const token = jwt.sign(authPayload, env.AUTH_SECRET!) as AuthToken;

    ctx.notify({
        title: "User registered",
        description: `User [${user.username}](/users/${user.username}) signed up. Welcome!` as Markdown,
        time: new Date()
    });

    return ok(token);
};

export const setupSignupRequest: SetupRequest<SignupRequest, {}> = (req) => {
    if (!is<SignupRequest>(req.body)) {
        return err(new ApiError("Invalid signup info", 400));
    }

    return ok(req.body);
}

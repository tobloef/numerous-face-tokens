import { is } from "typescript-is";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/feature";
import deleteProp from "../../utils/deleteProp";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AuthToken from "../../types/AuthToken";
import AuthPayload from "../../types/AuthPayload";
import { SetupRequest } from "../../utils/expressHandler";
import env from "../../utils/env";

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

    const user = await ctx.prisma.user.findUnique({
        where: {
            username,
        }
    });

    if (user === null) {
        return err(new ApiError("User not found", 404));
    }

    if (!bcrypt.compareSync(request.password, user.passwordHash)) {
        return err(new ApiError("Wrong password", 401));
    }

    const userWithoutPassword = deleteProp(user, "passwordHash");

    const authPayload: AuthPayload = {
        user: userWithoutPassword,
    };

    const token = jwt.sign(authPayload, env.AUTH_SECRET!) as AuthToken;

    return ok(token)
};

export const setupLoginRequest: SetupRequest<LoginRequest, {}> = (req) => {
    if (!is<LoginRequest>(req.body)) {
        return err(new ApiError("Invalid login info", 400));
    }
    
    return ok(req.body);
}
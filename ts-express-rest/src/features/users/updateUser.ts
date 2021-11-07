import { Nft, Trade, UserWithPassword } from "@prisma/client";
import { is } from "typescript-is";
import { err, ok } from "neverthrow";
import { PrivateFeature, PublicFeature } from "../../types/feature";
import ApiError from "../../ApiError";
import User from "../../types/User";
import deleteProp from "../../utils/deleteProp";
import bcrypt from "bcryptjs";
import { SetupRequest } from "../../utils/expressHandler";

type UpdateUserRequest = {
    username: string,
    patch: {
        password?: string,
    }
};

type UpdateUserResponse = 
    & User
    & {
        boughtTrades: Trade[];
        soldTrades: Trade[];
        ownedNfts: Nft[];
        mintedNfts: Nft[];
    };

export const updateUser: PrivateFeature<UpdateUserRequest, UpdateUserResponse> = async (
    request,
    ctx,
) => {
    const username = request.username.toLowerCase();

    if (username !== ctx.user.username.toLowerCase()) {
        return err(new ApiError("Cannot update user other than yourself", 403));
    }

    const existingUser = await ctx.prisma.userWithPassword.findUnique({
        where: {
            username,
        }
    });

    if (existingUser === null) {
        return err(new ApiError("User not found", 404));
    }

    const user = await ctx.prisma.userWithPassword.update({
        where: {
            username,
        },
        data: {
            passwordHash: request.patch.password !== undefined
                ? bcrypt.hashSync(request.patch.password)
                : undefined
        },
        include: {
            boughtTrades: true,
            soldTrades: true,
            ownedNfts: true,
            mintedNfts: true,
        }
    });

    const userWithoutPassword = deleteProp(user, "passwordHash");

    return ok(userWithoutPassword);
};

export const setupUpdateUserRequest: SetupRequest<UpdateUserRequest, { username: string }> = (req) => {
    if (!is<UpdateUserRequest["patch"]>(req.body)) {
        return err(new ApiError("Invalid user", 400));
    }
    
    return ok({
        username: req.params.username,
        patch: req.body,
    });
}
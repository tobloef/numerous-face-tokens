import {
  Nft,
  Trade,
  User,
} from "@prisma/client";
import { is } from "typescript-is";
import {
  err,
  ok,
} from "neverthrow";
import { PrivateFeature } from "../../types/feature";
import ApiError from "../../ApiError";
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

  const existingUser = await ctx.prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (existingUser === null) {
    return err(new ApiError("User not found", 404));
  }

  const user = await ctx.prisma.user.update({
    where: {
      username,
    },
    data: {
      passwordHash: request.patch.password !== undefined
        ? bcrypt.hashSync(request.patch.password)
        : undefined,
    },
    include: {
      boughtTrades: true,
      soldTrades: true,
      ownedNfts: true,
      mintedNfts: true,
    },
  });

  return ok(user);
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

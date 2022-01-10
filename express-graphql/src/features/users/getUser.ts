import {
  Nft,
  Trade,
  User,
} from "@prisma/client";
import {
  err,
  ok,
} from "neverthrow";
import { is } from "typescript-is";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/Feature";
import SetupRequest from "../../types/SetupRequest";

export type GetUserRequest = {
  username: string,
};

export type GetUserResponse =
  & User
  & {
  boughtTrades: Trade[];
  soldTrades: Trade[];
  ownedNfts: Nft[];
  mintedNfts: Nft[];
};

export const getUser: PublicFeature<GetUserRequest, GetUserResponse> = async (
  request,
  ctx,
) => {
  const user = await ctx.prisma.user.findUnique({
    where: {
      username: request.username,
    },
    include: {
      boughtTrades: true,
      soldTrades: true,
      ownedNfts: true,
      mintedNfts: true,
    },
  });

  if (user == null) {
    return err(new ApiError(`No user found with username '${request.username}'.`, 404));
  }

  return ok(user);
};

export const setupGetUserRequest: SetupRequest<GetUserRequest, { username: string }> = (req) => {
  if (!is<string>(req.params.username)) {
    return err(new ApiError("Invalid username", 400));
  }

  return ok({
    username: req.params.username,
  });
}

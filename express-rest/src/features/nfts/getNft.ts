import {
  Nft,
  Trade,
  User,
} from "@prisma/client";
import {
  err,
  ok,
} from "neverthrow";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/feature";
import deleteProp from "../../utils/deleteProp";
import SetupRequest from "../../types/SetupRequest";

export type GetNftRequest = {
  seed: string,
};

export type GetNftResponse =
  & Nft
  & {
  minter: User;
  owner: User;
  trades: Trade[];
  lastTrade: Trade | null;
  highestTrade: Trade | null;
};

export const getNft: PublicFeature<GetNftRequest, GetNftResponse> = async (
  request,
  ctx,
) => {
  const nftWithUserPasswords = await ctx.prisma.nft.findUnique({
    where: {
      seed: request.seed,
    },
    include: {
      minter: true,
      owner: true,
      trades: true,
      lastTrade: true,
      highestTrade: true,
    },
  });

  if (nftWithUserPasswords == null) {
    return err(new ApiError("NFT not found", 404));
  }

  const nft = {
    ...nftWithUserPasswords,
    minter: deleteProp(nftWithUserPasswords.minter, "passwordHash"),
    owner: deleteProp(nftWithUserPasswords.owner, "passwordHash"),
  };

  return ok(nft);
};

export const setupGetNftRequest: SetupRequest<GetNftRequest, { seed: string }> = (req) => {
  return ok({
    seed: req.params.seed,
  });
}

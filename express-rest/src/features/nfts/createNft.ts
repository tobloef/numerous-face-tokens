import { is } from "typescript-is";
import {
    err,
    ok,
} from "neverthrow";
import ApiError from "../../ApiError";
import { PrivateFeature } from "../../types/feature";
import {
    Nft,
    Trade,
    User,
} from "@prisma/client";
import deleteProp from "../../utils/deleteProp";
import SetupRequest from "../../types/SetupRequest";
import generateId from "../../utils/generateId";
import Markdown from "../../types/Markdown";
import { getNftImageLink } from "../../utils/getNftImageLink";

const VALID_NFT_REGEX = /^[a-z0-9_]{1,30}$/i;

export type CreateNftRequest = {
  seed: string,
};

export type CreateNftResponse =
  & Nft
  & {
  minter: User;
  owner: User;
  trades: Trade[];
};

export const createNft: PrivateFeature<CreateNftRequest, CreateNftResponse> = async (
  request,
  ctx,
) => {
  if (!VALID_NFT_REGEX.test(request.seed)) {
    return err(new ApiError(
      "The seed can only contain letters, numbers and underscores, and must be between 1 and 30 characters.",
      400,
    ));
  }

  const existingNft = await ctx.prisma.nft.findUnique({
    where: {
      seed: request.seed,
    },
  });

  if (existingNft !== null) {
    return err(new ApiError("An NFT with that seed already exists", 409));
  }

  const nftWithUserPasswords = await ctx.prisma.nft.create({
    data: {
      id: generateId(),
      seed: request.seed,
      minterId: ctx.user.id,
      ownerId: ctx.user.id,
    },
    include: {
      minter: true,
      owner: true,
      trades: true,
    },
  });

  const nft = {
    ...nftWithUserPasswords,
    minter: deleteProp(nftWithUserPasswords.minter, "passwordHash"),
    owner: deleteProp(nftWithUserPasswords.owner, "passwordHash"),
  };

  ctx.notify({
    time: new Date(),
    title: `NFT Minted`,
    description: (
      `![${nft.seed}](${getNftImageLink(nft.seed)})\n\n` +
      `User [${nft.minter.username}](/users/${nft.minter.username}) minted ` +
      `NFT [${nft.seed}](/nfts/${nft.seed}).`
    ) as Markdown,
  })

  return ok(nft);
};

export const setupCreateNftRequest: SetupRequest<CreateNftRequest, {}> = (req) => {
  if (!is<CreateNftRequest>(req.body)) {
    return err(new ApiError("Invalid NFT", 400));
  }

  return ok(req.body);
}

import { is } from "typescript-is";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import { PrivateFeature } from "../../types/feature";
import { Nft, Trade, User } from "@prisma/client";
import deleteProp from "../../utils/deleteProp";
import { SetupRequest } from "../../utils/expressHandler";
import generateId from "../../utils/generateId";

type CreateNftRequest = {
    seed: string,
    title: string,
};

type CreateNftResponse = 
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
    const existingNft = await ctx.prisma.nft.findUnique({
        where: {
            seed: request.seed,
        }
    });

    if (existingNft !== null) {
        return err(new ApiError("NFT with given seed already exists", 409));
    }

    const user = await ctx.prisma.user.findUnique({
        where: {
            id: ctx.user.id,
        }
    });

    if (user === null) {
        return err(new ApiError("User not found", 404));
    }

    const nftWithUserPasswords = await ctx.prisma.nft.create({
        data: {
            id: generateId(),
            seed: request.seed,
            title: request.title,
            minterId: user.id,
            ownerId: user.id,
        },
        include: {
            minter: true,
            owner: true,
            trades: true,
        }
    });

    const nft = {
        ...nftWithUserPasswords,
        minter: deleteProp(nftWithUserPasswords.minter, "passwordHash"),
        owner: deleteProp(nftWithUserPasswords.owner, "passwordHash"),
    };

    return ok(nft);
};

export const setupCreateNftRequest: SetupRequest<CreateNftRequest, {}> = (req) => {
    if (!is<CreateNftRequest>(req.body)) {
        return err(new ApiError("Invalid NFT", 400));
    }
    
    return ok(req.body);
}
import { is } from "typescript-is";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import { PrivateFeature, PublicFeature } from "../../types/feature";
import { SetupRequest } from "../../utils/expressHandler";
import { Nft, Trade, User } from "@prisma/client";
import deleteProp from "../../utils/deleteProp";
import generateId from "../../utils/generateId";

type CreateTradeRequest = {
    sellerUsername: string,
    buyerUsername: string | null,
    nftSeed: string,
    price: number,
};

type CreateTradeResponse = 
    & Trade
    & {
        nft: Nft;
        seller: User;
        buyer: User | null;
    };

export const createTrade: PrivateFeature<CreateTradeRequest, CreateTradeResponse> = async (
    request,
    ctx,
) => {
    if (
        request.sellerUsername !== ctx.user.username &&
        request.buyerUsername !== ctx.user.username
    ) {
        return err(new ApiError("Cannot create trade you are not participating in", 403));
    }

    if (request.sellerUsername === request.buyerUsername) {
        return err(new ApiError("Cannot create trade with yourself", 400));
    }

    const seller = await ctx.prisma.user.findUnique({
        where: {
            username: request.sellerUsername,
        }
    });

    if (seller === null) {
        return err(new ApiError("Seller not found", 404));
    }

    let buyer;
    if (request.buyerUsername !== null) {
        buyer = await ctx.prisma.user.findUnique({
            where: {
                username: request.buyerUsername,
            }
        });

        if (buyer === null) {
            return err(new ApiError("Buyer not found", 404));
        }
    }

    const nft = await ctx.prisma.nft.findUnique({
        where: {
            seed: request.nftSeed,
        }
    });

    if (nft === null) {
        return err(new ApiError("NFT not found", 404));
    }

    if (nft.ownerId !== seller.id) {
        return err(new ApiError("Seller does not own the NFT", 403));
    }

    if (request.price < 0) {
        return err(new ApiError("Price cannot be negative", 400));
    }

    const tradeWithUserPasswords = await ctx.prisma.trade.create({
        data: {
            id: generateId(),
            price: request.price,
            sellerId: seller.id,
            buyerId: buyer?.id,
            nftId: nft.id,
            buyerAccepted: ctx.user.username === request.buyerUsername,
            sellerAccepted: ctx.user.username === request.sellerUsername
        },
        include: {
            buyer: true,
            nft: true,
            seller: true,
        }
    });

    const trade = {
        ...tradeWithUserPasswords,
        seller: deleteProp(tradeWithUserPasswords.seller, "passwordHash"),
        buyer: tradeWithUserPasswords.buyer !== null
            ? deleteProp(tradeWithUserPasswords.buyer, "passwordHash")
            : null,
    };

    return ok(trade);
};

export const setupCreateTradeRequest: SetupRequest<CreateTradeRequest, {}> = (req) => {
    if (!is<CreateTradeRequest>(req.body)) {
        return err(new ApiError("Invalid trade", 400));
    }
    
    return ok(req.body);
}
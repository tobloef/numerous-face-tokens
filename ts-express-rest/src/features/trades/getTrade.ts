import { Nft, Trade, User } from "@prisma/client";
import { err, ok } from "neverthrow";
import ApiError from "../../ApiError";
import { PublicFeature } from "../../types/feature";
import deleteProp from "../../utils/deleteProp";
import { SetupRequest } from "../../utils/expressHandler";

type GetTradeRequest = {
    id: string,
};

type GetTradeResponse = 
 & Trade
 & {
    nft: Nft;
    seller: User;
    buyer: User | null;
};

export const getTrade: PublicFeature<GetTradeRequest, GetTradeResponse> = async (
    request,
    ctx,
) => {
    const tradeWithUserPasswords = await ctx.prisma.trade.findUnique({
        where: {
            id: request.id,
        },
        include: {
            buyer: true,
            nft: true,
            seller: true,
        }
    });

    if (tradeWithUserPasswords == null) {
        return err(new ApiError("Trade not found", 404));
    }
    
    const trade = {
        ...tradeWithUserPasswords,
        seller: deleteProp(tradeWithUserPasswords.seller, "passwordHash"),
        buyer: tradeWithUserPasswords.buyer !== null
            ? deleteProp(tradeWithUserPasswords.buyer, "passwordHash")
            : null,
    };

    return ok(trade);
};

export const setupGetTradeRequest: SetupRequest<GetTradeRequest, { id: string }> = (req) => {
    return ok({
        id: req.params.id,
    });
}
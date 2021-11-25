import {
  err,
  ok,
} from "neverthrow";
import ApiError from "../../ApiError";
import { PrivateFeature } from "../../types/feature";
import { SetupRequest } from "../../utils/expressHandler";
import {
  SUCCESS,
  Success,
} from "../../types/Success";

export type DeleteTradeRequest = {
  id: string,
};

export type DeleteTradeResponse = Success;

export const deleteTrade: PrivateFeature<DeleteTradeRequest, DeleteTradeResponse> = async (
  request,
  ctx,
) => {
  const trade = await ctx.prisma.trade.findUnique({
    where: {
      id: request.id,
    },
  });

  if (trade == null) {
    return err(new ApiError("Trade not found", 404));
  }

  if (
    trade.sellerId !== ctx.user.id &&
    trade.buyerId !== ctx.user.id
  ) {
    return err(new ApiError("Cannot delete trade you are not participating in", 403));
  }

  await ctx.prisma.trade.delete({
    where: {
      id: request.id,
    },
  });

  return ok(SUCCESS);
};

export const setupDeleteTradeRequest: SetupRequest<DeleteTradeRequest, { id: string }> = (req) => {
  return ok({
    id: req.params.id,
  });
}

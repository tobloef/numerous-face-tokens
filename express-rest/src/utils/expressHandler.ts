import { PrismaClient } from "@prisma/client";
import express from "express";
import {
  err,
  Result,
} from "neverthrow";
import ApiError from "../ApiError";
import {
  PrivateContext,
  PublicContext,
} from "../types/Context";
import {
  PrivateFeature,
  PublicFeature,
} from "../types/feature";
import ParseRouteParameters from "../types/ParseRouteParameters";

export type SetupRequest<Request, Params extends object> = (
  req: express.Request<Params>,
) => Result<Request, ApiError>;

export type RegisterRouteProps<Request, Response, Path extends string> =
  {
    router: express.Router,
    method: "get" | "post" | "patch" | "delete"
    path: Path
    setupRequest: SetupRequest<Request, ParseRouteParameters<Path>>,
  } & (
  | {
  auth: true,
  feature: PrivateFeature<Request, Response>,
}
  | {
  auth: false,
  feature: PublicFeature<Request, Response>,
}
  )

export type RegisterRoute = <Request, Response, Path extends string>(
  props: RegisterRouteProps<Request, Response, Path>,
) => void;

export type ExpressHandler<Path> = (
  req: express.Request<ParseRouteParameters<Path>>,
  res: express.Response,
  next: express.NextFunction,
) => Promise<void>;

export const createRegisterRoute = (ctx: PublicContext & { prisma: PrismaClient }) => {
  return function registerRoute<Request, Response, Path extends string>(
    props: RegisterRouteProps<Request, Response, Path>,
  ) {
    const expressHandler: ExpressHandler<Path> = async (req, res, next) => {
      const requestResult = props.setupRequest(req);

      if (requestResult.isErr()) {
        res.status(requestResult.error.statusCode).json({
          error: requestResult.error.message,
        });
        return;
      }

      let responseResult: Result<Response, ApiError>;

      try {
        responseResult = await ctx.prisma.$transaction(
          async (transactionPrisma): Promise<Result<Response, ApiError>> => {
            const newPublicContext: PublicContext = {
              ...ctx,
              prisma: transactionPrisma,
            }

            if (props.auth) {
              if (req.user === undefined) {
                return err(new ApiError("Unauthenticated", 403));
              }

              const privateContext: PrivateContext = {
                ...newPublicContext,
                user: req.user,
              };

              return props.feature(requestResult.value, privateContext);
            } else {
              return props.feature(requestResult.value, newPublicContext);
            }
          },
        );
      } catch (error) {
        next(error);
        return;
      }

      if (responseResult.isErr()) {
        res.status(responseResult.error.statusCode).json({error: responseResult.error.message})
        return;
      }

      res.status(200).json(responseResult.value);
    };

    props.router[props.method](props.path, expressHandler);
  };
};

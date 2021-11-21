import qs from "qs";
import BaseError from "./BaseError";
import { getLocalAuthToken } from "./localStorage";
import {
  GetAllUsersRequest,
  GetAllUsersResponse,
} from "../../../express-rest/src/features/users/getAllUsers";
import {
  Sorts,
} from "../../../express-rest/src/utils/query";
import deleteProp from "../../../express-rest/src/utils/deleteProp";
import {
  GetAllNftsRequest,
  GetAllNftsResponse,
} from "../../../express-rest/src/features/nfts/getAllNfts";
import {
  CreateNftRequest,
  CreateNftResponse,
} from "../../../express-rest/src/features/nfts/createNft";
import {
  GetAllTradesRequest,
  GetAllTradesResponse,
} from "../../../express-rest/src/features/trades/getAllTrades";
import {
  AcceptTradeRequest,
  AcceptTradeResponse,
} from "../../../express-rest/src/features/trades/acceptTrade";
import {
  DeleteTradeRequest,
  DeleteTradeResponse,
} from "../../../express-rest/src/features/trades/deleteTrade";

const BASE_URL = "http://localhost:3010";

const trimLeadingSlash = (str: string): string => str.replace(/^\//, "");

type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

export const makeRequest = async <Req extends object, Res>(
  method: HttpMethod,
  path: string,
  request: SerializeFilters<SerializeSorts<Req>>,
): Promise<SerializeDates<Res>> => {
  const canHaveBody = (
    method === "POST" ||
    method === "PUT" ||
    method === "PATCH"
  );
  let url = `${BASE_URL}/${trimLeadingSlash(path)}`;
  if (!canHaveBody) {
    url += `?${qs.stringify(request)}`;
  }

  let headers: HeadersInit = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  const authToken = getLocalAuthToken();
  if (authToken != undefined) {
    headers = {
      ...headers,
      "Authorization": `Bearer ${authToken}`,
    };
  }

  const fetchOptions: RequestInit = {
    method,
    body: canHaveBody ? JSON.stringify(request) : undefined,
    headers,
  };

  const checkResponse = async (
    response: Response,
  ): Promise<SerializeDates<Res>> => {
    if (!response.ok) {
      let body;

      try {
        body = await response.json();
      } catch (e) {
        // Ignored
      }

      if (body?.error != null) {
        throw new BaseError({
          message: body?.error,
          userFacing: true,
        });
      }

      throw new BaseError({
        message: response.statusText ?? "An error occurred",
        userFacing: true,
      });
    }

    return await response.json();
  };

  let response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    throw new BaseError({
      message: "Could not connect to the server",
      userFacing: true,
      innerError: error as Error,
    })
  }

  return checkResponse(response);
};

type SerializeDates<T> =
  T extends Array<any>
    ? Array<SerializeDates<T[number]>>
    : (
      T extends object
        ? { [Key in keyof T]: (
          T[Key] extends Date
            ? string
            : (
              T[Key] extends (Date | null)
                ? (string | null)
                : SerializeDates<T[Key]>
            )
          ) }
        : T
      );

type SerializeSorts<Obj extends object> = {
  [Key in keyof Obj]: Key extends "sorts" ? string : Obj[Key]
}

type SerializeFilters<Req extends object> = Req extends { filters?: object }
  ? Omit<Req, "filters"> & Req["filters"]
  : Req;

const serializeSort = <T extends object>(sorts: Sorts<T>): string => {
  return sorts
    .map(([key, order]) => `${order === "asc" ? "+" : "-"}${key}`)
    .join(",");
};


function parseDate(input: string): Date {
  return new Date(Date.parse(input));
}

function parseDateIfNotNull(input: string | null): Date | null {
  if (input === null) {
    return null;
  }

  return parseDate(input);
}

/* -------------------------------------------------- */

export const getAllUsers = async (request: GetAllUsersRequest): Promise<GetAllUsersResponse> => {
  const response = await makeRequest<GetAllUsersRequest, GetAllUsersResponse>(
    "GET",
    "/users",
    deleteProp({
      ...request,
      sorts: serializeSort(request.sorts),
      ...request.filters,
    }, "filters"),
  );

  return {
    ...response,
    users: response.users.map((user) => ({
      ...user,
      createdAt: parseDate(user.createdAt),
    }))
  }
}

export const getAllNfts = async (request: GetAllNftsRequest): Promise<GetAllNftsResponse> => {
  const response = await makeRequest<GetAllNftsRequest, GetAllNftsResponse>(
    "GET",
    "/nfts",
    deleteProp({
      ...request,
      sorts: serializeSort(request.sorts),
      ...request.filters,
    }, "filters"),
  );

  return {
    ...response,
    nfts: response.nfts.map((nft) => ({
      ...nft,
      mintedAt: parseDate(nft.mintedAt),
    }))
  }
}

export const mintNft = async (request: CreateNftRequest): Promise<CreateNftResponse> => {
  const response = await makeRequest<CreateNftRequest, CreateNftResponse>(
    "POST",
    "/nfts",
    request,
  )

  return {
    ...response,
    mintedAt: parseDate(response.mintedAt),
    minter: {
      ...response.minter,
      createdAt: parseDate(response.minter.createdAt),
    },
    owner: {
      ...response.owner,
      createdAt: parseDate(response.owner.createdAt),
    },
    trades: response.trades.map((trade) => ({
      ...trade,
      createdAt: parseDate(trade.createdAt),
      soldAt: parseDateIfNotNull(trade.soldAt),
    }))
  };
}

export const getAllTrades = async (request: GetAllTradesRequest): Promise<GetAllTradesResponse> => {
  const response = await makeRequest<GetAllTradesRequest, GetAllTradesResponse>(
    "GET",
    "/trades",
    deleteProp({
      ...request,
      sorts: serializeSort(request.sorts),
      ...request.filters,
    }, "filters"),
  );

  return {
    ...response,
    trades: response.trades.map((trade) => ({
      ...trade,
      createdAt: parseDate(trade.createdAt),
      soldAt: parseDateIfNotNull(trade.soldAt),
    })),
  };
};

export const acceptTrade = async (request: AcceptTradeRequest): Promise<AcceptTradeResponse> => {
  const response = await makeRequest<AcceptTradeRequest, AcceptTradeResponse>(
    "POST",
    `/trades/${request.id}/accept`,
    request,
  );

  return {
    ...response,
    soldAt: parseDateIfNotNull(response.soldAt),
    createdAt: parseDate(response.createdAt),
    nft: {
      ...response.nft,
      mintedAt: parseDate(response.nft.mintedAt)
    },
    seller: {
      ...response.seller,
      createdAt: parseDate(response.seller.createdAt),
    },
    buyer: {
      ...response.buyer,
      createdAt: parseDate(response.buyer.createdAt),
    },
  };
};

export const declineTrade = async (request: DeleteTradeRequest): Promise<DeleteTradeResponse> => {
  const response = await makeRequest<DeleteTradeRequest, DeleteTradeResponse>(
    "DELETE",
    `/trades/${request.id}`,
    request,
  );

  return response;
};

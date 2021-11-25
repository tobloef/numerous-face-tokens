import qs from "qs";
import BaseError from "./BaseError";
import { getAuthToken } from "./localStorage";
import {
  GetAllUsersRequest,
  GetAllUsersResponse,
} from "../../../express-rest/src/features/users/getAllUsers";
import { Sorts } from "../../../express-rest/src/utils/query";
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
import {
  SignupRequest,
  SignupResponse,
} from "../../../express-rest/src/features/auth/signup";
import AuthToken from "../../../express-rest/src/types/AuthToken";
import {
  LoginRequest,
  LoginResponse,
} from "../../../express-rest/src/features/auth/login";
import {
  GetUserRequest,
  GetUserResponse,
} from "../../../express-rest/src/features/users/getUser";
import {
  GetNftRequest,
  GetNftResponse,
} from "../../../express-rest/src/features/nfts/getNft";
import {
  CreateTradeRequest,
  CreateTradeResponse,
} from "../../../express-rest/src/features/trades/createTrade";

const BASE_URL = "localhost:3010";

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
  let url = `http://${BASE_URL}/${trimLeadingSlash(path)}`;
  if (!canHaveBody) {
    url += `?${qs.stringify(request)}`;
  }

  let headers: HeadersInit = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  const authToken = getAuthToken();
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

export type SerializeDates<T> =
  T extends Array<any>
    ? Array<SerializeDates<T[number]>>
    : (
      T extends object
        ? {
          [Key in keyof T]: (
            T[Key] extends Date
              ? string
              : (
                T[Key] extends (Date | null)
                  ? (string | null)
                  : SerializeDates<T[Key]>
                )
            )
        }
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


export const parseDate = (input: string): Date => (
  new Date(Date.parse(input))
);

export const parseDateIfNotNull = (input: string | null): Date | null => {
  if (input === null) {
    return null;
  }

  return parseDate(input);
};

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
    })),
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
    })),
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
    })),
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
      mintedAt: parseDate(response.nft.mintedAt),
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
    `/trades/${encodeURIComponent(request.id)}`,
    request,
  );

  return response;
};


export const signup = async (request: SignupRequest): Promise<SignupResponse> => {
  const response = await makeRequest<SignupRequest, SignupResponse>(
    "POST",
    "/signup",
    request,
  )

  return response as AuthToken;
};


export const login = async (request: LoginRequest): Promise<LoginResponse> => {
  const response = await makeRequest<LoginRequest, LoginResponse>(
    "POST",
    "/login",
    request,
  )

  return response as AuthToken;
};

export const getUser = async (request: GetUserRequest): Promise<GetUserResponse> => {
  const response = await makeRequest<GetUserRequest, GetUserResponse>(
    "GET",
    `/users/${encodeURIComponent(request.username)}`,
    request,
  );

  return {
    ...response,
    createdAt: parseDate(response.createdAt),
    soldTrades: response.soldTrades.map((trade) => ({
      ...trade,
      createdAt: parseDate(trade.createdAt),
      soldAt: parseDateIfNotNull(trade.soldAt),
    })),
    boughtTrades: response.boughtTrades.map((trade) => ({
      ...trade,
      createdAt: parseDate(trade.createdAt),
      soldAt: parseDateIfNotNull(trade.soldAt),
    })),
    ownedNfts: response.ownedNfts.map((nft) => ({
      ...nft,
      mintedAt: parseDate(nft.mintedAt),
    })),
    mintedNfts: response.mintedNfts.map((nft) => ({
      ...nft,
      mintedAt: parseDate(nft.mintedAt),
    })),
  };
}

export const getNft = async (request: GetNftRequest): Promise<GetNftResponse> => {
  const response = await makeRequest<GetNftRequest, GetNftResponse>(
    "GET",
    `/nfts/${encodeURIComponent(request.seed)}`,
    request,
  );

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
    })),
    highestTrade: response.highestTrade !== null ? {
      ...response.highestTrade,
      soldAt: parseDateIfNotNull(response.highestTrade.soldAt),
      createdAt: parseDate(response.highestTrade.createdAt),
    } : null,
    lastTrade: response.lastTrade !== null ? {
      ...response.lastTrade,
      soldAt: parseDateIfNotNull(response.lastTrade.soldAt),
      createdAt: parseDate(response.lastTrade.createdAt),
    } : null,
  };
}

export const createTrade = async (request: CreateTradeRequest): Promise<CreateTradeResponse> => {
  const response = await makeRequest<CreateTradeRequest, CreateTradeResponse>(
    "POST",
    "/trades",
    request,
  );

  return {
    ...response,
    soldAt: parseDateIfNotNull(response.soldAt),
    createdAt: parseDate(response.createdAt),
    nft: {
      ...response.nft,
      mintedAt: parseDate(response.nft.mintedAt),
    },
    seller: {
      ...response.seller,
      createdAt: parseDate(response.seller.createdAt),
    },
    buyer: response.buyer != null ? {
      ...response.buyer,
      createdAt: parseDate(response.buyer.createdAt),
    } : null,
  };
};

export const connectEventLog = () => {
  return new WebSocket(`ws://${BASE_URL}/log`);
}

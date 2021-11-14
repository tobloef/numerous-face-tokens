import qs from "qs";
import BaseError from "./BaseError";
import { getLocalAuthToken } from "./localStorage";
import {
  GetAllUsersRequest,
  GetAllUsersResponse,
} from "../../../express-rest/src/features/users/getAllUsers";
import {
  parseDate,
  SortOrder,
  Sorts,
} from "../../../express-rest/src/utils/query";
import deleteProp from "../../../express-rest/src/utils/deleteProp";

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
): Promise<Serialized<Res>> => {
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
  ): Promise<Serialized<Res>> => {
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

type SerializeSorts<Obj extends object> = {
  [Key in keyof Obj]: Key extends "sorts" ? string : Obj[Key]
}

type SerializeFilters<Req extends object> = Req extends { filters?: object }
  ? Omit<Req, "filters"> & Req["filters"]
  : Req;

const serializeSort = <T extends object>(sorts: Sorts<T>): string => {
  return sorts.map((sortObj) => {
    const [key, order] = Object.entries(sortObj)[0];
    return `${order === "asc" ? "+" : "-"}${key}`;
  }).join(",");
};

type Serialized<T> =
  T extends Array<any>
    ? Array<Serialized<T[number]>>
    : (
      T extends object
        ? { [Key in keyof T]: (
          T[Key] extends Date
            ? string
            : Serialized<T[Key]>
        ) }
        : T
      );

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
      createdAt: new Date(Date.parse(user.createdAt)),
    }))
  }
}

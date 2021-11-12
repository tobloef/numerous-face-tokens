import qs from "qs";
import BaseError from "./BaseError";
import { getLocalAuthToken } from "./localStorage";
import {
  GetAllUsersRequest,
  GetAllUsersResponse,
} from "../../../express-rest/src/features/users/getAllUsers";
import { SortOrder } from "../../../express-rest/src/utils/query";

const BASE_URL = "http://localhost:3010";

const trimLeadingSlash = (str: string): string => str.replace(/^\//, "");

type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

export const makeRequest = async <Req, Res>(
  method: HttpMethod,
  path: string,
  request: Req,
): Promise<Res> => {
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
  ): Promise<Res> => {
    let body;
    try {
      body = await response.json();
    } catch (error) {
      // TODO
      throw new BaseError({
        message: "",
        userFacing: false,
        innerError: error as Error,
      });
    }
    if (!response.ok) {
      // TODO
      throw new BaseError({
        message: "",
        userFacing: false,
      });
    }

    return body;
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

/* -------------------------------------------------- */

type SerializeSort<Obj extends object> = {
  [Key in keyof Obj]: Key extends "sort" ? string : Obj[Key]
}

const serializeSort = (sort: Array<Record<string, SortOrder>>): string => {
  return sort.map((sortObj) => {
    const [key, order] = Object.entries(sortObj)[0];
    return `${order === "asc" ? "+" : "-"}${key}`;
  }).join(",");
};

export const getAllUsers = async (request: GetAllUsersRequest): Promise<GetAllUsersResponse> => {
  return makeRequest<SerializeSort<GetAllUsersRequest>, GetAllUsersResponse>(
    "GET",
    "/users",
    {
      ...request,
      sort: serializeSort(request.sort),
    }
  );
}

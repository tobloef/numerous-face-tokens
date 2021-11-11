import {
  err,
  Result,
} from "neverthrow";
import qs from "qs";

const BASE_URL = process.env.REACT_APP_API_URL;

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
  if (authToken !== null) {
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
      throw new BaseError({
        // TODO
      });
    }
    if (!response.ok) {
      throw new BaseError({
        // TODO
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
      innerError: error,
    })
  }

  return checkResponse(response);
};

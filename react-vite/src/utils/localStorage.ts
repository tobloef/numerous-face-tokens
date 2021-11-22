import AuthToken from "../../../express-rest/src/types/AuthToken";
import AuthPayload from "../../../express-rest/src/types/AuthPayload";
import jwtDecode from "jwt-decode";

const AUTH_TOKEN_KEY = "authToken";

export const getAuthToken = (): AuthToken | undefined => {
  return localStorage.getItem(AUTH_TOKEN_KEY) as AuthToken ?? undefined;
}

export const setAuthToken = (authToken: AuthToken) => {
  localStorage.setItem(AUTH_TOKEN_KEY, authToken);
};

export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export const decodeToken = (token: AuthToken | undefined) => {
  return token !== undefined
    ? jwtDecode<AuthPayload>(token)
    : undefined;
}

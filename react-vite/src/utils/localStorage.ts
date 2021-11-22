import AuthToken from "../../../express-rest/src/types/AuthToken";
import AuthPayload from "../../../express-rest/src/types/AuthPayload";
import jwtDecode from "jwt-decode";


export const getAuthToken = (): AuthToken | undefined => {
  return localStorage.getItem("authToken") as AuthToken ?? undefined;
}

export const setAuthToken = (authToken: AuthToken) => {
  localStorage.setItem("authToken", authToken);
};

export const decodeToken = (token: AuthToken | undefined) => {
  return token !== undefined
    ? jwtDecode<AuthPayload>(token)
    : undefined;
}

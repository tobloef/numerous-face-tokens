import { createGlobalState } from "react-hooks-global-state";
import AuthPayload from "../../../express-rest/src/types/AuthPayload";
import {
  decodeToken,
  getAuthToken,
} from "./localStorage";

const token = getAuthToken();

export const { useGlobalState } = createGlobalState<{
  authPayload: AuthPayload | undefined
}>({
  authPayload: decodeToken(token)
});

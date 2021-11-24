import React, { useState } from "react";
import Input from "../shared/Input";
import styles from "./Register.module.css";
import {
  useMutation,
  useQueryClient,
} from "react-query";
import {
  SignupRequest,
  SignupResponse,
} from "../../../express-rest/src/features/auth/signup";
import * as api from "../utils/api";
import { useNavigate } from "react-router-dom";
import {
  decodeToken,
  setAuthToken,
} from "../utils/localStorage";
import { useGlobalState } from "../utils/globalState";

const Register: React.FC<{}> = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [_, setAuthPayload] = useGlobalState('authPayload');

  const {
    mutate: register,
    isLoading,
    isError,
    error,
  } = useMutation<SignupResponse, Error, SignupRequest>(
    async (request) => {
      const authToken = await api.signup(request);
      queryClient.invalidateQueries("getAllUsers");
      setAuthToken(authToken);
      setAuthPayload(decodeToken(authToken))
      navigate("/");
      return authToken;
    },
  );

  return <div className={styles.register}>
    <form onSubmit={(e) => {
      e.preventDefault();
      register({
        username,
        password,
      })
    }}>
      <h1>Register</h1>
      <div className={styles.fieldWrapper}>
        <span>Username</span>
        <Input
          value={username}
          onChange={setUsername}
        />
      </div>
      <div className={styles.fieldWrapper}>
        <span>Password</span>
        <Input
          value={password}
          onChange={setPassword}
          type={"password"}
        />
      </div>
      <button
        type={"submit"}
        disabled={username === "" || password === "" || isLoading}
      >
        Register
      </button>
      {isError && (
        <span className={styles.error}>
          {error?.message ?? "Error registering"}
        </span>
      )}
    </form>
  </div>;
};

export default Register;

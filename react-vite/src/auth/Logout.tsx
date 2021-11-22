import React, { useEffect } from "react";
import styles from "./Logout.module.css";
import { clearAuthToken } from "../utils/localStorage";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../utils/globalState";

const Logout = () => {
  const navigate = useNavigate();

  const [_, setAuthPayload] = useGlobalState('authPayload');

  useEffect(() => {
    clearAuthToken();
    setAuthPayload(undefined);
    navigate("/");
  }, []);

  return <div className={styles.logout}>
    <span>Logging out...</span>
  </div>
}

export default Logout;

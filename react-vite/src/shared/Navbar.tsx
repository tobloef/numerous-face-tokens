import styles from "./Navbar.module.css";
import {
  Link,
  NavLink,
} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faRightToBracket,
  faScaleBalanced,
  faSmile,
  faUser,
  faUserPlus,
  faUsers,
} from "@fortawesome/pro-duotone-svg-icons";
import { getLocalAuthPayload } from "../utils/localStorage";

const Navbar = ({}) => {
  const loggedInUser = getLocalAuthPayload()?.user;

  return (
    <div className={styles.navbar}>
      <div className={styles.left}>
        <h1>
          <Link to="/">
            Numerous Face Tokens
          </Link>
        </h1>
        <NavLink to="/nfts" end>
          <div><FontAwesomeIcon icon={faSmile} /> <span>NFTs</span></div>
        </NavLink>
        <NavLink to="/users" end>
          <div><FontAwesomeIcon icon={faUsers} /> <span>Users</span></div>
        </NavLink>
        <NavLink to="/trades" end>
          <div><FontAwesomeIcon icon={faScaleBalanced} /> <span>Trades</span></div>
        </NavLink>
      </div>
      <div className={styles.right}>
        {loggedInUser !== undefined && (
          <>
            <NavLink to={`/users/${loggedInUser.username}`} end>
              <div><FontAwesomeIcon icon={faUser} /> <span>{loggedInUser.username}</span></div>
            </NavLink>
            <NavLink to={`/logout`} end>
              <div><FontAwesomeIcon icon={faRightFromBracket} /> <span>Log out</span></div>
            </NavLink>
          </>
        )}
        {loggedInUser === undefined && (
          <>
            <NavLink to="/register" end>
              <div><FontAwesomeIcon icon={faUserPlus} /> <span>Register</span></div>
            </NavLink>
            <NavLink to="/login" end>
              <div><FontAwesomeIcon icon={faRightToBracket} /> <span>Log in</span></div>
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;

import classes from "./Navbar.module.css";
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

const Navbar = ({}) => {
  // TODO: Load from auth token
  const loggedInUser: {username: string} | undefined = {
    username: "tobloef"
  };

  return (
    <div className={classes.navbar}>
      <div className={classes.left}>
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
      <div className={classes.right}>
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

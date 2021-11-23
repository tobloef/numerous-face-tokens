import {
    Route,
    Routes,
} from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import UsersOverview from "../users/UsersOverview";
import UserDetails from "../users/UserDetails";
import NftsOverview from "../nfts/NftsOverview";
import Register from "../auth/Register";
import TradesOverview from "../trades/TradesOverview";
import NftDetails from "../nfts/NftDetails";
import Login from "../auth/Login";
import styles from "./MainRoutes.module.css";
import Logout from "../auth/Logout";

const MainRoutes = ({}) => (
  <div className={styles.mainWrapper}>
      <div className={styles.mainContent}>
          <Routes>
              <Route path="/">
                  <Route index element={<Dashboard/>}/>
                  <Route path="users">
                      <Route index element={<UsersOverview/>}/>
                      <Route path=":username" element={<UserDetails/>}/>
                  </Route>
                  <Route path="nfts">
                      <Route index element={<NftsOverview/>}/>
                      <Route path=":seed" element={<NftDetails/>}/>
                  </Route>
                  <Route path="trades">
                      <Route index element={<TradesOverview/>}/>
                  </Route>
                  <Route path="register" element={<Register/>}/>
                  <Route path="login" element={<Login/>}/>
                  <Route path="logout" element={<Logout/>}/>
              </Route>
          </Routes>
      </div>
  </div>
);

export default MainRoutes;

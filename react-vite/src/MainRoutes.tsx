import {
    Route,
    Routes,
} from "react-router-dom";
import Dashboard from "./Dashboard/Dashboard";
import UsersOverview from "./Users/Overview/UsersOverview";
import UserDetails from "./Users/Details/UserDetails";
import NftsOverview from "./Nfts/Overview/NftsOverview";
import Register from "./Auth/Register/Register";
import TradesOverview from "./Trades/Overview/TradesOverview";
import TradeDetails from "./Trades/Details/TradeDetails";
import NftDetails from "./Nfts/Details/NftDetails";
import Login from "./Auth/Login/Login";

const MainRoutes = ({}) => {
    return <div>
        <Routes>
            <Route path="/">
                <Route index element={<Dashboard />} />
                <Route path="users">
                    <Route index element={<UsersOverview />} />
                    <Route path=":username" element={<UserDetails />} />
                </Route>
                <Route path="nfts">
                    <Route index element={<NftsOverview />} />
                    <Route path=":seed" element={<NftDetails />} />
                </Route>
                <Route path="trades">
                    <Route index element={<TradesOverview />} />
                    <Route path=":tradeId" element={<TradeDetails />} />
                </Route>
                <Route path="register" element={<Register />} />
                <Route path="login" element={<Login />} />
            </Route>
        </Routes>
    </div>
};

export default MainRoutes;

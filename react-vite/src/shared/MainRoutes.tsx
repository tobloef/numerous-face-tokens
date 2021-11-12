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
import TradeDetails from "../trades/TradeDetails";
import NftDetails from "../nfts/NftDetails";
import Login from "../auth/Login";

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

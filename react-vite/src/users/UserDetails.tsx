import React, { useState } from "react";
import styles from "./UserDetails.module.css";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import {
  GetAllNftsResponse,
  GetAllNftsSort,
  OverviewNftDTO,
} from "../../../express-rest/src/features/nfts/getAllNfts";
import * as api from "../utils/api";
import {
  Link,
  useParams,
} from "react-router-dom";
import { GetUserResponse } from "../../../express-rest/src/features/users/getUser";
import Grid from "../shared/Grid";
import {
  GetAllTradesResponse,
  GetAllTradesSort,
} from "../../../express-rest/src/features/trades/getAllTrades";
import { Options } from "../shared/Select";
import Trade from "../shared/Trade";
import {
  AcceptTradeRequest,
  AcceptTradeResponse,
} from "../../../express-rest/src/features/trades/acceptTrade";
import {
  DeleteTradeRequest,
  DeleteTradeResponse,
} from "../../../express-rest/src/features/trades/deleteTrade";
import SmallNftCard from "../nfts/SmallNftCard";
import { CURRENCY_SYMBOL } from "../../../express-rest/src/utils/constants";

const TRADES_PAGE_SIZE = 10;
const NFTS_PAGE_SIZE = 10;

const TRADES_SORT_OPTIONS: Options<GetAllTradesSort> = [
  {
    label: "Newest first",
    value: ["createdAt", "desc"],
  },
  {
    label: "Oldest first",
    value: ["createdAt", "asc"],
  },
  {
    label: "Highest price first",
    value: ["price", "desc"],
  },
  {
    label: "Lowest price first",
    value: ["price", "asc"],
  },
];

const NFTS_SORT_OPTIONS: Options<GetAllNftsSort> = [
  {
    label: "Newest first",
    value: ["mintedAt", "desc"],
  },
  {
    label: "Oldest first",
    value: ["mintedAt", "asc"],
  },
  {
    label: "Highest value first",
    value: ["highestSellPrice", "desc"],
  },
  {
    label: "Lowest value first",
    value: ["highestSellPrice", "asc"],
  },
  {
    label: "Seed A → Z",
    value: ["seed", "asc"],
  },
  {
    label: "Seed Z → A",
    value: ["seed", "desc"],
  },
];

const UserDetails: React.FC<{}> = (props) => {
  const { username } = useParams();
  const [tradesSort, setTradesSort] = useState<GetAllTradesSort>(["createdAt", "desc"]);
  const [tradesPage, setTradesPage] = useState(1);
  const [nftsSort, setNftsSort] = useState<GetAllNftsSort>(["mintedAt", "desc"]);
  const [nftsPage, setNftsPage] = useState(1);
  const queryClient = useQueryClient();

  if (username === undefined) {
    throw new Error("Username was undefined");
  }

  const {
    isLoading,
    isError,
    data,
    error,
  } = useQuery<GetUserResponse, Error>(
    ["getUser", username],
    () => api.getUser({ username }),
  );

  const {
    isLoading: isNftsLoading,
    isError: isNftsError,
    data: nftsData,
    error: nftsError,
  } = useQuery<GetAllNftsResponse, Error>(
    ["getAllNfts", nftsPage, nftsSort],
    () => api.getAllNfts({
      take: NFTS_PAGE_SIZE,
      skip: (nftsPage - 1) * NFTS_PAGE_SIZE,
      sorts: [nftsSort],
      filters: {
        ownerUsername: {
          equals: username,
        },
      }
    }),
  );

  const {
    isLoading: isMyTradesLoading,
    isError: isMyTradesError,
    data: myTradesData,
    error: myTradesError,
  } = useQuery<GetAllTradesResponse, Error>(
    ["getAllTrades", "myTrades", tradesPage, tradesSort],
    () => api.getAllTrades({
      take: TRADES_PAGE_SIZE,
      skip: (tradesPage - 1) * TRADES_PAGE_SIZE,
      sorts: [tradesSort],
      filters: {
        participantUsername: {
          equals: username,
        },
      }
    }),
  );

  const {
    mutate: acceptTrade,
    isLoading: isAcceptTradeLoading,
    isError: isAcceptTradeError,
    error: acceptTradeError,
  } = useMutation<AcceptTradeResponse, Error, AcceptTradeRequest>(
    async (request) => {
      const trade = await api.acceptTrade(request);
      queryClient.invalidateQueries("getAllTrades");
      return trade;
    },
  );

  const {
    mutate: declineTrade,
    isLoading: isDeclineTradeLoading,
    isError: isDeclineTradeError,
    error: declineTradeError,
  } = useMutation<DeleteTradeResponse, Error, DeleteTradeRequest>(
    async (request) => {
      const success = await api.declineTrade(request);
      queryClient.invalidateQueries("getAllTrades");
      return success;
    },
  );

  if (isLoading) {
    return (
      <div className={styles.textWrapper}>
        <span>Loading...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={styles.textWrapper}>
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div>
      <div className={styles.header}>
        <h1>
          <span className={styles.deemphasized}>Users</span> / {username}
        </h1>
        <span className={styles.balance}>
          Balance: <b>{CURRENCY_SYMBOL}{data?.balance}</b>
        </span>
      </div>
      <Grid
        className={styles.nfts}
        title="My NFTs"
        sort={nftsSort}
        onSortChange={setNftsSort}
        sortOptions={NFTS_SORT_OPTIONS}
        items={nftsData?.nfts}
        loading={isNftsLoading}
        error={isNftsError ? nftsError?.message ?? "Error fetching NFTs" : undefined}
        keyProp={"seed"}
        page={nftsPage}
        onPageChange={setNftsPage}
        pageSize={NFTS_PAGE_SIZE}
        totalElements={nftsData?.totalCount}
        renderItem={(nft: OverviewNftDTO) => (
          <SmallNftCard
            seed={nft.seed}
            ownerUsername={nft.ownerUsername}
            to={`/nfts/${nft.seed}`}
          />
        )}
      />
      <Grid
        title="My Trades"
        sort={tradesSort}
        onSortChange={setTradesSort}
        sortOptions={TRADES_SORT_OPTIONS}
        items={myTradesData?.trades}
        loading={isMyTradesLoading}
        error={
          isMyTradesError
            ? myTradesError?.message ?? "Error fetching trades"
            : undefined
        }
        keyProp={"id"}
        page={tradesPage}
        onPageChange={setTradesPage}
        pageSize={TRADES_PAGE_SIZE}
        totalElements={myTradesData?.totalCount}
        renderItem={(trade) => (
          <Trade
            key={trade.id}
            className={styles.tradeItem}
            sellerUsername={trade.sellerUsername}
            sellerAccepted={trade.sellerAccepted}
            buyerUsername={trade.buyerUsername ?? undefined}
            buyerAccepted={trade.buyerAccepted}
            price={trade.price}
            createdAt={trade.createdAt}
            nftSeed={trade.nftSeed}
            isPublic={trade.isPublic}
            isComplete={trade.isCompleted}
            onAccept={() => acceptTrade({id: trade.id })}
            canAccept={
              !trade.isCompleted &&
              !(
                (trade.buyerAccepted && trade.buyerUsername === username) ||
                (trade.sellerAccepted && trade.sellerUsername === username)
              )
            }
            acceptError={isAcceptTradeError ? acceptTradeError?.message ?? "Error accepting trade" : undefined}
            isAcceptLoading={isAcceptTradeLoading}
            onDecline={() => declineTrade({id: trade.id})}
            canDecline={
              !trade.isCompleted &&
              (
                trade.sellerUsername === username ||
                trade.buyerUsername === username
              )
            }
            declineError={isDeclineTradeError ? declineTradeError?.message ?? "Error deleting trade" : undefined}
            isDeclineLoading={isDeclineTradeLoading}
          />
        )}
        className={styles.myTrades}
      />
    </div>
  );
};

export default UserDetails;

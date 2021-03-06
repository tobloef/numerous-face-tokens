import React, { useState } from "react";
import styles from "./UserDetails.module.css";
import { useQuery } from "react-query";
import {
  GetAllNftsResponse,
  GetAllNftsSort,
  OverviewNftDTO,
} from "../../../express-rest/src/features/nfts/getAllNfts";
import * as api from "../utils/api";
import { useParams } from "react-router-dom";
import { GetUserResponse } from "../../../express-rest/src/features/users/getUser";
import Grid from "../shared/Grid";
import {
  GetAllTradesResponse,
  GetAllTradesSort,
} from "../../../express-rest/src/features/trades/getAllTrades";
import Trade from "../shared/Trade";
import NftCard from "../nfts/NftCard";
import { CURRENCY_SYMBOL } from "../../../express-rest/src/utils/constants";
import {
  NFT_SORT_OPTIONS,
  TRADE_SORT_OPTIONS,
} from "../utils/sortOptions";
import { useGlobalState } from "../utils/globalState";

const TRADES_PAGE_SIZE = 10;
const NFTS_PAGE_SIZE = 10;

const UserDetails: React.FC<{}> = (props) => {
  const {username} = useParams();
  const [tradesSort, setTradesSort] = useState<GetAllTradesSort>(["createdAt", "desc"]);
  const [tradesPage, setTradesPage] = useState(1);
  const [nftsSort, setNftsSort] = useState<GetAllNftsSort>(["mintedAt", "desc"]);
  const [nftsPage, setNftsPage] = useState(1);
  const [authPayload] = useGlobalState("authPayload");

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
    () => api.getUser({username}),
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
      },
    }),
  );

  const {
    isLoading: isTradesLoading,
    isError: isTradesError,
    data: tradesData,
    error: tradesError,
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
      },
    }),
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
        <span>{error?.message ?? "Error fetching user"}</span>
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
        title={`${authPayload?.user.username === username ? "My" : "User's"} NFTs`}
        sort={nftsSort}
        onSortChange={setNftsSort}
        sortOptions={NFT_SORT_OPTIONS}
        items={nftsData?.nfts}
        loading={isNftsLoading}
        error={isNftsError ? nftsError?.message ?? "Error fetching NFTs" : undefined}
        keyProp={"seed"}
        page={nftsPage}
        onPageChange={setNftsPage}
        pageSize={NFTS_PAGE_SIZE}
        totalElements={nftsData?.totalCount}
        noDataText={"No NFTs"}
        renderItem={(nft: OverviewNftDTO) => (
          <NftCard
            key={nft.seed}
            seed={nft.seed}
            ownerUsername={nft.ownerUsername}
            to={`/nfts/${nft.seed}`}
          />
        )}
      />
      <Grid
        title={`${authPayload?.user.username === username ? "My" : "User's"} Trades`}
        sort={tradesSort}
        onSortChange={setTradesSort}
        sortOptions={TRADE_SORT_OPTIONS}
        items={tradesData?.trades}
        loading={isTradesLoading}
        error={
          isTradesError
            ? tradesError?.message ?? "Error fetching trades"
            : undefined
        }
        keyProp={"id"}
        page={tradesPage}
        onPageChange={setTradesPage}
        pageSize={TRADES_PAGE_SIZE}
        totalElements={tradesData?.totalCount}
        noDataText={"No Trades"}
        renderItem={(trade) => (
          <Trade
            id={trade.id}
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
            isCompleted={trade.isCompleted}
          />
        )}
        className={styles.myTrades}
      />
    </div>
  );
};

export default UserDetails;

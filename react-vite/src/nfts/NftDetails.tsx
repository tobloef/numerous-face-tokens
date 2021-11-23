import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "./NftDetails.module.css";
import { useQuery } from "react-query";
import * as api from "../utils/api";
import {
  GetNftResponse,
} from "../../../express-rest/src/features/nfts/getNft";
import { CURRENCY_SYMBOL } from "../../../express-rest/src/utils/constants";
import Trade from "../shared/Trade";
import Grid from "../shared/Grid";
import { TRADE_SORT_OPTIONS } from "../utils/sortOptions";
import {
  GetAllTradesResponse,
  GetAllTradesSort,
} from "../../../express-rest/src/features/trades/getAllTrades";

const TRADES_PAGE_SIZE = 10;

const NftDetails: React.FC<{}> = (props) => {
  const { seed } = useParams();
  const [tradesSort, setTradesSort] = useState<GetAllTradesSort>(["createdAt", "desc"]);
  const [tradesPage, setTradesPage] = useState(1);

  if (seed === undefined) {
    throw new Error("Seed was undefined");
  }

  const {
    isLoading,
    isError,
    data,
    error,
  } = useQuery<GetNftResponse, Error>(
    ["getNft", seed],
    () => api.getNft({
      seed,
    }),
  );

  const {
    isLoading: isTradesLoading,
    isError: isTradesError,
    data: tradesData,
    error: tradesError,
  } = useQuery<GetAllTradesResponse, Error>(
    ["getAllTrades", seed, tradesPage, tradesSort],
    () => api.getAllTrades({
      take: TRADES_PAGE_SIZE,
      skip: (tradesPage - 1) * TRADES_PAGE_SIZE,
      sorts: [tradesSort],
      filters: {
        nftSeed: {
          equals: seed
        }
      }
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
        <span>{error?.message ?? "Error fetching NFT"}</span>
      </div>
    )
  }

  return (
    <div>
      <h1>
        <span className={styles.deemphasized}>NFTs</span> / {seed}
      </h1>
      <div className={styles.detailsWrapper}>
        <div className={styles.imageWrapper}>
          <img
            src={`https://server.tobloef.com/faces/${encodeURIComponent(seed)}.png`}
            alt={seed}
          />
        </div>
        <div className={styles.info}>
          <div><label>Seed:</label><span>{data?.seed}</span></div>
          <div><label>Mint Date:</label><span>{data?.mintedAt.toLocaleString()}</span></div>
          <div><label>Minted by:</label><span>
            <Link to={`/users/${data?.minter.username}`}>{data?.minter.username}</Link>
          </span></div>
          <div><label>Owned by:</label><span>
            <Link to={`/users/${data?.owner.username}`}>{data?.owner.username}</Link>
          </span></div>
          <div><label>Last trade price:</label><span>{
            data?.lastTrade?.price !== undefined
              ? `${CURRENCY_SYMBOL}${data?.lastTrade.price}`
              : (<i>Never traded</i>)
          }</span></div>
          <div><label>Last trade date:</label><span>{
            data?.lastTrade?.soldAt != undefined
              ? data.lastTrade.soldAt.toLocaleString()
              : (<i>Never traded</i>)
          }</span></div>
          <div><label>Highest trade price:</label><span>{
            data?.highestTrade?.price !== undefined
              ? `${CURRENCY_SYMBOL}${data?.highestTrade.price}`
              : (<i>Never traded</i>)
          }</span></div>
          <div><label>Highest trade date:</label><span>{
            data?.highestTrade?.soldAt != undefined
              ? data.highestTrade.soldAt.toLocaleString()
              : (<i>Never traded</i>)
          }</span></div>
        </div>
      </div>
      <Grid
        title={"Trades for NFT"}
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
        renderItem={(trade) => (
          <Trade
            key={trade.id}
            id={trade.id}
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
        className={styles.trades}
      />
    </div>
  );
};

export default NftDetails;

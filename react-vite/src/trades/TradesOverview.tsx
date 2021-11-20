import React, { useCallback } from "react";
import { OverviewTradeDto } from "../../../express-rest/src/features/trades/getAllTrades";
import Trade from "../shared/Trade";
import styles from "./TradesOverview.module.css";
import Grid from "../shared/Grid";

const TradesOverview: React.FC<{}> = (props) => {
  const acceptTrade = ;
  const declineTrade = ;

  const renderTrade = useCallback((trade: OverviewTradeDto) => {
    return (
      <Trade
        className={styles.tradeItem}
        sellerUsername={trade.sellerUsername}
        sellerAccepted={trade.sellerAccepted}
        buyerAccepted={trade.buyerAccepted}
        price={trade.price}
        createdAt={trade.createdAt}
        nftSeed={trade.nftSeed}
        isPublic={trade.isPublic}
        isComplete={trade.isCompleted}
        buyerUsername={trade.buyerUsername ?? undefined}
        onAccept={() => acceptTrade(trade.id)}
        onDecline={() => declineTrade(trade.id)}
      />
    )
  }, [acceptTrade, declineTrade]);

  return <div>
    <Grid
      title="My Trades"
      sort={sortMyTrades}
      onSortChange={setSortMyTrades}
      sortOptions={tradeSortOptions}
      items={myTradesData.trades}
      loading={isMyTradesLoading}
      error={isMyTradesError ? myTradesError?.message ?? "Error fetching trades" : undefined}
      keyProp={"id"}
      page={myTradesPage}
      onPageChange={setMyTradesPage}
      pageSize={MY_TRADES_PAGE_SIZE}
      totalElements={myTradesData?.totalCount}
      renderItem={renderTrade}
    />
    <Grid
      title="Public Offers"
      sort={sortPublicTrades}
      onSortChange={setSortPublicTrades}
      sortOptions={tradeSortOptions}
      items={publicTradesData.trades}
      loading={isPublicTradesLoading}
      error={isPublicTradesError ? publicTradesError?.message ?? "Error fetching trades" : undefined}
      keyProp={"id"}
      page={publicTradesPage}
      onPageChange={setPublicTradesPage}
      pageSize={PUBLIC_TRADES_PAGE_SIZE}
      totalElements={publicTradesData?.totalCount}
      renderItem={renderTrade}
    />
  </div>;
};

export default TradesOverview;

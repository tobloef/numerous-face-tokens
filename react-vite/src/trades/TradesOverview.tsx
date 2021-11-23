import React, {
  useCallback,
  useState,
} from "react";
import {
  GetAllTradesResponse,
  GetAllTradesSort,
  OverviewTradeDto,
} from "../../../express-rest/src/features/trades/getAllTrades";
import Trade from "../shared/Trade";
import styles from "./TradesOverview.module.css";
import Grid from "../shared/Grid";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import * as api from "../utils/api";
import {
  AcceptTradeRequest,
  AcceptTradeResponse,
} from "../../../express-rest/src/features/trades/acceptTrade";
import {
  DeleteTradeRequest,
  DeleteTradeResponse,
} from "../../../express-rest/src/features/trades/deleteTrade";
import { Options } from "../shared/Select";
import { useGlobalState } from "../utils/globalState";
import { TRADE_SORT_OPTIONS } from "../utils/sortOptions";

const PUBLIC_TRADES_PAGE_SIZE = 10;


const TradesOverview: React.FC<{}> = (props) => {
  const [publicTradesSort, setPublicTradesSort] = useState<GetAllTradesSort>(["createdAt", "desc"]);
  const [publicTradesPage, setPublicTradesPage] = useState(1);
  const queryClient = useQueryClient();
  const [authPayload] = useGlobalState('authPayload');

  const {
    isLoading: isPublicTradesLoading,
    isError: isPublicTradesError,
    data: publicTradesData,
    error: publicTradesError,
  } = useQuery<GetAllTradesResponse, Error>(
    ["getAllTrades", "publicTrades", publicTradesPage, publicTradesSort],
    () => api.getAllTrades({
      take: PUBLIC_TRADES_PAGE_SIZE,
      skip: (publicTradesPage - 1) * PUBLIC_TRADES_PAGE_SIZE,
      sorts: [publicTradesSort],
      filters: {
        buyerUsername: {
          equals: null
        },
        isCompleted: {
          equals: false,
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

  return <div>
    <Grid
      title={(<h1>Public Trade Offers</h1>)}
      sort={publicTradesSort}
      onSortChange={setPublicTradesSort}
      sortOptions={TRADE_SORT_OPTIONS}
      items={publicTradesData?.trades}
      loading={isPublicTradesLoading}
      error={
        isPublicTradesError
          ? publicTradesError?.message ?? "Error fetching trades"
          : undefined
      }
      keyProp={"id"}
      page={publicTradesPage}
      onPageChange={setPublicTradesPage}
      pageSize={PUBLIC_TRADES_PAGE_SIZE}
      totalElements={publicTradesData?.totalCount}
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
      className={styles.publicTrades}
    />
  </div>;
};

export default TradesOverview;

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

const PUBLIC_TRADES_PAGE_SIZE = 10;

const TRADE_SORT_OPTIONS: Options<GetAllTradesSort> = [
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
      title="Public Offers"
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
            authPayload?.user !== undefined &&
            !trade.isCompleted &&
            !(
              (trade.buyerAccepted && trade.buyerUsername === authPayload?.user.username) ||
              (trade.sellerAccepted && trade.sellerUsername === authPayload?.user.username)
            )
          }
          acceptError={isAcceptTradeError ? acceptTradeError?.message ?? "Error accepting trade" : undefined}
          isAcceptLoading={isAcceptTradeLoading}
          onDecline={() => declineTrade({id: trade.id})}
          canDecline={
            authPayload?.user !== undefined &&
            !trade.isCompleted &&
            (
              trade.sellerUsername === authPayload?.user.username ||
              trade.buyerUsername === authPayload?.user.username
            )
          }
          declineError={isDeclineTradeError ? declineTradeError?.message ?? "Error deleting trade" : undefined}
          isDeclineLoading={isDeclineTradeLoading}
        />
      )}
      className={styles.publicTrades}
    />
  </div>;
};

export default TradesOverview;

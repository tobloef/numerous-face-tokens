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
import { getLocalAuthPayload } from "../utils/localStorage";

const MY_TRADES_PAGE_SIZE = 10;

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
  const [myTradesSort, setMyTradesSort] = useState<GetAllTradesSort>(["createdAt", "desc"]);
  const [myTradesPage, setMyTradesPage] = useState(1);
  const [publicTradesSort, setPublicTradesSort] = useState<GetAllTradesSort>(["createdAt", "desc"]);
  const [publicTradesPage, setPublicTradesPage] = useState(1);

  const queryClient = useQueryClient();

  const user = getLocalAuthPayload()?.user;

  const {
    isLoading: isMyTradesLoading,
    isError: isMyTradesError,
    data: myTradesData,
    error: myTradesError,
  } = useQuery<GetAllTradesResponse, Error>(
    ["getAllTrades", "myTrades", myTradesPage, myTradesSort],
    () => api.getAllTrades({
      take: MY_TRADES_PAGE_SIZE,
      skip: (myTradesPage - 1) * MY_TRADES_PAGE_SIZE,
      sorts: [myTradesSort],
      filters: {
        participantUsername: {
          equals: user?.username,
        },
      }
    }),
    {
      enabled: user !== undefined,
    }
  );

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
    isSuccess: isAcceptTradeSuccess,
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
    isSuccess: isDeclineTradeSuccess,
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

  const renderTrade = useCallback((trade: OverviewTradeDto) => {
    return (
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
        canAccept={
          user !== undefined &&
          !trade.isCompleted &&
          !(
            (trade.buyerAccepted && trade.buyerUsername === user.username) ||
            (trade.sellerAccepted && trade.sellerUsername === user.username)
          )
        }
        canDecline={
          user !== undefined &&
          !trade.isCompleted &&
          (
            trade.sellerUsername === user.username ||
            trade.buyerUsername === user.username
          )
        }
        onAccept={() => acceptTrade({id: trade.id })}
        onDecline={() => declineTrade({id: trade.id})}
      />
    )
  }, [acceptTrade, declineTrade]);

  return <div>
    {user && (
      <Grid
        title="My Trades"
        sort={myTradesSort}
        onSortChange={setMyTradesSort}
        sortOptions={TRADE_SORT_OPTIONS}
        items={myTradesData?.trades}
        loading={isMyTradesLoading}
        error={
          isMyTradesError
            ? myTradesError?.message ?? "Error fetching trades"
            : undefined
        }
        keyProp={"id"}
        page={myTradesPage}
        onPageChange={setMyTradesPage}
        pageSize={MY_TRADES_PAGE_SIZE}
        totalElements={myTradesData?.totalCount}
        renderItem={renderTrade}
      />
    )}
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
      renderItem={renderTrade}
    />
  </div>;
};

export default TradesOverview;

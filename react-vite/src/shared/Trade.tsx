import styles from "./Trade.module.css";
import classNames from "classnames";
import NftCard from "../nfts/NftCard";
import {
  faArrowDown,
  faCheck,
  faQuestion,
  faXmark,
} from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { CURRENCY_SYMBOL } from "../../../express-rest/src/utils/constants";
import {
  useMutation,
  useQueryClient,
} from "react-query";
import {
  AcceptTradeRequest,
  AcceptTradeResponse,
} from "../../../express-rest/src/features/trades/acceptTrade";
import * as api from "../utils/api";
import {
  DeleteTradeRequest,
  DeleteTradeResponse,
} from "../../../express-rest/src/features/trades/deleteTrade";
import { useGlobalState } from "../utils/globalState";

const Trade = (props: {
  id: string,
  className?: string,
  sellerUsername: string,
  buyerUsername?: string,
  sellerAccepted: boolean,
  buyerAccepted: boolean,
  price: number,
  createdAt: Date,
  nftSeed: string,
  isPublic: boolean,
  isCompleted: boolean,
}) => {
  const queryClient = useQueryClient();
  const [authPayload] = useGlobalState("authPayload");

  const {
    mutate: accept,
    isLoading: isAcceptLoading,
    isError: isAcceptError,
    error: acceptError,
  } = useMutation<AcceptTradeResponse, Error, AcceptTradeRequest>(
    async (request) => {
      const trade = await api.acceptTrade(request);
      queryClient.invalidateQueries("getAllTrades");
      queryClient.invalidateQueries(["getNft", props.nftSeed]);
      return trade;
    },
  );

  const {
    mutate: decline,
    isLoading: isDeclineLoading,
    isError: isDeclineError,
    error: declineError,
  } = useMutation<DeleteTradeResponse, Error, DeleteTradeRequest>(
    async (request) => {
      const success = await api.declineTrade(request);
      queryClient.invalidateQueries("getAllTrades");
      queryClient.invalidateQueries(["getNft", props.nftSeed]);
      return success;
    },
  );

  const canAccept = !props.isCompleted &&
    !(
      (props.buyerAccepted && props.buyerUsername === authPayload?.user.username) ||
      (props.sellerAccepted && props.sellerUsername === authPayload?.user.username)
    )

  const canDecline = !props.isCompleted &&
    (
      props.sellerUsername === authPayload?.user.username ||
      props.buyerUsername === authPayload?.user.username
    )

  return (
    <div className={classNames(
      props.className,
      styles.trade,
      {[styles.completed]: props.isCompleted},
    )}>
      <NftCard
        seed={props.nftSeed}
        className={styles.nftCard}
      />
      <div className={styles.participants}>
        {props.isPublic && (
          <>
            <span>Seller</span>
            <span>
              <Link to={`/users/${props.sellerUsername}`}>
                {props.sellerUsername}
              </Link>
            </span>
          </>
        )}
        {!props.isPublic && (
          <>
            <div className={styles.participantWrapper}>
              <span>Seller</span>
              <div className={styles.participant}>
                <span>
                  <Link to={`/users/${props.sellerUsername}`}>
                    {props.sellerUsername}
                  </Link>
                </span>
                {(
                  props.sellerAccepted
                    ? (<FontAwesomeIcon icon={faCheck} color={"green"}/>)
                    : (<FontAwesomeIcon icon={faQuestion} color={"yellow"}/>)
                )}
              </div>
            </div>
            <FontAwesomeIcon
              icon={faArrowDown}
              className={styles.participantsArrow}
            />
            <div className={styles.participantWrapper}>
              <span>Buyer</span>
              <div className={styles.participant}>
                <span>
                  <Link to={`/users/${props.buyerUsername}`}>
                    {props.buyerUsername}
                  </Link>
                </span>
                {(
                  props.buyerAccepted
                    ? (<FontAwesomeIcon icon={faCheck} color={"green"}/>)
                    : (<FontAwesomeIcon icon={faQuestion} color={"orange"}/>)
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <div className={styles.tempName}>
        <div className={styles.priceWrapper}>
          <span>Price</span>
          <span className={styles.price}>
            {CURRENCY_SYMBOL}{props.price}
          </span>
        </div>
        {(canAccept || canDecline) && (
          <div className={styles.actions}>
            {canAccept && (
              <button onClick={() => accept({id: props.id})} disabled={isAcceptLoading}>
                <FontAwesomeIcon icon={faCheck} color={"green"} fixedWidth/>
                <span>Accept</span>
              </button>
            )}
            {isAcceptError && (
              <span>{acceptError?.message ?? "Error accepting trade"}</span>
            )}
            {canDecline && (
              <button onClick={() => decline({id: props.id})} disabled={isDeclineLoading}>
                <FontAwesomeIcon icon={faXmark} color={"red"} fixedWidth/>
                <span>Delete</span>
              </button>
            )}
            {isDeclineError && (
              <span>{declineError?.message ?? "Error accepting trade"}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Trade;

import styles from "./Trade.module.css";
import classNames from "classnames";
import SmallNftCard from "../nfts/SmallNftCard";
import {
  faCheck,
  faQuestion,
  faArrowDown,
  faXmark
} from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { CURRENCY_SYMBOL } from "../../../express-rest/src/utils/constants";

const Trade = (props: {
  sellerUsername: string,
  buyerUsername?: string,
  sellerAccepted: boolean,
  buyerAccepted: boolean,
  price: number,
  createdAt: Date,
  nftSeed: string,
  isPublic: boolean,
  isComplete: boolean,
  onAccept: () => void,
  onDecline: () => void,
  className?: string,
}) => {
  return (
    <div className={classNames(
      props.className,
      styles.trade,
      { [styles.completed]: props.isComplete }
    )}>
      <SmallNftCard
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
                    ? (<FontAwesomeIcon icon={faCheck} color={"green"} />)
                    : (<FontAwesomeIcon icon={faQuestion} color={"yellow"} />)
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
                    ? (<FontAwesomeIcon icon={faCheck} color={"green"} />)
                    : (<FontAwesomeIcon icon={faQuestion} color={"orange"} />)
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
        <div className={styles.actions}>
          <button>
            <FontAwesomeIcon icon={faCheck} color={"green"} fixedWidth />
            <span>Accept</span>
          </button>
          <button>
            <FontAwesomeIcon icon={faXmark} color={"red"} fixedWidth />
            <span>Decline</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Trade;

import React from "react";
import styles from "./NftCard.module.css";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { getNftImageLink } from "../utils/getNftImageLink";

const NftCard = (props: {
  seed: string,
  ownerUsername?: string,
  highestTradePrice?: number,
  to?: string,
  className?: string,
}) => {
  return (
    <Link
      className={classNames(styles.link, props.className)}
      to={`/nfts/${props.seed}`}
    >
      <div className={styles.smallNftCard}>
        <img
          src={getNftImageLink(props.seed)}
          alt={props.seed}
        />
        <span className={styles.seed}>{props.seed}</span>
        {props.ownerUsername !== undefined && (
          <span>
            Owner: {props.ownerUsername}
          </span>
        )}
        {props.highestTradePrice !== undefined && (
          <span>
            Value: {props.highestTradePrice}
          </span>
        )}
      </div>
    </Link>
  )
};

export default NftCard;

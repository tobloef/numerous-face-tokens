import styles from "./Pagination.module.css";
import React from "react";

export type PageProps =
  | {
  page?: undefined,
  onPageChange?: undefined,
  totalElements?: undefined,
  pageSize?: undefined,
}
  | {
  page: number,
  onPageChange: (newPage: number) => void,
  pageSize: number,
  totalElements?: number,
};

const Pagination = (props: PageProps) => {
  if (props.page === undefined) {
    return null;
  }

  return (
    <div className={styles.pagesWrapper}>
      <button
        onClick={() => props.onPageChange(props.page - 1)}
        disabled={props.page === 1}
      >
        Previous
      </button>
      <span>
            {
              props.totalElements != null
                ? `Page ${props.page} / ${Math.max(Math.ceil(props.totalElements / props.pageSize), 1)}`
                : `Page ${props.page}`
            }
      </span>
      <button
        onClick={() => props.onPageChange(props.page + 1)}
        disabled={(
          props.totalElements !== undefined &&
          props.totalElements <= props.page * props.pageSize
        )}
      >
        Next
      </button>
    </div>
  )
}

export default Pagination;

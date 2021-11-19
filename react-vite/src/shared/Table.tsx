import React, {
  ReactElement,
  ReactNode,
} from "react";
import styles from "./Table.module.css";
import { SortOrder } from "../../../express-rest/src/utils/query";
import Sort from "../types/Sort";
import classNames from "classnames";
import { Link } from "react-router-dom";

type ColumnInner<T, Key extends keyof T> = Key extends any ? {
  key: Key,
  header: ReactNode,
  cell?: (value: T[Key], obj: T) => ReactNode,
  sortable?: boolean,
} : never;

export type Column<T> = ColumnInner<T, keyof T>;

const Table = <T extends object,>(
  props:
    & {
      data: T[] | undefined,
      columns: Column<T>[],
      onSort: (sort: Sort<T>) => void,
      sort: [keyof T, SortOrder],
      keyProp: keyof T,
      className?: string,
      getRowUrl?: (clickedRow: T) => string,
      loading?: boolean,
      error?: string,
    }
    & (
      | {page: undefined}
      | {page: number, onPageChange: (newPage: number) => void}
    )
    & (
      | {totalElements: undefined}
      | {totalElements: number, pageSize: number}
    )
): ReactElement => {
  return (
    <div
      className={classNames(styles.tableWrapper, props.className)}
    >
    <table
      className={styles.table}
    >
      <thead>
        <tr>
          {props.columns.map((column) => {
            const key = column.key as keyof T;

            return (
              <th
                key={`header-${String(column.key)}`}
                className={classNames({
                  [styles.sortable]: column.sortable ?? true,
                })}
                onClick={() => {
                  if (props.sort[0] === key && props.sort[1] === "asc") {
                    props.onSort([key, "desc"]);
                  } else {
                    props.onSort([key, "asc"]);
                  }
                }}
              >
                <span className={styles.headerText}>{column.header}</span>
                <span className={styles.sortArrow}>
                  {props.sort[0] === key && (
                    props.sort[1] === "asc" ? "▼" : "▲"
                  )}
                </span>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
      {(() => {
        if (props.loading) {
          return (
            <tr>
              <td colSpan={props.columns.length}>
                <div className={styles.textRowWrapper}>
                  Loading...
                </div>
              </td>
            </tr>
          )
        }

        if (props.error !== undefined) {
          return (
            <tr>
              <td colSpan={props.columns.length}>
                <div className={styles.textRowWrapper}>
                  {props.error}
                </div>
              </td>
            </tr>
          )
        }

        if (props.data === undefined || props.data.length === 0) {
          return (
            <tr>
              <td colSpan={props.columns.length}>
                <div className={styles.textRowWrapper}>
                  No data
                </div>
              </td>
            </tr>
          )
        }

        return props.data.map((row) => (
          <tr
            key={`row-${row[props.keyProp]}`}
            className={classNames({
              [styles.clickable]: props.getRowUrl !== undefined,
            })}
          >
            {props.columns.map((column) => {
              const columnKey = column.key as keyof T;

              const cell = column.cell !== undefined
                ? (column.cell as (value: T[typeof columnKey], obj: T) => ReactNode)(row[columnKey], row)
                : row[columnKey];

              {
                column.cell !== undefined
                  ? (column.cell as (value: T[typeof columnKey], obj: T) => ReactNode)(row[columnKey], row)
                  : row[columnKey]
              }

              if (props.getRowUrl !== undefined) {
                return (
                  <td
                    key={`${row[props.keyProp]}-${columnKey}`}
                  >
                    <Link to={props.getRowUrl(row)}>
                      <div>
                        {cell}
                      </div>
                    </Link>
                  </td>
                );
              }

              return (
                <td
                  key={`${row[props.keyProp]}-${columnKey}`}
                >
                  <div>
                    {cell}
                  </div>
                </td>
              );
            })}
          </tr>
        ));
      })()}
      </tbody>
    </table>
      {props.page !== undefined && (
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
      )}
    </div>
  )
};

export default Table;

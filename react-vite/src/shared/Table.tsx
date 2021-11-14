import React, {
  ReactElement,
  ReactNode,
} from "react";
import classes from "./Table.module.css";
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

const Table = <T extends object,>(props: {
  data: T[] | undefined,
  columns: Column<T>[],
  onSort: (sort: Sort<T>) => void,
  sort: [keyof T, SortOrder],
  keyProp: keyof T,
  className?: string,
  getRowUrl?: (clickedRow: T) => string,
}): ReactElement => {
  return (
    <table
      className={classNames(classes.table, props.className)}
    >
      <thead>
        <tr>
          {props.columns.map((column) => {
            const key = column.key as keyof T;

            return (
              <th
                key={`header-${String(column.key)}`}
                className={classNames({
                  [classes.sortable]: column.sortable ?? true,
                })}
                onClick={() => {
                  if (props.sort[0] === key && props.sort[1] === "desc") {
                    props.onSort([key, "asc"]);
                  } else {
                    props.onSort([key, "desc"]);
                  }
                }}
              >
                <span className={classes.headerText}>{column.header}</span>
                <span className={classes.sortArrow}>
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
      {props.data !== undefined && props.data.length > 0 && props.data.map((row) => (
          <tr
            key={`row-${row[props.keyProp]}`}
            className={classNames({
              [classes.clickable]: props.getRowUrl !== undefined,
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
              } else {
                return (
                  <td
                    key={`${row[props.keyProp]}-${columnKey}`}
                  >
                    <div>
                      {cell}
                    </div>
                  </td>
                );
              }


            })}
          </tr>
        )
      )}
      {props.data === undefined || props.data.length === 0 && (
        <tr>
          <td colSpan={props.columns.length}>
            <div className={classes.noDataWrapper}>
              No data
            </div>
          </td>
        </tr>
      )}
      </tbody>
    </table>
  )
};

export default Table;

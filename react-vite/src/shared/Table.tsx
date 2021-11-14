import React, {
  ReactElement,
  ReactNode,
} from "react";
import classes from "./Table.module.css";
import { SortOrder } from "../../../express-rest/src/utils/query";
import Sort from "../types/Sort";

type ColumnInner<T, Key extends keyof T> = Key extends any ? {
  key: Key,
  header: ReactNode,
  cell?: (value: T[Key], obj: T) => ReactNode,
} : never;

export type Column<T> = ColumnInner<T, keyof T>;

const Table = <T extends object,>(props: {
  data: T[] | undefined,
  columns: Column<T>[],
  onSort: (sort: Sort<T>) => void,
  sort: [keyof T, SortOrder],
  keyProp: keyof T,
}): ReactElement => {
  return (
    <table
      className={classes.table}
    >
      <thead>
        <tr>
          {props.columns.map((column) => {
            const key = column.key as keyof T;

            return (
              <th
                key={`header-${String(column.key)}`}
                className={classes.headerCell}
                onClick={() => {
                  if (props.sort[0] === key && props.sort[1] === "desc") {
                    props.onSort([key, "asc"]);
                  } else {
                    props.onSort([key, "desc"]);
                  }
                }}
              >
                {column.header}
                {props.sort[0] === key && (
                  props.sort[1] === "asc" ? "▼" : "▲"
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
      {props.data !== undefined && props.data.length > 0 && props.data.map((row) => (
          <tr key={`row-${row[props.keyProp]}`}>
            {props.columns.map((column) => {
              const columnKey = column.key as keyof T;
              return (
                <td
                  key={`${row[props.keyProp]}-${columnKey}`}
                  className={classes.cell}
                >
                  {
                    column.cell !== undefined
                      ? (column.cell as (value: T[typeof columnKey], obj: T) => ReactNode)(row[columnKey], row)
                      : row[columnKey]
                  }
                </td>
              );
            })}
          </tr>
        ))}
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

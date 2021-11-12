import React, { ReactElement } from "react";
import classes from "./Table.module.css";
import {
  Column,
  useTable,
} from "react-table";

const Table = <T extends object,>(props: {
  data: T[],
  columns: Column<T>[],
}): ReactElement => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns: props.columns,
    data: props.data,
  })

  return (
    <table
      {...getTableProps()}
      className={classes.table}
    >
      <thead>
      {headerGroups.map(headerGroup => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map(column => (
            <th
              {...column.getHeaderProps()}
              className={classes.headerCell}
            >
              {column.render('Header')}
            </th>
          ))}
        </tr>
      ))}
      </thead>
      <tbody {...getTableBodyProps()}>
      {rows.map(row => {
        prepareRow(row)
        return (
          <tr {...row.getRowProps()}>
            {row.cells.map(cell => {
              return (
                <td
                  {...cell.getCellProps()}
                  className={classes.cell}
                >
                  {cell.render('Cell')}
                </td>
              )
            })}
          </tr>
        )
      })}
      </tbody>
    </table>
  )
};

export default Table;

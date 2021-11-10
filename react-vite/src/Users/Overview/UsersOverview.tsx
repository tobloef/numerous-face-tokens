import React from "react";
import {
  Column,
} from "react-table";
import Table from "../../Table";

type Data = {
  col1: string,
  col2: string,
};

const UsersOverview: React.FC<{}> = (props) => {
  const data: Data[] = React.useMemo(
    () => [
      {
        col1: 'Hello',
        col2: 'World',
      },
      {
        col1: 'react-table',
        col2: 'rocks',
      },
      {
        col1: 'whatever',
        col2: 'you want',
      },
    ],
    []
  );

  const columns: Column<Data>[] = React.useMemo(
    () => [
      {
        Header: 'Column 1',
        accessor: 'col1',
      },
      {
        Header: 'Column 2',
        accessor: 'col2',
      }
    ],
    []
  )

  return (
    <Table
      columns={columns}
      data={data}
    />
  )
};

export default UsersOverview;

import React, { useMemo } from "react";
import Table from "../../Table";
import Input from "../../Input";
import { Column } from "react-table";
import { OverviewUserDto } from "../../../../express-rest/src/features/users/getAllUsers"
import { formatDate } from "../../utils/formatDate";

const UsersOverview: React.FC<{}> = (props) => {
  const columns: Column<OverviewUserDto>[] = useMemo(
    (): Column<OverviewUserDto>[] => [
      {
        accessor: "username",
        Header: "Username",
      },
      {
        accessor: "createdAt",
        Header: "Creation Date",
        Cell: ({ value }) => formatDate(value),
      },
      {
        accessor: "balance",
        Header: "Balance",
      },
      {
        accessor: "mintedNftsCount",
        Header: "Minted NFTs #",
      },
      {
        accessor: "ownedNftsCount",
        Header: "Owned NFTs #",
      },
    ],
    []
  );

  const data: OverviewUserDto[] = useMemo(
    (): OverviewUserDto[] => [
      {
        username: "tobloef",
        createdAt: new Date(),
        balance: 12345,
        mintedNftsCount: 67,
        ownedNftsCount: 8,
      }
    ],
    []
  );

  return (
    <div>
      <h1>Users</h1>
      <Input />
      <Table
        columns={columns}
        data={data}
      />
    </div>
  )
};

export default UsersOverview;

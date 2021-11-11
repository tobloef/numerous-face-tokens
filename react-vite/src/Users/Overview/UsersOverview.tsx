import React, { useMemo } from "react";
import Table from "../../Table";
import Input from "../../Input";
import { Column } from "react-table";
import {
  GetAllUsersRequest,
  GetAllUsersResponse,
  OverviewUserDto,
} from "../../../../express-rest/src/features/users/getAllUsers"
import { formatDate } from "../../utils/formatDate";
import {
  useQuery,
} from "react-query";

const getUsersOverview = async (): Promise<GetAllUsersResponse> => {
  return [];
}

const UsersOverview: React.FC<{}> = (props) => {
  const test: GetAllUsersRequest = {
    filters: {},
    skip: 0,
    sort: [{createdAt: "desc"}],
    take: 10,
  }

  const {
    isLoading,
    isError,
    data,
    error,
  } = useQuery("getAllUsers", getUsersOverview);

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

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error</span>;
  }

  if (data === undefined || data.length === 0) {
    return <span>No data</span>
  }

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

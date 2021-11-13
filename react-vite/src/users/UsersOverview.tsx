import React, {
  useMemo,
  useState,
} from "react";
import Table from "../shared/Table";
import Input from "../shared/Input";
import { Column } from "react-table";
import {
  GetAllUsersRequest,
  GetAllUsersResponse,
  OverviewUserDto,
} from "../../../express-rest/src/features/users/getAllUsers"
import { formatDate } from "../utils/formatDate";
import {
  useQuery,
} from "react-query";
import { getAllUsers } from "../utils/api";

const UsersOverview: React.FC<{}> = (props) => {
  const PAGE_SIZE = 10;

  const [page, setPage] = useState(1);

  const {
    isLoading,
    isError,
    data,
    error,
  } = useQuery<GetAllUsersResponse, Error>(["getAllUsers", page], () => getAllUsers({
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
    sort: [{createdAt: "desc"}],
    filters: {}
  }));

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
        Header: "Minted NFTs",
      },
      {
        accessor: "ownedNftsCount",
        Header: "Owned NFTs",
      },
    ],
    []
  );

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>{error?.message ?? "Error fetching data"}</span>;
  }

  return (
    <div>
      <h1>Users</h1>
      <Input />
      <Table
        columns={columns}
        data={data?.users}
      />
      <div>
        <button
          onClick={() => setPage((curPage) => curPage - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <button
          onClick={() => setPage((curPage) => curPage + 1)}
          disabled={data == null || data.totalCount <= page * PAGE_SIZE}
        >
          Next
        </button>
      </div>
    </div>
  )
};

export default UsersOverview;

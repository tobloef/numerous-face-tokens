import React, {
  useMemo,
  useState,
} from "react";
import Table, { Column } from "../shared/Table";
import Input from "../shared/Input";
import {
  GetAllUsersResponse,
  OverviewUserDto,
} from "../../../express-rest/src/features/users/getAllUsers"
import { formatDate } from "../utils/formatDate";
import {
  useQuery,
} from "react-query";
import { getAllUsers } from "../utils/api";
import {
  Sorts,
} from "../../../express-rest/src/utils/query";
import Sort from "../types/Sort";

const sortToSorts = <T extends object>(sort: Sort<T>): Sorts<T> => {
  return [
    { [sort[0]]: sort[1] } as Sorts<T>[number],
  ];
}

const UsersOverview: React.FC<{}> = (props) => {
  const PAGE_SIZE = 10;

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Sort<OverviewUserDto>>(["createdAt", "desc"]);
  const [usernameFilter, setUsernameFilter] = useState<string>("");

  const {
    isLoading,
    isError,
    data,
    error,
  } = useQuery<GetAllUsersResponse, Error>(
    ["getAllUsers", page, sort, usernameFilter],
    () => getAllUsers({
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      sorts: sortToSorts(sort),
      filters: {
        username: {
          contains: usernameFilter,
        }
      }
    }),
    {
      retry: false
    }
  );

  const columns = useMemo(
    (): Column<OverviewUserDto>[] => [
      {
        key: "username",
        header: "Username",
      },
      {
        key: "createdAt",
        header: "Creation Date",
        cell: (value) => formatDate(value),
      },
      {
        key: "balance",
        header: "Balance",
      },
      {
        key: "mintedNftsCount",
        header: "Minted NFTs",
      },
      {
        key: "ownedNftsCount",
        header: "Owned NFTs",
      },
    ],
    []
  );

  return (
    <div>
      <h1>Users</h1>
      <Input
        onChange={setUsernameFilter}
        value={usernameFilter}
      />
      {isLoading && (
        <span>Loading...</span>
      )}
      {isError && (
        <span>{error?.message ?? "Error fetching data"}</span>
      )}
      {!isError && !isLoading && (
        <Table
          columns={columns}
          data={data?.users}
          onSort={setSort}
          sort={sort}
          dataKey={"username"}
        />
      )}
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

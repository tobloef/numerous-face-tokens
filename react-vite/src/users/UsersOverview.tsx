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
import * as api from "../utils/api";
import Sort from "../types/Sort";
import styles from "./UsersOverview.module.css";

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
    () => api.getAllUsers({
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      sorts: [sort],
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
    <div className={styles.usersOverview}>
      <h1>Users</h1>
      <Input
        onChange={setUsernameFilter}
        value={usernameFilter}
        placeholder={"Search"}
        className={styles.searchInput}
      />
      <Table
        columns={columns}
        data={data?.users}
        onSort={setSort}
        sort={sort}
        keyProp={"username"}
        className={styles.table}
        getRowUrl={(user) => `/users/${user.username}`}
        loading={isLoading}
        error={isError ? error?.message ?? "Error fetching users" : undefined}
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        totalElements={data?.totalCount}
        noDataText={"No users"}
      />
    </div>
  )
};

export default UsersOverview;

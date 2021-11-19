import Select, { Options } from "./Select";
import React, { useMemo } from "react";
import styles from "./Table.module.css";
import Sort from "../types/Sort";

const Grid = <
  T,
  S extends Sort<any>
>(props:
  & {
    title?: string,
    items: T[] | undefined,
    loading?: boolean,
    error?: string,
    renderItem: (value: T) => React.ReactNode,
    keyProp: keyof T,
    sort?: S,
    onSortChange?: (newSort: S) => void,
    sortOptions?: Options<S>,
  }
) => {
  const serializedSortOptions: Options<string> | undefined = useMemo(() => {
    return props.sortOptions?.map((option) => ({
      label: option.label,
      value: JSON.stringify(option.value),
    }));
  }, [props.sortOptions]);

  const serializedSort: string | undefined = useMemo(() => {
    return props.sort !== undefined ?
      JSON.stringify(props.sort) :
      undefined;
  }, [props.sort]);

  return (
    <div className={styles.gridWrapper}>
      <div className={styles.header}>
        {props.title !== undefined && (
          <h2>NFTs</h2>
        )}
        {(
          serializedSort !== undefined &&
          serializedSortOptions !== undefined
        ) && (
          <div className={styles.sortByWrapper}>
            <span>Sort by</span>
            <Select
              options={serializedSortOptions}
              value={serializedSort}
              onChange={(newSerialized) => props.onSortChange?.(JSON.parse(newSerialized))}
            />
          </div>
        )}
      </div>
      <div className={styles.grid}>
        {(() => {
          if (props.loading) {
            return (
              <div className={styles.gridTextWrapper}>
                Loading...
              </div>
            )
          }

          if (props.error != null) {
            return (
              <div className={styles.gridTextWrapper}>
                {props.error}
              </div>
            )
          }

          if (props.items === undefined || props.items.length === 0) {
            return (
              <div className={styles.gridTextWrapper}>
                No data
              </div>
            )
          }

          return props.items.map(props.renderItem);
        })()}
      </div>
    </div>
  )
}

export default Grid;

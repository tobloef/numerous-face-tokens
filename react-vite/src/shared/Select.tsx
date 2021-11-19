import React from "react";
import styles from "./Select.module.css";

export type Options<T> = {
  value: T,
  label: string,
}[];

const Select = <T extends string | number>(props: {
  options: Options<T>,
  onChange: (newValue: T) => void,
  value: T,
}) => {
  return (
    <select
      value={props.value}
      onChange={(e) => props.onChange(e.target.value as T)}
      className={styles.select}
    >
      {props.options.map((option) => (
        <option
          key={String(option.value)}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  )
};

export default Select;

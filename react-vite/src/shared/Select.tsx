import React from "react";
import styles from "./Select.module.css";

export type Options<T extends string | number | readonly string[]> = {
  value: T,
  label: string,
}[];

const Select = <T extends string | number | readonly string[]>(props: {
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
        <option value={option.value}>{option.label}</option>
      ))}
    </select>
  )
};

export default Select;

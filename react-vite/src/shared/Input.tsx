import React from "react";
import classNames from "classnames";
import styles from "./Input.module.css";

const Input: React.FC<{
  onChange: (newValue: string) => void,
  value: string,
  placeholder?: string,
  className?: string,
  type?: string,
}> = (props) => {
  return (
    <input
      onChange={(e) => props.onChange(e.target.value)}
      value={props.value}
      placeholder={props.placeholder}
      className={classNames(props.className, styles.input)}
      type={props.type}
    />
  );
};

export default Input;

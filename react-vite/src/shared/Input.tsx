import React from "react";
import classNames from "classnames";
import styles from "./Input.module.css";

const Input: React.FC<{
  onChange: (newValue: string) => void,
  value: string,
  placeholder?: string,
  className?: string,
  type?: string,
  pattern?: RegExp,
}> = (props) => {
  const value = (props.pattern !== undefined && !props.pattern.test(props.value))
    ? undefined
    : props.value;

  return (
    <input
      onChange={(e) => {
        const newValue = e.target.value;
        if (props.pattern !== undefined && !props.pattern.test(newValue)) {
          e.preventDefault();
          return;
        }

        props.onChange(newValue);
      }}
      value={value}
      placeholder={props.placeholder}
      className={classNames(props.className, styles.input)}
      type={props.type}
    />
  );
};

export default Input;

import React from "react";

const Input: React.FC<{
  onChange: (newValue: string) => void,
  value: string,
  placeholder?: string
}> = (props) => {
  return (
    <input
      onChange={(e) => props.onChange(e.target.value)}
      value={props.value}
      placeholder={props.placeholder}
    />
  );
};

export default Input;

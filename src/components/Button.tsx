import * as React from "react";

export const Button: React.FC<React.HTMLProps<HTMLButtonElement>> = ({
  type: _type,
  children,
  ...rest
}) => {
  return (
    <button
      type="button"
      className="flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 w-full justify-center"
      {...rest}
    >
      {children}
    </button>
  );
};

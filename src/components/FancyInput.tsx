import * as React from "react";
import classNames from "classnames";

export const FancyInput: React.FC<{
  title: string;
  suffix?: string;
} & React.HTMLProps<HTMLInputElement>> = ({ title, suffix, ...rest }) => {
  return (
    <div>
      <label
        htmlFor={title}
        className="block text-sm font-medium text-gray-700"
      >
        {title}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          id={title}
          className={classNames(
            "focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md",
            !!suffix && "pr-12",
          )}
          {...rest}
        />
        {!!suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm" id="price-currency">
              {suffix}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

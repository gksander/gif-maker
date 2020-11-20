import * as React from "react";

export const FancyInput: React.FC<{ title: string } & React.HTMLProps<
  HTMLInputElement
>> = ({ title, ...rest }) => {
  return (
    <div>
      <label htmlFor={title} className="block font-medium text-gray-700">
        {title}
      </label>
      <div className="mt-1">
        <input
          type="text"
          id={title}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="you@example.com"
          {...rest}
        />
      </div>
    </div>
  );
};

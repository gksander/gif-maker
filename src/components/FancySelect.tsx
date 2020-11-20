import * as React from "react";

type FancySelectProps = {
  title: string;
  options: { title: string; value: string }[];
  value: string;
  onSelect: (val: string) => void;
};

export const FancySelect: React.FC<FancySelectProps> = ({
  title,
  options,
  value,
  onSelect,
}) => {
  return (
    <div>
      <label
        htmlFor="location"
        className="block text-sm font-medium text-gray-700"
      >
        {title}
      </label>
      <select
        id="location"
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        value={value}
        onChange={e => onSelect(e.target.value)}
      >
        {options.map(op => (
          <option value={op.value} key={op.value}>
            {op.title}
          </option>
        ))}
      </select>
    </div>
  );
};

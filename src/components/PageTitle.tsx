import * as React from "react";

export const PageTitle: React.FC = ({ children }) => {
  return (
    <div className="text-3xl font-bold font-serif text-gray-800">
      {children}
    </div>
  );
};

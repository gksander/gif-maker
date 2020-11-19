import * as React from "react";
import { ROUTES } from "../routes";
import { NavLink } from "react-router-dom";
import { FaHome } from "react-icons/all";
import classNames from "classnames";

const links: { title: string; to: string; needsFile?: boolean }[] = [
  { title: "Choose file", to: ROUTES.CHOOSE_FILE },
  { title: "Options", to: ROUTES.CONVERSION_OPTIONS, needsFile: true },
  { title: "Convert", to: ROUTES.CONVERT, needsFile: true },
];

type HeaderNavProps = {
  hasFile: boolean;
};

export const HeaderNav: React.FC<HeaderNavProps> = ({ hasFile }) => {
  return (
    <div className="border-b flex w-full overflow-x-auto">
      <ol className="flex text-gray-700">
        <li className="flex justify-center items-center p-1 text-gray-500 hover:text-primary-700">
          <NavLink
            to={ROUTES.HOME}
            className="text-2xl p-2"
            exact
            activeClassName="text-primary-700"
          >
            <FaHome />
          </NavLink>
        </li>
        {links.map((link, _i) => (
          <li key={link.to} className="flex items-center px-3">
            <svg
              className="flex-shrink-0 w-6 h-full text-gray-200"
              viewBox="0 0 24 44"
              preserveAspectRatio="none"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
            </svg>
            <NavLink
              to={link.to}
              className={classNames(
                "ml-4 py-2 transition-colors duration-150",
                link.needsFile && !hasFile
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:text-primary-700",
              )}
              activeClassName="text-primary-700"
              exact
              onClick={e => {
                if (link.needsFile && !hasFile) e.preventDefault();
              }}
            >
              {link.title}
            </NavLink>
          </li>
        ))}
      </ol>
    </div>
  );
};

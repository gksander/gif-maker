import * as React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../routes";

export const Header: React.FC = () => {
  return (
    <nav className="flex justify-between items-center bg-blue-100">
      <Link to={ROUTES.HOME} className="p-2">
        GifMaker
      </Link>
      <div>
        <Link to={ROUTES.GIF} className="p-2">
          GIF
        </Link>
        <Link to={ROUTES.MP4} className="p-2">
          MP4
        </Link>
      </div>
    </nav>
  );
};

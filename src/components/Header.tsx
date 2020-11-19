import * as React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../routes";

export const Header: React.FC = () => {
  return (
    <nav>
      <div>GifMaker</div>
      <Link to={ROUTES.GIF}>GIF</Link>
      <Link to={ROUTES.MP4}>MP4</Link>
    </nav>
  );
};

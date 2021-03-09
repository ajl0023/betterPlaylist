import React, { useEffect, useState, useRef } from "react";
import style from "./styles/Navbar.module.scss";
import Logo from "./images/logo.svg";
import { useSelector, useDispatch } from "react-redux";

import profile from "./images/profile.svg";
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
  Link,
  useHistory,
  useLocation,
} from "react-router-dom";
import { linkClick } from "./spotify-redux/actions/navbarActions";
const Navbar = (props) => {
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(linkClick());
  };
  return (
    <div className={style.container}>
      <div className={style.content}>
        <Link to={{ pathname: "/" }}>
          <img className={style.logo} src={Logo} alt="" />
        </Link>
        <div className={style["menu-container"]}>
          <Link
            onClick={handleClick}
            to={{
              pathname: "/",
            }}
            className={style["menu-item"]}
          >
            Home
          </Link>

          <Link
            onClick={handleClick}
            to={{
              pathname: "/playlists",
            }}
            className={style["menu-item"]}
          >
            Playlists
          </Link>
        </div>{" "}
      </div>{" "}
      <div></div>
    </div>
  );
};

export default Navbar;

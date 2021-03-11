import React, { useEffect, useState, useRef } from "react";
import style from "./styles/Navbar.module.scss";
import { ReactComponent as Logo } from "./images/logo.svg";
import { ReactComponent as PlaylistIcon } from "./images/playlist-icon.svg";
import { ReactComponent as HomeIcon } from "./images/home-icon.svg";

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

  const handleResize = () => {
    let trigger = document.getElementById("trigger");

    if (trigger.checked) {
      trigger.checked = false;
    }
  };
  const handleCloseMask = () => {
    let trigger = document.getElementById("trigger");

    trigger.checked = false;
  };
  const handleClose = () => {
    let trigger = document.getElementById("trigger");

    trigger.checked = false;
  };
  useEffect(() => {
    let navmask = document.getElementById("nav-mask");
    let menubutton = document.getElementsByName("menu-item");
    menubutton.forEach((ele) => {
      ele.addEventListener("click", handleClose);
    });
    navmask.addEventListener("click", handleCloseMask);

    window.addEventListener("resize", handleResize);
    return () => {
      menubutton.forEach((ele) => {
        ele.removeEventListener("click", handleClick);
      });
      navmask.removeEventListener("click", handleCloseMask);
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <>
      <input type="checkbox" id="trigger" className={style["burger-input"]} />
      <label htmlFor="trigger" className={style["burger-label"]}>
        <div className={style["main-trigger-icon-container"]}>
          <span className={style["main-trigger-icon"]}></span>
        </div>
      </label>
      <div id="nav-mask" className={style["navbar-mask"]}></div>
      <div className={style.container}>
        <div className={style.content}>
          <Link
            name="menu-item"
            className={style["menu-item"]}
            to={{ pathname: "/" }}
          >
            <Logo className={style["logo"]} />
          </Link>
          <div className={style["menu-container"]}>
            <Link
              name="menu-item"
              onClick={handleClick}
              to={{
                pathname: "/",
              }}
              className={style["menu-item"]}
            >
              <HomeIcon className={style["playlist-icon"]} />
              <p>Home</p>
            </Link>

            <Link
              name="menu-item"
              onClick={handleClick}
              to={{
                pathname: "/playlists",
              }}
              className={style["menu-item"]}
            >
              {" "}
              <PlaylistIcon className={style["playlist-icon"]} />
              <p>Playlists</p>
            </Link>
          </div>{" "}
        </div>{" "}
        <div></div>
      </div>
    </>
  );
};

export default Navbar;

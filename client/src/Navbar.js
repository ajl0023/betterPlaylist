import React, { useEffect, useState, useRef, useReducer } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as HomeIcon } from "./images/home-icon.svg";
import { ReactComponent as Logo } from "./images/logo.svg";
import { generateUUID } from "./App";
import { ReactComponent as PlaylistIcon } from "./images/playlist-icon.svg";
import style from "./styles/Navbar.module.scss";
const Navbar = (props) => {
  const [checkedState, setChecked] = useState(false);
  const handleClose = (check, type) => {
    let trigger = document.getElementById("trigger");
    if (trigger.checked) {
      setChecked(false);
    } else if (type === "playlist") {
      generateUUID();
    }
  };
  useEffect(() => {
    window.addEventListener("resize", handleClose);
    return () => {
      window.removeEventListener("resize", handleClose);
    };
  }, []);
  return (
    <>
      <input
        readOnly
        checked={checkedState}
        type="checkbox"
        id="trigger"
        className={style["burger-input"]}
      />
      <label
        onClick={() => setChecked(!checkedState)}
        htmlFor="trigger"
        className={style["burger-label"]}
      >
        <div className={style["main-trigger-icon-container"]}>
          <span className={style["main-trigger-icon"]}></span>
        </div>
      </label>
      <div
        onClick={() => setChecked(false)}
        id="nav-mask"
        className={style["navbar-mask"]}
      ></div>
      <div className={style.container}>
        <div className={style.content}>
          <Link
            onClick={() => setChecked(false)}
            name="menu-item"
            className={style["menu-item"]}
            to={{ pathname: "/" }}
          >
            <Logo className={style["logo"]} />
          </Link>
          <div className={style["menu-container"]}>
            <Link
              name="menu-item"
              onClick={() => setChecked(false)}
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
              onClick={() => {
                props.reRecreateComp();
                generateUUID();
                setChecked(false, "playlist");
              }}
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

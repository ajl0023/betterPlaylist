import React from "react";
import style from "./styles/track.module.scss";
const Track = (props) => {
  if (!props.image[0]) {
    return <div></div>;
  }
  const handleRoute = () => {
    window.open(props.track.external_urls.spotify, "_blank");
  };
  return (
    <a onClick={handleRoute} className={style["track-container"]}>
      <div className={style["album-cover-container"]}>
        <img className={style["album-cover"]} src={props.image[0].url} alt="" />
      </div>
      <div className={style["info-container"]}>
        {" "}
        <p className={style["track-title"]}>{props.track.name}</p>
        <p className={style["album-title"]}>{props.track.album.name}</p>
      </div>
    </a>
  );
};
export default Track;

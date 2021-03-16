import React from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { ReactComponent as MusicIcon } from "./images/music-note.svg";
import style from "./styles/playlist.module.scss";

const Playlist = (props) => {
  const item = props.playlist;

  let { url } = useRouteMatch();

  if (!props.playlist) {
    return <div></div>;
  }
  let imageUrl = item.images[0] ? (
    <img className={style["playlist-image"]} src={item.images[0].url} alt="" />
  ) : (
    <div className={style["fallback-image-container"]}>
      <MusicIcon className={style["playlist-image"]} />
    </div>
  );
  return (
    <Link
      key={item.uid}
      to={{
        pathname: `${url}/${item.id}`,
      }}
      className={style["playlist-container"]}
    >
      <div className={style["playlist-content"]}>
        <div className={style["playlist-image-container"]}>{imageUrl}</div>

        <div className={style["description-container"]}>
          <p className={style["playlist-title"]}>{item.name}</p>
          <p className={style["playlist-description"]}>
            {item.description
              ? item.description
              : `By ${item.owner.display_name}`}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default Playlist;

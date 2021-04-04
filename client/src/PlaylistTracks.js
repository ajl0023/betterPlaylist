import React from "react";
import { ReactComponent as CheckIcon } from "./images/check.svg";
import { ReactComponent as CheckIconPlaceH } from "./images/checkIconPlaceH.svg";
import style from "./styles/playlisttracks.module.scss";
const PlaylistTrack = (props) => {
  let track = props.playlistSet;
  const handleCheckClick = (trackid, playlistid, uri) => {
    props.handleCheckSelected(
      trackid,
      playlistid,
      uri,
      props.changed,
      props.index
    );
  };
  if (
    !props.playlistSet ||
    !props.playlistSet.track ||
    !props.playlistSet.track.album.images[0]
  ) {
    return null;
  }
  return (
    <div
      className={
        style[
          props.deletedArr.find((obj) => {
            return obj.trackid === props.playlistSet.track.uid;
          })
            ? "inactive"
            : "item-container"
        ]
      }
      className={style["item-container"]}
    >
      <div className={style["check-count-container"]}>
        <div className={style["check-container"]}>
          <CheckIconPlaceH
            style={{
              display: props.checkAll ? "flex" : "none",
            }}
            className={style["check-icon-place"]}
          />
          <CheckIcon
            onClick={(e) => {
              handleCheckClick(
                props.playlistSet.track.uid,
                props.playlistSet.playlist.id,
                props.playlistSet.track.uri,
                props.getTracks
              );
            }}
            style={{
              display: props.selected.find((obj) => {
                return obj.trackid === props.playlistSet.track.uid;
              })
                ? "flex"
                : "none",
              fill: props.isSelected ? "#1db954" : "white",
            }}
            className={
              style[
                props.playlistSet.playlist.owner.display_name === "Spotify"
                  ? "check-icon"
                  : "check-icon"
              ]
            }
          />
        </div>
        <div className={style["track-count-container"]}>
          <span className={style[props.checkAll ? "inactive" : "track-count"]}>
            {props.index + 1}
          </span>
        </div>
      </div>
      <div className={style["item-title-container"]}>
        <div className={style["album-image-container"]}>
          <img
            className={style["album-image"]}
            src={
              props.imageSelection && props.playlistSet
                ? props.playlistSet.track.album.images[0] &&
                  props.playlistSet.track.album.images[0].url
                : props.playlistSet.playlist.images[0] &&
                  props.playlistSet.playlist.images[0].url
            }
            alt=""
          />
        </div>
        <div className={style["title-container"]}>
          <div className={style["track-title-container"]}>
            <p className={style["track-title"]}>{track.track.name}</p>
          </div>
          <span className={style["track-artist"]}>
            {track.track.artists.map((artist, i) => {
              return (
                <span key={artist.id}>
                  <a>
                    <span className={style["artist-name"]}>{artist.name}</span>
                  </a>
                  {track.track.artists.length - 1 !== i && ", "}
                </span>
              );
            })}
          </span>
        </div>
      </div>
      <div className={style["track-album-container"]}>
        <p className={style["track-album"]}>{track.track.album.name}</p>
      </div>
      <div
        to={`playlists/${track.playlist.id}`}
        className={style["track-playlist-container"]}
      >
        <p className={style["track-playlist"]}>{track.playlist.name}</p>
      </div>
    </div>
  );
};
export default React.memo(PlaylistTrack, (prev, next) => {
  if (prev.checkAll !== next.checkAll) {
    return false;
  }
  if (prev.isSelected === next.isSelected) {
    return true;
  }
});

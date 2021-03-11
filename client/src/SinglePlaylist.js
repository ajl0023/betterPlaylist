import React, { useCallback, useEffect, useState } from "react";
import PlaylistTracks from "./PlaylistTracks";
import { ReactComponent as CheckIconPlaceH } from "./images/checkIconPlaceH.svg";
import { ReactComponent as CheckIcon } from "./images/check.svg";

import style from "./styles/singlePlaylist.module.scss";
import test from "./images/your-top-songs-2019_LARGE-en.jpg";
import {
  getTracksScroll,
  recievePlaylists,
} from "./spotify-redux/actions/playlistActions";
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
  Link,
  useHistory,
  useLocation,
  useParams,
} from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { colorMatch, getColor } from "./colorMatch";
import { useDispatch, useSelector } from "react-redux";
import PlaylistTrack from "./PlaylistTracks";
import { getTrack } from "./spotify-redux/actions/calls";

const SinglePlaylist = (props) => {
  const [mainColor, setMainColor] = useState();
  const [playlist, setPlaylist] = useState();
  const [checkAll, setCheckAll] = useState(false);
  const params = useParams();
  const dispatch = useDispatch();

  const currentPlayList = props.playlist[params.id];

  useEffect(() => {
    setPlaylist(currentPlayList);
    if (currentPlayList && currentPlayList.images[0]) {
      let myImage = new Image();
      myImage.src = currentPlayList.images[0].url;
      myImage.crossOrigin = "";

      myImage.onload = function () {
        let rgb = getColor(myImage);
        let formatted = rgb;
        setMainColor(formatted);
      };
    }

    props.findCurrentPlaylist(params.id);
  }, [currentPlayList]);
  
  const handleFetchScroll = (e) => {
    let tracks = getTracks.map((item) => {
      return {
        trackid: item.track.uid,
        playlistid: item.playlist.id,
        index: item.track.index,
        uri: item.track.uri,
      };
    });
    let scrollPos = Math.round(e.target.scrollHeight - e.target.scrollTop);
    let clientHeight = e.target.clientHeight;
    if (
      scrollPos === clientHeight &&
      currentPlayList.offset < currentPlayList.track_count
    ) {
   
      props.handleCheckAll(tracks, currentPlayList.id, true);
      if (
        currentPlayList &&
        currentPlayList.offset < currentPlayList.track_count
      ) {
        dispatch(getTracksScroll(currentPlayList));
      }
    }
  };

  useEffect(() => {
    let scrollContainer = document.getElementById("scroll-container");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleFetchScroll);
    }
    return () => {
      scrollContainer.removeEventListener("scroll", handleFetchScroll);
    };
  }, [playlist]);
  if (
    !currentPlayList ||
    !currentPlayList.tracks.length > 0 ||
    currentPlayList.length <= 0 ||
    !currentPlayList.images[0] ||
    !props.allTracks
  ) {
    return <div></div>;
  }
  let getTracks;

  if (currentPlayList) {
   
    getTracks = currentPlayList.tracks.reduce((arr, id) => {
      let obj = {};

      obj["playlist"] = currentPlayList;
      obj["track"] = props.allTracks[id];
      obj["uid"] = props.allTracks[id].uid;

      if (obj.track.name.length > 0) {
        arr.push(obj);
      }

      return arr;
    }, []);

    getTracks = getTracks.filter((track) => {
      let findDeleted = props.deletedArr.find((obj) => {
        return obj.trackid === track.track.uid;
      });

      if (!findDeleted) {
        return track;
      }
    });
  }

  let checkAllFiltered = getTracks.filter((track) => {
    let findId = props.selected.find((item) => {
      return item.trackid === track.track.uid;
    });
    if (!findId) {
      return track;
    }
  });
  const handleCheckAll = () => {
    let tracks = getTracks.map((item) => {
      return {
        trackid: item.track.uid,
        playlistid: item.playlist.id,
        index: item.track.index,
        uri: item.track.uri,
      };
    });
    props.handleCheckAll(tracks, currentPlayList.id);
  };
  return (
    <div
      className={
        style[props.searchArr && props.searchText > 0 ? "inactive" : "wrapper"]
      }
    >
      <div className={style["header-container"]}>
        <div
          style={{
            // backgroundColor: `${mainColor}`,
            background: mainColor ? mainColor.formattedMain : "transparent",
          }}
          className={style["album-cover-container"]}
        >
          <img
            id="playlistImage"
            className={style["album-cover"]}
            src={currentPlayList.images[0].url}
            alt=""
          />{" "}
          <div className={style["album-mask"]}></div>
        </div>

        <div className={style["playlist-info-container"]}>
          <h3 className={style["playlist-title"]}>{currentPlayList.name}</h3>
          <p className={style["playlist-creator"]}>
            Created By {currentPlayList.owner.display_name}
          </p>
        </div>
      </div>
      <div className={style["tracks-container"]}>
        <div className={style["label-container"]}>
          <div className={style["label-check-container"]}>
            <p
              style={{
                display: props.selectedAllIds.includes(currentPlayList.id)
                  ? "none"
                  : "block",
              }}
              className={style["label-count"]}
            >
              #
            </p>

            <CheckIcon
              style={{
                fill: checkAllFiltered.length === 0 ? "#1db954" : "white",
                display: checkAllFiltered.length === 0 ? "block" : "none",
              }}
              onClick={handleCheckAll}
              className={style["check-box"]}
            />
          </div>
          <div className={style["label-title"]}>title</div>
          <div className={style["label-album"]}>album</div>
          <div className={style["label-playlist"]}>playlist</div>{" "}
        </div>
        <div className={style["item-wrapper"]}>
          {getTracks.map((track, i) => {
            if (track.track.name.length > 0) {
              return (
                <PlaylistTracks
                  key={track.uid}
                  index={i}
                  getTracks={getTracks}
                  deletedArr={props.deletedArr}
                  selected={props.selected}
                  handleCheckSelected={props.handleCheckSelected}
                  playlistSet={track}
                  imageSelection="album"
                />
              );
            }
          })}{" "}
        </div>
      </div>
    </div>
  );
};

export default SinglePlaylist;
// import React from 'react';

// const SinglePlaylist = () => {
//   return (
//     <div>
//       sd
//     </div>
//   );
// }

// export default SinglePlaylist;

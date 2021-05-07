import axios from "axios";
import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getColor } from "./colorMatch";
import { ReactComponent as CheckIcon } from "./images/check.svg";
import PlaylistTracks from "./PlaylistTracks";
import { getSearchResults } from "./spotify-redux/actions/calls";
import {
  getTracksScroll,
  searchPlaylists,
  getSinglePlaylist,
  getMoreTracksPlaylist,
  updatePlaylist,
} from "./spotify-redux/actions/playlistActions";
import { SET_CURRENT_PLAYLIST } from "./spotify-redux/types/types";
import style from "./styles/singlePlaylist.module.scss";
const SinglePlaylist = (props) => {
  const [mainColor, setMainColor] = useState();
  const [playlist, setPlaylist] = useState();
  const [lastUpdated, setLastUpdated] = useState(0);
  const params = useParams();
  const dispatch = useDispatch();
  const getTracksRef = useRef();
  const currentPlayList = useSelector((state) => {
    return state.playlists.byIds[params.id];
  });
  const isUpdating = useSelector((state) => {
    return state.playlists.isUpdating;
  });
  useEffect(() => {
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
  useEffect(() => {
    dispatch(getSinglePlaylist(params.id));
  }, []);
  const handleCheckAll = useCallback(() => {
    let tracks = getTracks.map((item) => {
      return {
        trackid: item.track.uid,
        playlistid: item.playlist.id,
        index: item.track.index,
        uri: item.track.uri,
      };
    });
    props.handleCheckAll(tracks, currentPlayList.id);
  }, [currentPlayList]);
  let getTracks = [];
  let snapshot_id = getTracks.length > 0 ? getTracks[0].snapshot_id : null;
  const tracksMem = useMemo(() => {
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
    }
    getTracks.filter((track) => {
      let findDeleted = props.deletedArr.find((obj) => {
        return obj.trackid === track.track.uid;
      });
      if (!findDeleted) {
        return track;
      }
    });
    return getTracks;
  }, [
    currentPlayList,
    lastUpdated,
    currentPlayList && currentPlayList.tracks.length,
  ]);
  const checkScroll = useRef(true);
  const lastPosition = useRef(true);
  const handleFetchScroll = async (e) => {
    let scrollPos = Math.round(e.target.scrollHeight - e.target.scrollTop);
    let clientHeight = e.target.clientHeight;
    if (
      scrollPos - 100 <= clientHeight &&
      scrollPos + 20 >= clientHeight &&
      lastPosition.current < e.target.scrollTop &&
      checkScroll.current &&
      currentPlayList.offset
    ) {
      checkScroll.current = false;
      const data = await dispatch(
        getMoreTracksPlaylist(currentPlayList.id, null, true)
      );
      if (data.status === 200) {
        checkScroll.current = true;
      }
    }
    lastPosition.current = e.target.scrollTop;
  };
  useEffect(() => {
    const scrollContainer = props.scrollContainer.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleFetchScroll);
      return () => {
        scrollContainer.removeEventListener("scroll", handleFetchScroll);
      };
    }
  }, [currentPlayList]);
  if (!currentPlayList) {
    return null;
  }
  let checkAllFiltered = tracksMem.filter((track) => {
    let findId = props.selected.find((item) => {
      return item.trackid === track.track.uid;
    });
    if (!findId) {
      return track;
    }
  });
  const isSelected = (trackId) => {
    const findId = props.selected.some((set) => {
      return set.trackid === trackId;
    });
    checkScroll.current = true;
    return findId;
  };
  const update = () => {
    dispatch(updatePlaylist(props.selected));
    setLastUpdated(Date.now());
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
            background: mainColor ? mainColor.formattedMain : "transparent",
          }}
          className={style["album-cover-container"]}
        >
          <img
            id="playlistImage"
            className={style["album-cover"]}
            src={currentPlayList.images[0].url}
            alt=""
          />
          <div className={style["album-mask"]}></div>
        </div>
        <div className={style["playlist-info-container"]}>
          <h3 className={style["playlist-title"]}>{currentPlayList.name}</h3>
          <p className={style["playlist-creator"]}>
            Created By {currentPlayList.owner.display_name}
          </p>
          <div className={style["update-button-container"]}>
            <button onClick={update} className={style["update-button"]}>
              update
            </button>
            <div
              style={{ display: isUpdating ? "" : "none" }}
              className={style["lds-ring"]}
            >
              <div></div> <div></div> <div></div> <div></div>
            </div>
          </div>
        </div>
      </div>
      <div className={style["tracks-container"]}>
        <div className={style["label-container"]}>
          <div className={style["label-check-container"]}>
            <p
              style={{
                display: checkAllFiltered.length === 0 ? "none" : "block",
              }}
              className={style["label-count"]}
            >
              #
            </p>
            <CheckIcon
              style={{
                fill:
                  checkAllFiltered.length === 0 && props.selected.length > 0
                    ? "#1db954"
                    : "white",
                display: checkAllFiltered.length === 0 ? "block" : "none",
              }}
              onClick={handleCheckAll}
              className={style["check-box"]}
            />
          </div>
          <div className={style["label-title"]}>title</div>
          <div className={style["label-album"]}>album</div>
          <div className={style["label-playlist"]}>playlist</div>
        </div>
        <div className={style["item-wrapper"]}>
          {tracksMem.map((track, i) => {
            if (track.track.name.length > 0) {
              return (
                <PlaylistTracks
                  changed={tracksMem}
                  key={track.track.uid}
                  index={i}
                  lastUpdated={lastUpdated}
                  checkAll={props.selected.length > 0}
                  isSelected={isSelected(track.uid)}
                  getTracks={getTracksRef}
                  deletedArr={props.deletedArr}
                  selected={props.selected}
                  handleCheckSelected={props.handleCheckSelected}
                  track={{ track: track.track }}
                  playlist={currentPlayList}
                  imageSelection="album"
                />
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};
export default SinglePlaylist;

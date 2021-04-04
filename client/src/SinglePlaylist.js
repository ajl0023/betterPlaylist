import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { getColor } from "./colorMatch";
import { ReactComponent as CheckIcon } from "./images/check.svg";
import PlaylistTracks from "./PlaylistTracks";
import { getTracksScroll } from "./spotify-redux/actions/playlistActions";
import style from "./styles/singlePlaylist.module.scss";
const SinglePlaylist = (props) => {
  const [mainColor, setMainColor] = useState();
  const [playlist, setPlaylist] = useState();
  const params = useParams();
  const dispatch = useDispatch();
  const getTracksRef = useRef();
  const testRef = useRef();
  testRef.current = 3;
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
    if (currentPlayList.page.next) {
      let tracks = getTracks.map((item) => {
        return {
          trackid: item.track.uid,
          playlistid: item.playlist.id,
          index: item.track.index,
          uri: item.track.uri,
        };
      });
      const next = currentPlayList.page.next;
      const url = new URL(next);
      const query = new URLSearchParams(url.search);
      const mainOffSet = query.get("offset");
      let scrollPos = Math.round(e.target.scrollHeight - e.target.scrollTop);
      let clientHeight = e.target.clientHeight;
      if (
        scrollPos === clientHeight &&
        currentPlayList.page.offset < currentPlayList.page.total &&
        currentPlayList.page.next
      ) {
        props.handleCheckAll(tracks, currentPlayList.id, true);
        if (
          currentPlayList &&
          currentPlayList.page.offset < currentPlayList.page.total &&
          currentPlayList.page.next
        ) {
          dispatch(getTracksScroll(currentPlayList, mainOffSet));
        }
      }
    }
  };
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
  useEffect(() => {
    let scrollContainer = document.getElementById("scroll-container");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleFetchScroll);
    }
    return () => {
      scrollContainer.removeEventListener("scroll", handleFetchScroll);
    };
  }, [playlist]);
  let getTracks = [];
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
  const tracksMem = useMemo(() => {
    getTracks.filter((track) => {
      let findDeleted = props.deletedArr.find((obj) => {
        return obj.trackid === track.track.uid;
      });
      if (!findDeleted) {
        return track;
      }
    });
    return getTracks;
  }, [getTracks.length]);
  if (
    !currentPlayList ||
    !currentPlayList.tracks.length > 0 ||
    currentPlayList.length <= 0 ||
    !currentPlayList.images[0] ||
    !props.allTracks
  ) {
    return null;
  }
  let checkAllFiltered = getTracks.filter((track) => {
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
    return findId;
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
                display: checkAllFiltered.length === 0 ? "none" : "block",
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
          {tracksMem.map((track, i) => {
            if (track.track.name.length > 0) {
              return (
                <PlaylistTracks
                  testArr={props.testArr}
                  testRef={testRef}
                  changed={tracksMem}
                  key={track.uid}
                  index={i}
                  checkAll={props.selected.length > 0}
                  isSelected={isSelected(track.uid)}
                  getTracks={getTracksRef}
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

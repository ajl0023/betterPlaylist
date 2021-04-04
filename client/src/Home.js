import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import {
  recieveRecentTracks,
  recieveTopTracks,
} from "./spotify-redux/actions/trackActions";
import { logout } from "./spotify-redux/actions/userActions";
import style from "./styles/home.module.scss";
import Track from "./Track";
const getUser = (state) => {
  return state.current_user;
};
const getTop = (state) => {
  return state.tracks.top_tracks;
};
const getRecent = (state) => {
  return state.tracks.recent_tracks;
};
const topTracksSelector = createSelector(getTop, (state) => {
  return state;
});
const recentTracksSelector = createSelector(getRecent, (state) => {
  return state;
});
const userSelectorMem = createSelector(getUser, (state) => {
  return state;
});
const Home = () => {
  const userSelector = useSelector(userSelectorMem);
  const topTrackSel = useSelector(topTracksSelector);
  const recentTracksSel = useSelector(recentTracksSelector);
  const currentUser = userSelector;
  const currentUserInfo = currentUser.userInfo;
  const dispatch = useDispatch();
  const getTopTracks = topTrackSel;
  const getRecentTracks = recentTracksSel;
  let topTracksArr;
  if (getTopTracks) {
    topTracksArr = Object.keys(getTopTracks).map((id) => {
      return getTopTracks[id];
    });
  }
  let recentTracksArr;
  if (getRecentTracks) {
    recentTracksArr = Object.keys(getRecentTracks).map((id) => {
      return getRecentTracks[id];
    });
  }
  const handleLogout = () => {
    dispatch(logout()).then((status) => {
      if (status === 200) {
        window.location.reload();
      }
    });
  };
  useEffect(() => {
    dispatch(recieveTopTracks());
    dispatch(recieveRecentTracks());
  }, [currentUser.access_token]);
  if (!getTopTracks || !getRecentTracks || !currentUserInfo) {
    return null;
  }
  return (
    <div className={style["container"]}>
      <div className={style["user-container"]}>
        <input
          className={style["user-dropdown-input"]}
          type="checkbox"
          id="user-dropdown"
        />
        <label
          htmlFor="user-dropdown"
          className={style["user-icon-header-container"]}
        >
          <div className={style["user-icon-box"]}>
            <div className={style["user-icon-container"]}>
              <div className={style["user-image-container"]}>
                <img
                  className={style["user-image"]}
                  src={currentUserInfo.images[0].url}
                  alt=""
                />
              </div>
              <p className={style["user-displayName"]}>
                {currentUserInfo.display_name}
              </p>
              <div className={style["arrow-container"]}>
                <span className={style["user-arrow-trigger"]}></span>{" "}
              </div>
            </div>
            <div className={style["dropdown-container"]}>
              <span className={style["arrow-up"]}></span>
              <div className={style["dropdown-content-container"]}>
                <button
                  onClick={handleLogout}
                  className={style["dropdown-button"]}
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </label>
      </div>
      <div className={style["content"]}>
        <div className={style["user-info-container"]}>
          <div className={style["profile-picture-container"]}>
            <img
              src={currentUserInfo && currentUserInfo.images[0].url}
              className={style["profile-picture"]}
            ></img>
          </div>
          <h2 className={style["profile-name"]}>
            {currentUserInfo && currentUserInfo.display_name}
          </h2>
        </div>
      </div>
      <div className={style["track-divisor-container"]}>
        <div>
          <p className={style["top-tracks-title"]}>your top tracks</p>
          <div className={style["top-tracks-container"]}>
            {" "}
            {recentTracksArr.length > 0 && topTracksArr.length > 0
              ? topTracksArr.map((track) => {
                  return (
                    <Track
                      key={track.uid}
                      track={track}
                      image={track.album.images}
                    />
                  );
                })
              : null}
          </div>
        </div>
        <div>
          <p className={style["recently-played-title"]}>recently played</p>
          <div className={style["recent-tracks-container"]}>
            {recentTracksArr.length > 0 && topTracksArr.length > 0
              ? recentTracksArr.map((track) => {
                  return (
                    <Track
                      key={track.uid}
                      track={track}
                      image={track.album.images}
                    />
                  );
                })
              : null}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;

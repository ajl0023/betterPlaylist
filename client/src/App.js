import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useHistory } from "react-router-dom";
import Home from "./Home";
import Navbar from "./Navbar";
import PlaylistWrapper from "./PlaylistWrapper";
import { recievePlaylists } from "./spotify-redux/actions/playlistActions";
import {
  getAccessToken,
  getUserInfoAction,
  loginCheck,
} from "./spotify-redux/actions/userActions";
import style from "./styles/wrapper.module.scss";
function App() {
  const [user] = useState({});

  const history = useHistory();
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => {
    return state.current_user;
  });

  useEffect(() => {
    const scopes = `user-read-private user-read-email playlist-read-private playlist-modify-private user-top-read user-read-recently-played playlist-modify-public`;
    const url_object = new URL(window.location);
    const token = url_object.search;
    let tokenSplit = token.split("=");
    let decodedToken = tokenSplit[1];

    loginCheck()
      .then(() => {
        dispatch(getUserInfoAction());
        dispatch(recievePlaylists());
      })
      .catch(() => {
        if (decodedToken) {
          dispatch(getAccessToken(decodedToken)).then(() => {
            history.push("/");
            dispatch(getUserInfoAction());
            dispatch(recievePlaylists());
          });
        } else {
          window.location.href = `https://accounts.spotify.com/authorize?client_id=da42a01c50ef409f802caf63a98de4d4&response_type=code&redirect_uri=https://pacific-reef-15984.herokuapp.com&scope=${encodeURIComponent(
            scopes
          )}&show_dialog=true`;
        }
      });
  }, []);
  if (!currentUser.userInfo) {
    return <div></div>;
  }
  return (
    <div className={style.container}>
      <Navbar profile={user} />
      <Switch>
        <Route exact path="/">
          <Home profile={user}></Home>
        </Route>{" "}
        <Route path="/playlists">
          <PlaylistWrapper current_user={currentUser}></PlaylistWrapper>
        </Route>
      </Switch>
    </div>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Home from "./Home";
import TrackInfo from "./TrackInfo";
import axios from "axios";
import PlaylistTracks from "./PlaylistTracks";
import style from "./styles/wrapper.module.scss";
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
  Link,
  useHistory,
  useLocation,
} from "react-router-dom";
import {
  getUserInfoAction,
  getAccessToken,
  loginCheck,
} from "./spotify-redux/actions/userActions";
import { getUserInfo, authorization } from "./spotify-redux/actions/calls";
import Playlist from "./Playlist";
import { useDispatch, useSelector } from "react-redux";
import SinglePlaylist from "./SinglePlaylist";
import PlaylistWrapper from "./PlaylistWrapper";

function App() {
  const [test, setTest] = useState(false);
  const [user, setUser] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();
  const testFunc = () => {
    setTest(!test);
  };
  const currentUser = useSelector((state) => {
    return state.current_user;
  });
 
  useEffect(() => {
    const scopes = `user-read-private user-read-email playlist-read-private playlist-modify-private user-top-read user-read-recently-played playlist-modify-public`;
    const url_object = new URL(window.location);
    const token = url_object.search;
    let tokenSplit = token.split("=");
    let decodedToken = tokenSplit[1];
    // axios({
    //   url: "http://localhost:5000/login",
    //   method: "POST",
    //   withCredentials: true,
    // });
    loginCheck()
      .then(() => {
        dispatch(getUserInfoAction());
      })
      .catch(() => {
        if (decodedToken) {
          console.log("pause");
          dispatch(getAccessToken(decodedToken)).then(() => {
            console.log(currentUser.access_token);
            history.push("/");
            dispatch(getUserInfoAction());
          });
        } else {
          window.location.href = `https://accounts.spotify.com/authorize?client_id=da42a01c50ef409f802caf63a98de4d4&response_type=code&redirect_uri=http://localhost:5000&scope=${encodeURIComponent(
            scopes
          )}&show_dialog=true`;
        }
      });
  }, []);
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

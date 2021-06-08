import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useHistory } from "react-router-dom";
import Home from "./Home";
import Navbar from "./Navbar";
import PlaylistWrapper from "./PlaylistWrapper";
import {
  getAccessToken,
  getUserInfoAction,
  loginCheck,
} from "./spotify-redux/actions/userActions";
import style from "./styles/wrapper.module.scss";
export const generateUUID = () => {};
generateUUID();
function App() {
  const history = useHistory();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => {
    return state.current_user;
  });
  const [recreate, setRecreate] = useState(false);
  const reRecreateComp = () => {
    setRecreate(!recreate);
  };
  useEffect(() => {
    const scopes = `user-read-private user-read-email playlist-read-private playlist-modify-private user-top-read user-read-recently-played playlist-modify-public`;
    const url_object = new URL(window.location);
    const token = url_object.search;
    let tokenSplit = token.split("=");
    let decodedToken = tokenSplit[1];
    loginCheck()
      .then(() => {
        dispatch(getUserInfoAction());
      })
      .catch(() => {
        if (decodedToken && decodedToken !== "access_denied") {
          dispatch(getAccessToken(decodedToken))
            .then((access_token) => {
              if (access_token) {
                history.push("/");
                dispatch(getUserInfoAction(access_token));
              }
            })
            .catch(() => {});
        } else {
          window.location.href = `https://accounts.spotify.com/authorize?client_id=da42a01c50ef409f802caf63a98de4d4&response_type=code&redirect_uri=${
            window.location.origin === "http://localhost:3000"
              ? "http://localhost:3000"
              : "https://spotify-playlists-lake.vercel.app/"
          }&scope=${encodeURIComponent(scopes)}&show_dialog=true`;
        }
      });
  }, []);
  if (!currentUser.userInfo) {
    return null;
  }
  return (
    <div className={style.container}>
      <Navbar reRecreateComp={reRecreateComp} />
      <Switch>
        <Route exact path="/">
          <Home></Home>
        </Route>
        <Route
          path="/playlists"
          render={(props) => {
            return (
              <PlaylistWrapper
                {...props}
                recreate={recreate}
                current_user={currentUser}
              ></PlaylistWrapper>
            );
          }}
        ></Route>
      </Switch>
    </div>
  );
}
export default App;

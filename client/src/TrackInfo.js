import React, { useEffect, useState } from "react";
import axios from "axios";
import style from "./styles/trackInfo.module.scss";
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
  Link,
  useParams,
  useHistory,
  useLocation,
} from "react-router-dom";
import { getTrack } from "./spotify-redux/actions/calls";
const TrackInfo = () => {
  const [trackData, setTrackData] = useState({});
  let trackId = useParams();
  useEffect(() => {
    // getTrack(trackId).then((data) => {
    //   setTrackData(data.data);
    // });
  }, []);
  return <div className={style["test"]}>123123123</div>;
};

export default TrackInfo;

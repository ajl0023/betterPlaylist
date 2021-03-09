import React, { useEffect, useState, useCallback } from "react";
import { ReactComponent as MusicIcon } from "./images/music-note.svg";
import { useSelector, useDispatch } from "react-redux";
import style from "./styles/playlist.module.scss";
import { ReactComponent as SearchIcon } from "./images/search.svg";
import { ReactComponent as TrashIcon } from "./images/trash.svg";
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
  Link,
  useHistory,
  useRouteMatch,
  useLocation,
} from "react-router-dom";
import {
  getUserInfo,
  authorization,
  getRecentTracks,
  getTopTracks,
  getPlaylist,
  getPlayListTracks,
} from "./spotify-redux/actions/calls";
import SinglePlaylist from "./SinglePlaylist";
import { v4 as uuidv4 } from "uuid";
import PlaylistOptionsModal from "./PlaylistDeleteModal";
import {
  deleteTrackFromPlaylists,
  recievePlaylists,
} from "./spotify-redux/actions/playlistActions";
import PlaylistTrack from "./PlaylistTracks";

const Playlist = (props) => {
  const item = props.playlist;
  const location = useLocation();
  const [searchText, setSearchText] = useState("at");
  const [showCheckAll, setShowCheckAll] = useState(false);
  const [searchArr, setSearchArr] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCount, setSelectedCount] = useState([]);
  const [shouldRefresh, setRefresh] = useState(false);
  const [filteredSearch, setFilteredSearch] = useState([]);
  const dispatch = useDispatch();

  let { path, url } = useRouteMatch();

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

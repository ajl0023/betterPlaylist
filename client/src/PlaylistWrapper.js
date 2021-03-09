import React, { useEffect, useState, useCallback } from "react";
import { ReactComponent as MusicIcon } from "./images/music-note.svg";
import { useSelector, useDispatch } from "react-redux";
import style from "./styles/playlistWrapper.module.scss";
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
  useParams,
} from "react-router-dom";
import { ReactComponent as CheckIcon } from "./images/check.svg";

import Playlist from "./Playlist";
import {
  getUserInfo,
  authorization,
  getRecentTracks,
  getTopTracks,
  getPlaylist,
  getPlayListTracks,
  getTrack,
} from "./spotify-redux/actions/calls";
import SinglePlaylist from "./SinglePlaylist";
import { v4 as uuidv4 } from "uuid";
import PlaylistDeleteModal from "./PlaylistDeleteModal";
import PlaylistAddModal from "./PlaylistAddModal";
import {
  deleteTrackFromPlaylists,
  recievePlaylists,
  addTracksToPlaylists,
} from "./spotify-redux/actions/playlistActions";
import PlaylistTrack from "./PlaylistTracks";

const PlaylistWrapper = (props) => {
  const location = useLocation();
  const params = useParams();
  const [selectedAllIds, setSelectedAllIds] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [checkAll, setCheckAll] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState();
  const [searchArr, setSearchArr] = useState([]);
  const [scrollPos, setScrollPos] = useState({
    scrollPos: 0,
    clientHeight: null,
  });
  const [dropdown, setDropDown] = useState(false);
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selected, setSelected] = useState([]);
  const [shouldRefresh, setRefresh] = useState(false);
  const [filteredSearch, setFilteredSearch] = useState([]);
  const [deletedArr, setDeletedArr] = useState([]);
  const dispatch = useDispatch();
  const closeDeletedModal = () => {
    setShowDeletedModal(false);
  };
  const closeAddModal = () => {
    setShowAddModal(false);
  };
  let { path, url } = useRouteMatch();

  let getPlaylists = useSelector((state) => {
    return state.playlists.byIds;
  });
  let getAllTracks = useSelector((state) => {
    return state.tracks.byIds;
  });
  const searchBarText = useSelector((state) => {
    return state.navbar.searchBar;
  });
  let getPlaylistsArr = Object.keys(getPlaylists).map((playlist) => {
    return getPlaylists[playlist];
  });
  const findCurrentPlaylist = (id) => {
    setCurrentPlaylist(id);
  };
  const handleCheckSelected = (trackid, playlistid, uri, allTracks, index) => {
    let selectedArr = [...selected];
    let selectedAllIdsCopy = [...selectedAllIds];
    let obj = {};
    obj["trackid"] = trackid;
    obj["playlistid"] = playlistid;

    obj["uri"] = uri;
    obj["index"] = index;
    const findId = selectedArr.find((obj) => {
      return obj.trackid === trackid;
    });
    if (!findId) {
      selectedArr.push(obj);
      let getTracks = allTracks;

      let checkAllFiltered = getTracks.filter((track) => {
        let findId = selectedArr.find((item) => {
          return item.trackid === track.track.uid;
        });

        if (!findId) {
          return track;
        }
      });
      if (checkAllFiltered.length === 0) {
        selectedAllIdsCopy.push(playlistid);
      }
    } else {
      let index = selectedArr.findIndex((obj) => {
        return obj.trackid === trackid;
      });
      if (selectedAllIdsCopy.includes(playlistid)) {
        let playlistIndex = selectedAllIdsCopy.indexOf(playlistid);
        selectedAllIdsCopy.splice(playlistIndex, 1);
      }
      selectedArr.splice(index, 1);
    }
    setSelectedAllIds(selectedAllIdsCopy);
    setSelected(selectedArr);
    if (selectedArr.length > 0) {
      setDropDown(true);
    } else {
      setDropDown(false);
    }
  };
  useEffect(() => {
    setRefresh();

    dispatch(recievePlaylists());
  }, []);

  useEffect(() => {
    setSearchText("");
  }, [searchBarText]);

  const clearDropDown = (e) => {
    setDropDown(false);
    setSelectedAllIds([]);
    setSelected([]);
  };
  const openDeletedModal = () => {
    setShowDeletedModal(!showDeletedModal);
  };
  const openAddModal = () => {
    setShowAddModal(!showAddModal);
  };
  useEffect(() => {
    if (selected.length > 0) {
      setDropDown(true);
    } else {
      setDropDown(false);
    }
    console.log("updated");
  }, []);

  const handleChange = (e) => {
    let id = params;
    let tempArr = [];
    setSearchText("");
    setSelected([]);
    let arrToSearch;
    let text = e.target.value.trim();
    const whitespace = /\s/g;
    text = text.replace(whitespace, "");

    const regex = new RegExp("^" + text, "gi");
    if (location.pathname !== "/playlists") {
      arrToSearch = getPlaylistsArr.find((playlist) => {
        return playlist.id === currentPlaylist;
      });
      arrToSearch.tracks.forEach((item, i) => {
        if (item) {
          item = getAllTracks[item];
        }

        if (
          regex.test(item && item.name.replace(whitespace, "")) &&
          text.length > 0
        ) {
          tempArr.push({
            track: item,

            playlist: arrToSearch,
            uid: uuidv4(),
          });
        }
      });
    } else {
      arrToSearch = getPlaylistsArr;

      arrToSearch.forEach((playlist) => {
        playlist.tracks.forEach((item, i) => {
          if (item) {
            item = getAllTracks[item];
          }

          if (
            regex.test(item && item.name.replace(whitespace, "")) &&
            text.length > 0
          ) {
            tempArr.push({
              track: item,
              playlist: playlist,
              uid: uuidv4(),
            });
          }
        });
      });
    }

    setSearchText(e.target.value);
    setSearchArr(tempArr);

    setFilteredSearch(() => {
      let obj = {};
      for (let i = 0; i < tempArr.length; i++) {
        if (obj[tempArr[i].playlist.id]) {
          obj[tempArr[i].playlist.id].push(tempArr[i].track);
        } else {
          obj[tempArr[i].playlist.id] = [tempArr[i].track];
        }
      }
      let keys = Object.keys(obj);

      let toArray = keys.map((id) => {
        return getPlaylists[id];
      });

      return toArray;
    });
  };

  const handleDelete = () => {
    const copy = [...deletedArr];

    let filteredselected = selected.filter((set) => {
      let playlistToCheck = getPlaylists[set.playlistid];
      if (playlistToCheck.owner.display_name !== "Spotify") {
        return set;
      }
    });
    let deleted = copy.concat(filteredselected);
    dispatch(deleteTrackFromPlaylists(filteredselected)).then((status) => {
      if (status.status === 200 || typeof status === "string") {
        setDeletedArr(deleted);

        setShowDeletedModal(false);
        setDropDown(false);
        setSelected([]);
      }
    });
  };
  const handleAdd = (playlists) => {
    dispatch(addTracksToPlaylists(playlists, selected)).then((status) => {
      if (status === 200) {
        setShowAddModal(false);
        setDropDown(false);
        setSelected([]);
      }
    });
  };

  const handleCheckAll = (tracks, playlistId, scroll) => {
    setSelectedAllIds((prev) => {
      let copyAll = [...prev];

      let copySelected = [...selected];

      let length = copyAll.length;
      let index = copyAll.indexOf(playlistId);
      let filteredArr = [];
      if (!copyAll.includes(playlistId) && !scroll) {
        filteredArr = copySelected.filter((item) => {
          return item.playlistid !== playlistId;
        });
        filteredArr.push(...tracks);
        copyAll.push(playlistId);
        setSelected((prev) => {
          return filteredArr;
        });
      } else if (copyAll.includes(playlistId) && !scroll) {
        filteredArr = copySelected.filter((item) => {
          return item.playlistid !== playlistId;
        });
        copyAll.splice(index, 1);
        setSelected((prev) => {
          return filteredArr;
        });
      } else if (copyAll.includes(playlistId) && scroll) {
        copyAll.splice(index, 1);
        setSelected((prev) => {
          return prev;
        });
        // filteredArr = [...selected];
      }
      console.log(filteredArr, "topLevel");

      return copyAll;
    });
  };

  const handleFetch = (e) => {
    // let scrollPos = Math.round(e.target.scrollHeight - e.target.scrollTop);
    // let clientHeight = e.target.clientHeight;
    // setScrollPos(() => {
    //   let obj = {};
    //   obj["scrollPos"] = scrollPos;
    //   obj["cliHeight"] = clientHeight;
    //   return obj;
    // });
  };
  if (!getPlaylistsArr) {
    return <div></div>;
  }

  return (
    <div
      id="scroll-container"
      onScroll={handleFetch}
      className={style["container-container"]}
    >
      <div className={style["header-container"]}>
        <div
          className={
            style[selected.length > 0 ? "options-container" : "inactive"]
          }
        >
          <div
            className={
              style[
                dropdown || selected.length > 0
                  ? "drop-down-container"
                  : "inactive"
              ]
            }
          >
            <div className={style["drop-down-content"]}>
              <div className={style["drop-down-left-container"]}>
                <div
                  onClick={clearDropDown}
                  className={style["cancel-icon-container"]}
                >
                  <span className={style["main-trigger-icon-container"]}>
                    <i className={style["main-trigger-icon"]}></i>
                  </span>
                </div>
                <p className={style["selected-count"]}>
                  Selected {selected.length}
                </p>
              </div>

              <div className={style["main-options-icons"]}>
                <TrashIcon
                  onClick={openDeletedModal}
                  className={style["trash-icon"]}
                />

                <div
                  onClick={openAddModal}
                  className={style["add-icon-container"]}
                >
                  <span className={style["main-trigger-icon-container"]}>
                    <i className={style["main-trigger-icon"]}></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={style[dropdown ? "inactive" : "title-options-container"]}
        >
          <div
            className={
              style[selected.length > 0 ? "inactive" : "title-container"]
            }
          >
            <p className={style["title-text"]}>Playlists</p>
            <div className={style["input-container"]}>
              <input
                onChange={handleChange}
                value={searchText}
                className={style["input-searchbar"]}
                type="text"
                name=""
                id=""
              />
              <div className={style["input-content-container"]}>
                <SearchIcon className={style["search-icon"]} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={style["wrapper"]}>
        <div>
          <PlaylistDeleteModal
            showModal={showDeletedModal}
            handleDelete={handleDelete}
            closeModal={closeDeletedModal}
          />
          <PlaylistAddModal
            current_user={props.current_user}
            playlist={getPlaylistsArr}
            showModal={showAddModal}
            selected={selected}
            handleAdd={handleAdd}
            closeModal={closeAddModal}
          />

          <div className={style["container"]}>
            <div
              className={
                style[
                  location.pathname === "/playlists"
                    ? "search-results-container"
                    : "inactive"
                ]
              }
            >
              <div
                className={
                  style[
                    filteredSearch.length > 0 && searchText.length > 0
                      ? "inactive"
                      : "item-container"
                  ]
                }
              >
                {getPlaylistsArr.map((item) => {
                  return <Playlist playlist={item} />;
                })}
              </div>
            </div>
            <div
              className={
                style[
                  filteredSearch.length > 0 && searchText.length > 0
                    ? "tracks-container"
                    : "inactive"
                ]
              }
            >
              <div className={style["label-container"]}>
                <div className={style["label-check-container"]}>
                  <CheckIcon
                    style={{
                      fill: checkAll ? "#1db954" : "white",
                      display: checkAll ? "block" : "none",
                    }}
                    onClick={() => handleCheckAll(searchArr)}
                    className={style["check-box"]}
                  />

                  <li
                    style={{
                      display: checkAll ? "none" : "block",
                    }}
                    className={style["label-count"]}
                  >
                    #
                  </li>
                </div>
                <li className={style["label-title"]}>title</li>
                <li className={style["label-artist"]}>album</li>
                <li className={style["label-playlist"]}>playlist</li>{" "}
              </div>
              <div className={style["item-wrapper"]}>
                {searchArr.map((track, i) => {
                  return (
                    <PlaylistTrack
                      deletedArr={deletedArr}
                      key={track.track && track.track.uid + track.playlist.uid}
                      handleCheckSelected={handleCheckSelected}
                      playlistSet={track}
                      selected={selected}
                      index={i}
                    ></PlaylistTrack>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <Switch>
          <Route path={`${path}/:id`}>
            <SinglePlaylist
              selectedAllIds={selectedAllIds}
              handleCheckAll={handleCheckAll}
              deletedArr={deletedArr}
              searchText={searchText.length}
              searchArr={searchArr.length}
              findCurrentPlaylist={findCurrentPlaylist}
              handleCheckSelected={handleCheckSelected}
              playlist={getPlaylists}
              selected={selected}
              allTracks={getAllTracks}
            />
          </Route>
        </Switch>
      </div>{" "}
    </div>
  );
};

export default PlaylistWrapper;

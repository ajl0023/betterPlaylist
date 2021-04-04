import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useLocation, useRouteMatch } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { ReactComponent as AddIcon } from "./images/add-icon.svg";
import { ReactComponent as CheckIcon } from "./images/check.svg";
import { ReactComponent as SearchIcon } from "./images/search.svg";
import { ReactComponent as TrashIcon } from "./images/trash.svg";
import Playlist from "./Playlist";
import PlaylistAddModal from "./PlaylistAddModal";
import PlaylistDeleteModal from "./PlaylistDeleteModal";
import PlaylistTrack from "./PlaylistTracks";
import SinglePlaylist from "./SinglePlaylist";
import {
  addTracksToPlaylists,
  deleteTrackFromPlaylists,
  recievePlaylists,
} from "./spotify-redux/actions/playlistActions";
import style from "./styles/playlistWrapper.module.scss";
const PlaylistWrapper = (props) => {
  const location = useLocation();
  const [selectedAllIds, setSelectedAllIds] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPlaylist, setCurrentPlaylist] = useState();
  const [searchArr, setSearchArr] = useState([]);
  const [dropdown, setDropDown] = useState(false);
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selected, setSelected] = useState([]);
  const [, setRefresh] = useState(false);
  const [, setFilteredSearch] = useState([]);
  const [deletedArr, setDeletedArr] = useState([]);
  const dispatch = useDispatch();
  const closeDeletedModal = () => {
    setShowDeletedModal(false);
  };
  let { path } = useRouteMatch();
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
    setSelected((prev) => {
      let searchArrCopy = [...searchArr];
      let selectedArr = [...prev];
      let selectedAllIdsCopy = [...selectedAllIds];
      let obj = {};
      obj["trackid"] = trackid;
      obj["playlistid"] = playlistid;
      obj["uri"] = uri;
      obj["index"] = index;
      const findId = selectedArr.find((obj) => {
        return obj.trackid === trackid;
      });
      const prevCopy = [...prev];
      if (!findId) {
        prevCopy.push(obj);
        let getTracks = allTracks;
      } else {
        let index = prevCopy.findIndex((obj) => {
          return obj.trackid === trackid;
        });
        if (selectedAllIdsCopy.includes(playlistid)) {
          let playlistIndex = selectedAllIdsCopy.indexOf(playlistid);
          selectedAllIdsCopy.splice(playlistIndex, 1);
        } else if (selectedAllIdsCopy.includes("search")) {
          let playlistIndex = selectedAllIdsCopy.indexOf("search");
          selectedAllIdsCopy.splice(playlistIndex, 1);
        }
        prevCopy.splice(index, 1);
      }
      let checkAllFiltered = searchArrCopy.filter((track) => {
        let findId = prevCopy.find((item) => {
          return item.trackid === track.track.uid;
        });
        if (!findId) {
          return track;
        }
      });
      if (checkAllFiltered.length === 0) {
        selectedAllIdsCopy.push("search");
      }
      setSelectedAllIds(selectedAllIdsCopy);
      return prevCopy;
    });
  };
  useEffect(() => {
    setSearchText("");
  }, [props.recreate]);
  useEffect(() => {
    dispatch(recievePlaylists());
    setRefresh();
  }, []);
  useEffect(() => {
    setSearchText("");
  }, [searchBarText]);
  const clearDropDown = () => {
    setDropDown(false);
    setSelectedAllIds([]);
    setSelected([]);
  };
  const openDeletedModal = () => {
    setShowDeletedModal(!showDeletedModal);
  };
  const openAddModal = () => {
    setShowAddModal(true);
  };
  useEffect(() => {
    if (selected.length > 0) {
      setDropDown(true);
    } else {
      setDropDown(false);
    }
  }, []);
  const handleChange = (e) => {
    let tempArr = [];
    setSearchText("");
    setSelected([]);
    let arrToSearch;
    let text = e.target.value.trim();
    const whitespace = /\s/g;
    let searchComp;
    text = text.replace(whitespace, "");
    const regex = new RegExp("^" + text, "gi");
    if (location.pathname !== "/playlists") {
      arrToSearch = getPlaylistsArr.find((playlist) => {
        return playlist.id === currentPlaylist;
      });
      searchComp = arrToSearch.tracks.reduce((arr, item) => {
        let track = getAllTracks[item];
        let name = track.name;
        if (regex.test(name.trim()) && text.length > 0) {
          arr.push({
            track: track,
            playlist: arrToSearch,
            uid: uuidv4(),
          });
        }
        return arr;
      }, []);
    } else {
      let allTracks = getPlaylistsArr.reduce((arr, playlist) => {
        let tracksArr = playlist.tracks;
        tracksArr.reduce((arrNest, trackNest) => {
          arr.push({
            ...getAllTracks[trackNest],
            playlist: playlist,
          });
        }, []);
        return arr;
      }, []);
      searchComp = allTracks.reduce((arr, track) => {
        let name = track.name;
        if (regex.test(name.trim()) && text.length > 0) {
          arr.push({
            track: track,
            playlist: track.playlist,
            uid: uuidv4(),
          });
        }
        return arr;
      }, []);
    }
    setSearchText(e.target.value);
    setSearchArr(searchComp);
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
  const handleAdd = useCallback(
    (playlists) => {
      dispatch(addTracksToPlaylists(playlists, selected)).then((status) => {
        if (status === 200) {
          setShowAddModal(false);
          setDropDown(false);
          setSelected([]);
          setSelectedAllIds([]);
        }
      });
    },
    [selected]
  );
  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
  }, [selected]);
  const handleCheckAll = (tracks, playlistId, scroll) => {
    tracks =
      playlistId === "search"
        ? (tracks = tracks.map((track) => {
            return {
              trackid: track.track.uid,
              playlistid: track.playlist.id,
              uri: track.track.uri,
            };
          }))
        : tracks;
    setSelectedAllIds((prev) => {
      let copyAll = [...prev];
      let copySelected = [...selected];
      let index = copyAll.indexOf(playlistId);
      let filteredArr = [];
      if (!copyAll.includes(playlistId) && !scroll) {
        filteredArr.push(...tracks);
        copyAll.push(playlistId);
        setSelected(() => {
          return filteredArr;
        });
      } else if (copyAll.includes(playlistId) && !scroll) {
        filteredArr = copySelected.filter((item) => {
          return item.playlistid !== playlistId;
        });
        copyAll.splice(index, 1);
        setSelected(() => {
          return [];
        });
      } else if (copyAll.includes(playlistId) && scroll) {
        copyAll.splice(index, 1);
        setSelected((prev) => {
          return prev;
        });
      }
      return copyAll;
    });
  };
  if (!getPlaylistsArr) {
    return null;
  }
  let filteredSearchArr = searchArr.filter((track) => {
    let findDeleted = deletedArr.find((obj) => {
      return obj.trackid === track.track.uid;
    });
    if (!findDeleted) {
      return track;
    }
  });
  const isSelected = (trackId) => {
    const findId = selected.some((set) => {
      return set.trackid === trackId;
    });
    return findId;
  };
  return (
    <div id="scroll-container" className={style["container-container"]}>
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
                <AddIcon
                  onClick={openAddModal}
                  className={style["add-icon-container"]}
                ></AddIcon>
              </div>
            </div>
          </div>
        </div>
        <div
          className={
            style[selected.length > 0 ? "inactive" : "title-options-container"]
          }
        >
          <div
            className={
              style[selected.length > 0 ? "inactive" : "title-container"]
            }
          >
            <p className={style["title-text"]}>Playlists</p>
            <div
              className={
                style[
                  Object.keys(getAllTracks).length > 0
                    ? "input-container"
                    : "inactive"
                ]
              }
            >
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
                    searchArr.length > 0 && searchText.length > 0
                      ? "inactive"
                      : "item-container"
                  ]
                }
              >
                {getPlaylistsArr.map((item) => {
                  return <Playlist key={item.id} playlist={item} />;
                })}
              </div>
            </div>
            <div
              className={
                style[
                  searchArr.length > 0 && searchText.length > 0
                    ? "tracks-container"
                    : "inactive"
                ]
              }
            >
              <div className={style["label-container"]}>
                <div className={style["label-check-container"]}>
                  <CheckIcon
                    style={{
                      fill: selectedAllIds.includes("search")
                        ? "#1db954"
                        : "white",
                      display: selectedAllIds.includes("search")
                        ? "block"
                        : "none",
                    }}
                    onClick={() => {
                      handleCheckAll(searchArr, "search", false);
                    }}
                    className={style["check-box"]}
                  />
                  <li
                    style={{
                      display: selectedAllIds.includes("search")
                        ? "none"
                        : "block",
                    }}
                    className={style["label-count"]}
                  >
                    #
                  </li>
                </div>
                <li className={style["label-title"]}>title</li>
                <li className={style["label-album"]}>album</li>
                <li className={style["label-playlist"]}>playlist</li>{" "}
              </div>
              <div className={style["item-wrapper"]}>
                {filteredSearchArr.map((track, i) => {
                  return (
                    <PlaylistTrack
                      checkAll={selected.length > 0}
                      isSelected={isSelected(track.track.uid)}
                      searchArr={searchArr}
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

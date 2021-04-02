import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Route,
  Switch,
  useLocation,
  useParams,
  useRouteMatch,
} from "react-router-dom";
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
  const params = useParams();
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
  const closeAddModal = () => {
    setShowAddModal(false);
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
  const handleAdd = (playlists) => {
    dispatch(addTracksToPlaylists(playlists, selected)).then((status) => {
      if (status === 200) {
        setShowAddModal(false);
        setDropDown(false);
        setSelected([]);
        setSelectedAllIds([]);
      }
    });
  };
  const handleCheckAll = (tracks, playlistId, scroll) => {
    setSelectedAllIds((prev) => {
      let copyAll = [...prev];
      let copySelected = [...selected];
      let index = copyAll.indexOf(playlistId);
      let filteredArr = [];
      if (!copyAll.includes(playlistId) && !scroll) {
        filteredArr = copySelected.filter((item) => {
          return item.playlistid !== playlistId;
        });
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
          return filteredArr;
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
  const handleCheckSearch = (uid, playlistid) => {
    let searchArrCopy = [...searchArr];
    let selectedCopy = [...selected];
    let selectedAllIdsCopy = [...selectedAllIds];
    let findTrack = selectedCopy.find((item) => {
      return item.trackid === uid;
    });
    let length = searchArrCopy.length;
    if (selectedAllIds.includes("search")) {
      let index = selectedAllIdsCopy.indexOf("search");
      selectedAllIdsCopy.splice(index, 1);
      setSelectedAllIds(selectedAllIdsCopy);
    }
    const indexFromPlaylist = getPlaylists[playlistid].tracks.indexOf(uid);
    for (let i = 0; i < length; i++) {
      if (searchArrCopy[i].track.uid === uid && !findTrack) {
        selectedCopy.push({
          trackid: searchArrCopy[i].track.uid,
          playlistid: searchArrCopy[i].playlist.id,
          uri: searchArrCopy[i].track.uri,
          index: indexFromPlaylist,
          origin: "search",
        });
        let obj = { ...searchArrCopy[i] };
        searchArrCopy[i] = obj;
        let checkAllFiltered = searchArrCopy.filter((track) => {
          let findId = selectedCopy.find((item) => {
            return item.trackid === track.track.uid;
          });
          if (!findId) {
            return track;
          }
        });
        if (
          checkAllFiltered.length === 0 &&
          !selectedAllIdsCopy.includes("search")
        ) {
          selectedAllIdsCopy.push("search");
        }
      } else if (searchArrCopy[i].track.uid === uid && findTrack) {
        selectedCopy = selectedCopy.filter((item) => {
          return item.trackid !== searchArrCopy[i].track.uid;
        });
      }
      setSelectedAllIds(selectedAllIdsCopy);
      setSelected(selectedCopy);
      setSearchArr(searchArrCopy);
    }
  };
  const handleCheckSearchAll = () => {
    let searchArrCopy = [...searchArr];
    let selectedCopy = [...selected];
    let selectedAllIdsCopy = [...selectedAllIds];
    let index = selectedAllIdsCopy.indexOf("search");
    if (index >= 0) {
      selectedAllIdsCopy.splice(index, 1);
      selectedCopy = selectedCopy.filter((set) => {
        return set.checkId !== "search";
      });
    } else {
      let checkAllFiltered = searchArrCopy
        .filter((track) => {
          let findId = selectedCopy.find((item) => {
            return item.trackid === track.track.uid;
          });
          if (!findId) {
            return track;
          }
        })
        .map((item) => {
          let obj = {
            trackid: item.track.uid,
            playlistid: item.playlist.id,
            uri: item.track.uri,
            index: item.track.index,
            selected: true,
            checkId: "search",
          };
          return obj;
        });
      selectedAllIdsCopy.push("search");
      selectedCopy.push(...checkAllFiltered);
    }
    setSelectedAllIds(selectedAllIdsCopy);
    setSelected(selectedCopy);
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
                      handleCheckSearchAll();
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
                      searchArr={searchArr}
                      deletedArr={deletedArr}
                      handleCheckSearch={handleCheckSearch}
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

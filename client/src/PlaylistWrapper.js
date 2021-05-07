import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useLocation, useRouteMatch } from "react-router-dom";
import { createSelector } from "reselect";
import { ReactComponent as AddIcon } from "./images/add-icon.svg";
import { ReactComponent as SearchIcon } from "./images/search.svg";
import { ReactComponent as TrashIcon } from "./images/trash.svg";
import Playlist from "./Playlist";
import PlaylistAddModal from "./PlaylistAddModal";
import PlaylistDeleteModal from "./PlaylistDeleteModal";
import SearchContainer from "./SearchContainer";
import SinglePlaylist from "./SinglePlaylist";
import {
  addTracksToPlaylists,
  deleteTrackFromPlaylists,
  getMoreTracksPlaylist,
  getTracksScroll,
  recievePlaylists,
  searchPlaylists,
} from "./spotify-redux/actions/playlistActions";
import { CLEAR_SEARCH_RESULTS } from "./spotify-redux/types/types";
import style from "./styles/playlistWrapper.module.scss";
const searchResults = (state) => {
  return state.search.results.length > 0;
};
const hasNext = (state) => {
  return state.search.prevResults && state.search.prevResults.length > 0;
};
const searchResultsSelector = createSelector(
  searchResults,
  hasNext,
  (searchResults, hasNext) => {
    return { searchResults, hasNext };
  }
);
export const PlaylistWrapper = (props) => {
  const scrollContainerRef = useRef();
  const searchActive = useSelector(searchResultsSelector);
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
  const [,] = useState([]);
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
  const searchResults = useSelector((state) => {
    return state.search.results;
  });
  const handleCheckSelected = (trackid, playlistid, uri, allTracks, index) => {
    setSelected((prev) => {
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
      let checkAllFiltered = searchResults.filter((track) => {
        let findId = prevCopy.find((item) => {
          return item.trackid === track._id;
        });
        if (!findId) {
          return track;
        }
      });
      if (checkAllFiltered.length === 0 && searchActive.searchResults) {
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
  const lastPosition = useRef(true);
  const handleChange = (e) => {
    setSearchText("");
    setSelected([]);
    let text = e.target.value.trim();
    const whitespace = /\s/g;
    text = text.replace(whitespace, "");
    setSearchText(text);
    if (text.length > 0) {
      dispatch(
        searchPlaylists(
          text,
          location.pathname === "/playlists",
          currentPlaylist
        )
      )
        .then((status) => {
          if (status === 200) {
            scrollContainerRef.current.scrollTo(0, 0);
          }
        })
        .catch(() => {});
    }
    dispatch({ type: CLEAR_SEARCH_RESULTS, results: [] });
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
    dispatch(
      deleteTrackFromPlaylists(filteredselected, searchActive.searchResults)
    )
      .then((status) => {
        if ((status && status.status === 200) || typeof status === "string") {
          setDeletedArr(deleted);
          setShowDeletedModal(false);
          setDropDown(false);
          setSelected([]);
          setSearchText("");
          dispatch({ type: CLEAR_SEARCH_RESULTS });
        }
      })
      .catch(() => {
        alert("Data out of sync, click update to sync data with Spotify");
      });
  };
  const handleAdd = useCallback(
    (playlists) => {
      dispatch(addTracksToPlaylists(playlists, selected))
        .then((status) => {
          if (status === 200) {
            setShowAddModal(false);
            setDropDown(false);
            setSelected([]);
            setSelectedAllIds([]);
          }
        })
        .catch(() => {
          alert("Data out of sync, click update to sync data with Spotify");
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
              trackid: track._id,
              playlistid: track.playlistid,
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
  const checkScroll = useRef(true);
  if (!getPlaylistsArr) {
    return null;
  }
  const isSelected = (trackId) => {
    const findId = selected.some((set) => {
      return set.trackid === trackId;
    });
    return findId;
  };
  const handleFetchScroll = (e) => {
    let scrollPos = Math.round(e.target.scrollHeight - e.target.scrollTop);
    let clientHeight = e.target.clientHeight;
    if (
      scrollPos - 100 <= clientHeight &&
      scrollPos + 20 >= clientHeight &&
      lastPosition.current < e.target.scrollTop &&
      checkScroll.current &&
      searchActive.searchResults &&
      searchActive.hasNext === true
    ) {
      checkScroll.current = false;
      dispatch(
        searchPlaylists(
          searchText,
          location.pathname === "/playlists",
          currentPlaylist,
          true
        )
      )
        .then(() => {
          checkScroll.current = true;
        })
        .catch(() => {});
    }
    lastPosition.current = e.target.scrollTop;
  };
  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleFetchScroll}
      id="scroll-container"
      data-testid="scroll-container"
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
                  data-testid="delete icon"
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
            <div className={style["input-container"]}>
              <input
                aria-label="search-bar"
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
                    searchActive.searchResults && searchText.length > 0
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
          </div>
          {searchActive.searchResults ? (
            <SearchContainer
              handleCheckAll={handleCheckAll}
              location={location}
              selectedAllIds={selectedAllIds}
              searchArr={searchArr}
              selected={selected}
              isSelected={isSelected}
              handleCheckSelected={handleCheckSelected}
              currentPlaylist={currentPlaylist}
              deletedArr={deletedArr}
            />
          ) : null}
        </div>
        <Switch>
          <Route path={`${path}/:id`}>
            {searchActive.searchResults ? null : (
              <SinglePlaylist
                handleFetchScroll={handleFetchScroll}
                selectedAllIds={selectedAllIds}
                handleCheckAll={handleCheckAll}
                deletedArr={deletedArr}
                searchText={searchText.length}
                searchArr={searchArr.length}
                findCurrentPlaylist={findCurrentPlaylist}
                handleCheckSelected={handleCheckSelected}
                selected={selected}
                searchActive={searchActive.searchResults}
                allTracks={getAllTracks}
                scrollContainer={scrollContainerRef}
              />
            )}
          </Route>
        </Switch>
      </div>
    </div>
  );
};
export default PlaylistWrapper;

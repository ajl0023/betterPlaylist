import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PlaylistTrack from "./PlaylistTracks";
import style from "./styles/searchContainer.module.scss";
import { createSelector } from "reselect";
import { ReactComponent as CheckIcon } from "./images/check.svg";
import { updatePlaylist } from "./spotify-redux/actions/playlistActions";
const playlist = (state) => {
  return state.playlists.byIds;
};
const playlistSelector = createSelector(playlist, (playlist) => {
  return playlist;
});
const SearchContainer = (props) => {
  const dispatch = useDispatch();
  const [updated, setLastUpdated] = useState(0);
  const isUpdating = useSelector((state) => {
    return state.playlists.isUpdating;
  });
  let searchResults = useSelector((state) => {
    return state.search.results;
  });
  let filteredSearch;
  if (props.location.pathname !== "/playlists") {
    filteredSearch = searchResults.filter((result) => {
      return result.playlistid === props.currentPlaylist;
    });
  }
  const playlist = useSelector(playlistSelector);
  const update = () => {
    dispatch(updatePlaylist());
    setLastUpdated(Date.now());
  };
  return (
    <div className={style["tracks-container"]}>
      <div className={style["update-button-container"]}>
        <button onClick={update} className={style["update-button"]}>
          update
        </button>
        <div
          style={{
            display: isUpdating ? "" : "none",
          }}
          className={style["lds-ring"]}
        >
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <div className={style["label-container"]}>
        <div className={style["label-check-container"]}>
          <CheckIcon
            style={{
              fill: props.selectedAllIds.includes("search")
                ? "#1db954"
                : "white",
              display: props.selectedAllIds.includes("search")
                ? "block"
                : "none",
            }}
            onClick={() => {
              props.handleCheckAll(searchResults, "search", false);
            }}
            className={style["check-box"]}
          />
          <li
            style={{
              display: props.selectedAllIds.includes("search")
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
        <li className={style["label-playlist"]}>playlist</li>
      </div>
      <div className={style["item-wrapper"]}>
        {(props.location.pathname === "/playlists"
          ? searchResults
          : filteredSearch
        ).map((result, i) => {
          return (
            <PlaylistTrack
              checkAll={props.selected.length > 0}
              isSelected={props.isSelected(result._id)}
              deletedArr={props.deletedArr}
              key={result._id}
              handleCheckSelected={props.handleCheckSelected}
              playlist={playlist[result.playlistid]}
              track={result}
              selected={props.selected}
              index={i}
            ></PlaylistTrack>
          );
        })}
        {/* {filteredSearchArr.map((track, i) => {
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
                })} */}
        {/* <SearchContainer
          searchArr={searchArr}
          selected={selected}
          deletedArr={deletedArr}
        /> */}
      </div>
    </div>
  );
};
export default SearchContainer;

import axios from "axios";
import ObjectId from "bson-objectid";
import * as types from "../types/types";
import {
  addTracksToPlaylistsCall,
  deleteFromPlaylist,
  getPlaylists,
  getPlayListTracks,
  fetchSinglePlaylist,
  getSearchResults,
  updatePlaylistApi,
} from "./calls";
const requestPlaylists = () => {
  return (dispatch) => {
    dispatch({ type: types.REQUEST_PLAYLISTS });
  };
};
export const addTracksToPlaylists = (playlist, tracks) => async (
  dispatch,
  getState
) => {
  dispatch({ type: types.ADD_TRACK_REQUEST });
  const allTracks = getState().tracks.byIds;
  const trackids = [];
  const tracksFordb = {};
  const tracksForReducer = {};
  const tracksToadd = tracks.map((track) => {
    return track.uri;
  });
  const tracksForPlaylist = {};
  let obj = {};
  for (let item of playlist) {
    for (let set of tracks) {
      const uuid = ObjectId();
      const trackCopy = { ...allTracks[set.trackid] };
      trackCopy["uid"] = uuid.toString();
      tracksForReducer[uuid] = trackCopy;
      trackids.push(trackCopy.id);
      tracksFordb[trackCopy.uid] = trackCopy;
      if (!tracksForPlaylist[item.playlistid]) {
        tracksForPlaylist[item.playlistid] = [trackCopy];
      } else {
        tracksForPlaylist[item.playlistid].push(trackCopy);
      }
    }
    obj[item.playlistid] = tracksToadd;
  }
  const data = await addTracksToPlaylistsCall(obj, trackids, tracksForPlaylist);
  dispatch({
    type: types.ADD_TRACK_SUCCESS,
    playlists: Object.keys(obj),
    tracksToAdd: tracksForPlaylist,
    trackids: Object.keys(tracksForReducer),
  });
  return data.status;
};
export const deleteTrackFromPlaylists = (playlistTracks, searchActive) => {
  return async (dispatch, getState) => {
    dispatch({ type: types.DELETE_TRACK_REQUEST });
    const length = playlistTracks.length;
    const playlistids = [];
    const trackids = [];
    const apiData = {};
    for (let i = 0; i < length; i++) {
      trackids.push(playlistTracks[i].trackid);
      if (!playlistids.includes(playlistTracks[i].playlistid)) {
        playlistids.push(playlistTracks[i].playlistid);
        apiData[playlistTracks[i].playlistid] = {};
        apiData[playlistTracks[i].playlistid]["tracks"] = [playlistTracks[i]];
      } else {
        apiData[playlistTracks[i].playlistid]["tracks"].push(playlistTracks[i]);
      }
    }
    let data;
    try {
      data = await deleteFromPlaylist(
        apiData,
        searchActive,
        playlistids,
        trackids
      );
    } catch (error) {
      dispatch({
        type: types.DATABASE_SYNC_ERROR,
      });
      return Promise.reject(error.response.status);
    }
    dispatch({
      trackids,
      playlistids,
      apiData,
      type: types.DELETE_TRACK_SUCCESS,
    });
    return {
      status: data.status,
    };
  };
};
export function getSinglePlaylist(id) {
  return (dispatch) => {
    fetchSinglePlaylist(id).then((data) => {
      const tracksObj = {};
      const playlistData = data.data.playlist;
      data.data.tracks.forEach((track, i) => {
        track.track["position"] = i;
        track.track["uid"] = track._id;
        tracksObj[track._id] = track.track;
      });
      const trackIds = Object.keys(tracksObj);
      playlistData.tracks = trackIds;
      dispatch({
        type: types.GET_SINGLE_PLAYLIST,
        data: playlistData,
        tracks: tracksObj,
        trackIds,
        offset: data.data.offset,
      });
    });
  };
}
export function updatePlaylist(selected) {
  return async (dispatch, getState) => {
    dispatch({ type: types.UPDATE_PLAYLIST_REQUEST });
    const data = await updatePlaylistApi();
    const idsToRemove = [];
    const currPlaylists = getState().playlists.byIds;
    const calls = [];
    for (let playlist of data.data.updatedPlaylists) {
      calls.push(fetchSinglePlaylist(playlist));
      idsToRemove.push(...currPlaylists[playlist].tracks);
    }
    const playlists = {};
    const resolved = await Promise.all(calls);
    const allTracksArr = resolved.reduce((acc, set) => {
      acc.push(...set.data.tracks);
      const playlistCopy = { ...set.data.playlist };
      playlistCopy["tracks"] = playlistCopy["tracksArr"];
      playlists[set.data.playlist.id] = playlistCopy;
      return acc;
    }, []);
    const allTracksObj = allTracksArr.reduce((acc, track) => {
      track.track["uid"] = track._id;
      acc[track._id] = track.track;
      return acc;
    }, {});
    dispatch({
      type: types.UPDATE_PLAYLIST_SUCCESS,
      idsToRemove,
      playlists,
      tracks: allTracksObj,
    });
  };
}
export function getTracksScroll(playlist, mainOffSet) {
  return async (dispatch) => {
    dispatch({
      type: types.REQUEST_TRACKS,
    });
    try {
      const data = await getPlayListTracks(playlist.id, mainOffSet);
      let tracks = {};
      data.data.items.forEach((track) => {
        tracks[track.uid] = track;
      });
      if (data.status === 200) {
        dispatch({
          type: types.RECIEVE_TRACKS,
          trackIds: data.data.items.map((tracks_1) => {
            return tracks_1.uid;
          }),
          tracks,
          page: data.data.page,
          playlist,
        });
      }
    } catch (err) {}
  };
}
export function getMoreTracksPlaylist(id) {
  return async (dispatch, getState) => {
    const offset = getState().playlists.byIds[id].offset;
    dispatch({ type: types.REQUEST_ADDITIONAL_TRACKS });
    const data = await fetchSinglePlaylist(id, true, offset);
    const trackIds = data.data.tracks.map((track) => {
      return track._id;
    });
    const trackObjs = {};
    for (let track of data.data.tracks) {
      track.track["uid"] = track._id;
      trackObjs[track._id] = track.track;
    }
    if (data.status === 200) {
      dispatch({
        playlistid: id,
        type: types.RECIEVE_ADDITIONAL_TRACKS,
        trackids: trackIds,
        tracks: trackObjs,
        offset: data.data.offset,
      });
    }
    return data;
  };
}
export function recievePlaylists() {
  return (dispatch) => {
    dispatch(requestPlaylists());
    getPlaylists()
      .then((data) => {
        let playlists = data.data.playlists;
        let playlistObj = {};
        playlists.forEach((playlist) => {
          playlist.tracks = [];
          playlistObj[playlist.id] = playlist;
        });
        dispatch({
          byIds: playlistObj,
          type: types.RECIEVE_PLAYLISTS,
          allIds: Object.keys(playlistObj),
        });
      })
      .catch((err) => {});
  };
}
let timeout;
export function searchPlaylists(regex, params, currentPlaylist, scroll) {
  return async (dispatch, getState) => {
    let offsetId = {};
    clearTimeout(timeout);
    if (!scroll) {
      return new Promise((resolve) => {
        if (regex.length > 0) {
          timeout = setTimeout(async () => {
            dispatch({ type: types.REQUEST_SEARCH_RESULTS });
            const data = await getSearchResults(
              regex,
              params,
              currentPlaylist,
              offsetId._id
            );
            if (data.status === 200) {
              dispatch({
                type: scroll
                  ? types.SCROLL_SEARCH_RESULTS
                  : types.RECIEVE_SEARCH_RESULTS,
                results: data.data,
              });
            }
            resolve(data.status);
          }, 100);
        }
        resolve([]);
      });
    }
    if (scroll) {
      const findOffsetId = getState().search.results;
      const offset = findOffsetId[findOffsetId.length - 1];
      const data_1 = await getSearchResults(
        regex,
        params,
        currentPlaylist,
        offset._id
      );
      dispatch({
        type: types.SCROLL_SEARCH_RESULTS,
        results: data_1.data,
      });
    } else {
      dispatch({ type: types.CLEAR_SEARCH_RESULTS, results: [] });
    }
  };
}

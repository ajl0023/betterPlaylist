import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import {
  ADD_TRACK_REQUEST,
  ADD_TRACK_SUCCESS,
  DELETE_TRACK_REQUEST,
  DELETE_TRACK_SUCCESS,
  RECIEVE_PLAYLISTS,
  RECIEVE_PLAYLIST_TRACKS,
  RECIEVE_TRACKS,
  REQUEST_PLAYLISTS,
  REQUEST_PLAYLIST_TRACKS,
  REQUEST_TRACKS,
  GET_SINGLE_PLAYLIST,
} from "../types/types";
import {
  addTracksToPlaylistsCall,
  deleteFromPlaylist,
  getPlaylists,
  getPlayListTracks,
  fetchSinglePlaylist,
} from "./calls";
const requestPlaylists = () => {
  return (dispatch) => {
    dispatch({ type: REQUEST_PLAYLISTS });
    dispatch({ type: REQUEST_PLAYLIST_TRACKS });
  };
};
function deleteTrackRequest() {
  return {
    type: DELETE_TRACK_REQUEST,
  };
}
export const addTracksToPlaylists = (playlist, tracks) => (
  dispatch,
  getState
) => {
  dispatch({ type: ADD_TRACK_REQUEST });
  let obj = {};
  const allTracks = { ...getState().tracks.byIds };
  const tracksToAdd = tracks.map((track) => {
    const foundTracks = { ...allTracks[track.trackid] };
    foundTracks.uid = uuidv4();
    return foundTracks;
  });
  tracksToAdd.forEach((track) => {
    obj[track.uid] = track;
  });
  const trackIds = tracksToAdd.map((item) => {
    return item.uid;
  });
  const playlistsToChange = playlist.map((item) => {
    return item.playlistid;
  });
  let arr = [];
  let playlists;
  playlistsToChange.forEach((id) => {
    playlists = { ...getState().playlists.byIds[id] };
    playlists.tracks = [...playlists.tracks, ...tracksToAdd];
    arr.push(playlists);
  });
  const trackUris = tracks.map((track) => {
    return track.uri;
  });
  const promiseArr = new Promise((resolve) => {
    playlistsToChange.forEach((playlist) => {
      addTracksToPlaylistsCall(playlist, trackUris)
        .then((data) => {
          if (data.status === 200) {
            resolve(200);
          }
        })
        .then(() => {});
    });
  });
  return new Promise((resolve) => {
    promiseArr.then((status) => {
      if (status === 200) {
        dispatch({
          type: ADD_TRACK_SUCCESS,
          trackObjs: obj,
          playlists: playlistsToChange,
          tracksToAdd: trackIds,
        });
        resolve(status);
      }
    });
  });
};
export const deleteTrackFromPlaylists = (playlistTracks) => (
  dispatch,
  getState
) => {
  let allTracks = getState().tracks.byIds;
  let tracksArr = Object.keys(allTracks).map((id) => {
    return allTracks[id];
  });
  return new Promise((resolve) => {
    const playlistTracksCopy = [...playlistTracks];
    dispatch(deleteTrackRequest());
    let length = playlistTracksCopy.length;
    let arr = [];
    let obj = {};
    for (let i = 0; i < length; i++) {
      let idCheck = arr.findIndex((playlist) => {
        return playlist.id === playlistTracksCopy[i].playlistid;
      });
      if (idCheck < 0) {
        obj["id"] = playlistTracksCopy[i].playlistid;
        obj["playlist"] = playlistTracksCopy[i].playlist;
        obj["tracksToDelete"] = [playlistTracksCopy[i]];
        arr.push(obj);
        obj = {};
      } else {
        arr[idCheck]["tracksToDelete"].push(playlistTracksCopy[i]);
      }
    }
    let filteredTracks = tracksArr.filter((tracks) => {
      let find = playlistTracks.find((set) => {
        if (set.trackid === tracks.uid) {
          return set;
        }
      });
      if (!find) {
        return tracks;
      }
    });
    let filteredObj = {};
    filteredTracks.forEach((tracks) => {
      filteredObj[tracks.uid] = tracks;
    });
    if (arr.length > 0) {
      arr.forEach((playlist) => {
        deleteFromPlaylist(playlist)
          .then((data) => {
            resolve({
              status: data.status,
            });
          })
          .catch(() => {});
      });
    } else {
      resolve("Some tracks were not deleted.");
    }
    dispatch({
      type: DELETE_TRACK_SUCCESS,
      tracksArr,
      filteredTracks,
      filteredObj,
      items: [...playlistTracks],
    });
  });
};
export function getSinglePlaylist(id) {
  return (dispatch) => {
    fetchSinglePlaylist(id)
      .then((data) => {
        if (data.status === 200) {
          dispatch({ type: GET_SINGLE_PLAYLIST, data: data.data });
        }
      })
      .catch((err) => {});
  };
}
export function getTracksScroll(playlist, mainOffSet) {
  return (dispatch) => {
    dispatch({
      type: REQUEST_TRACKS,
    });
    return getPlayListTracks(playlist.id, mainOffSet).then((data) => {
      let tracks = {};
      data.data.items.forEach((track) => {
        tracks[track.uid] = track;
      });
      if (data.status === 200) {
        dispatch({
          type: RECIEVE_TRACKS,
          trackIds: data.data.items.map((tracks) => {
            return tracks.uid;
          }),
          tracks,
          page: data.data.page,
          playlist,
        });
      }
    });
  };
}
export function recievePlaylists() {
  return (dispatch, getState) => {
    dispatch(requestPlaylists());
    getPlaylists().then((data) => {
      let tracksArr = [];
      let length = data.data.playlists.length;
      let playlists = data.data.playlists;
      let tracksObj = {};
      let allTracksObj = {};
      let playlistObj = {};
      playlists.forEach((playlist) => {
        playlist.tracks = [];
        playlistObj[playlist.id] = playlist;
      });
      dispatch({
        byIds: playlistObj,
        type: RECIEVE_PLAYLISTS,
        allIds: Object.keys(playlistObj),
      });
      for (let i = 0; i < length; i++) {
        tracksArr.push(getPlayListTracks(playlists[i].id));
      }
      Promise.all(tracksArr).then((trackData) => {
        let playlistIds = [];
        let length = trackData.length;
        let toArr = {};
        let trackIds = [];
        let pageInfo = {};
        for (let i = 0; i < length; i++) {
          let itemLength = trackData[i].data.items.length;
          playlistIds.push(trackData[i].data.playlistId);
          pageInfo[trackData[i].data.playlistId] = trackData[i].data.page;
          for (let j = 0; j < itemLength; j++) {
            let track = trackData[i].data.items[j];
            trackIds.push(track.uid);
            allTracksObj[track.uid] = track;
            track["playlistid"] = trackData[i].data.playlistId;
            tracksObj[track.uid] = track;
            if (!toArr[trackData[i].data.playlistId]) {
              toArr[trackData[i].data.playlistId] = [track.uid];
            } else {
              toArr[trackData[i].data.playlistId] = [
                ...toArr[trackData[i].data.playlistId],
                track.uid,
              ];
            }
          }
        }
        dispatch({
          pageInfo,
          allTracksObj,
          trackIds: trackIds,
          tracks: toArr,
          playlists: playlistIds,
          type: RECIEVE_PLAYLIST_TRACKS,
          allIds: Object.keys(playlistObj),
        });
      });
    });
  };
}

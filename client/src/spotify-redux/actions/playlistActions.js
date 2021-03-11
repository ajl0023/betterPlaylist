import {
  RECIEVE_PLAYLISTS,
  REQUEST_PLAYLISTS,
  DELETE_TRACK_REQUEST,
  DELETE_TRACK_SUCCESS,
  ADD_TRACK_REQUEST,
  ADD_TRACK_SUCCESS,
  REQUEST_TRACKS,
  RECIEVE_TRACKS,
  RECIEVE_PLAYLIST_TRACKS,
  REQUEST_PLAYLIST_TRACKS,
} from "../types/types";
import { v4 as uuidv4 } from "uuid";

import axios from "axios";
import {
  addTracksToPlaylistsCall,
  deleteFromPlaylist,
  getPlaylists,
  getPlayListTracks,
} from "./calls";
const requestPlaylists = () => {
  return (dispatch, getState) => {
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
  let tempPromise = [];
  const promiseArr = new Promise((resolve, reject) => {
    playlistsToChange.forEach((playlist) => {
      addTracksToPlaylistsCall(playlist, trackUris)
        .then((data) => {
          if (data.status === 200) {
            resolve(200);
          }
        })
        .then((res) => {});
    });
  });
  return new Promise((resolve, reject) => {
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
  let allPlaylists = getState().playlists.byIds;

  let tracksArr = Object.keys(allTracks).map((id) => {
    return allTracks[id];
  });

  return new Promise((resolve, reject) => {
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
          .catch((err) => {});
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
export function selectAll() {
  return (dispatch, getState) => {};
}
export function getTracksScroll(playlist) {
  return (dispatch, getState) => {
    dispatch({
      type: REQUEST_TRACKS,
    });
    return getPlayListTracks(playlist.id, playlist.offset).then((data) => {
      let tracks = {};
      data.data.forEach((track) => {
        tracks[track.uid] = track;
      });
      if (data.status === 200) {
        dispatch({
          type: RECIEVE_TRACKS,
          trackIds: data.data.map((tracks) => {
            return tracks.uid;
          }),
          tracks,
          playlist,
        });
      }
    });
  };
}
export function recievePlaylists() {
  return (dispatch, getState) => {
    const getAllTracks = Object.keys(getState().tracks.byIds);

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
        for (let i = 0; i < length; i++) {
          let itemLength = trackData[i].data.items.length;
          playlistIds.push(trackData[i].data.playlistId);
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

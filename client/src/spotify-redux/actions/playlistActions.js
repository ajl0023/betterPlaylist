import {
  RECIEVE_PLAYLISTS,
  REQUEST_PLAYLISTS,
  DELETE_TRACK_REQUEST,
  DELETE_TRACK_SUCCESS,
  ADD_TRACK_REQUEST,
  ADD_TRACK_SUCCESS,
  REQUEST_TRACKS,
  RECIEVE_TRACKS,
} from "../types/types";
import { v4 as uuidv4 } from "uuid";

import axios from "axios";
import {
  addTracksToPlaylistsCall,
  deleteFromPlaylist,
  getPlaylists,
  getPlayListTracks,
} from "./calls";
function requestPlaylists() {
  return {
    type: REQUEST_PLAYLISTS,
  };
}
function deleteTrackRequest() {
  return {
    type: DELETE_TRACK_REQUEST,
  };
}
// export const addTracksToPlaylists = (playlists, tracks) => (
//   dispatch,
//   getState
// ) => {
//   console.log(playlists, tracks);
//   dispatch({
//     type: ADD_TRACK_REQUEST,
//   });
// };
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

  return new Promise((resolve, reject) => {
    playlistsToChange.forEach((playlist) => {
      addTracksToPlaylistsCall(playlist, trackUris).then((data) => {
        if (data.status === 200) {
          resolve(data.status);
          dispatch({
            type: ADD_TRACK_SUCCESS,
            trackObjs: obj,
            playlists: playlistsToChange,
            tracksToAdd: trackIds,
          });
        }
      });
    });
  });
};
export const deleteTrackFromPlaylists = (playlistTracks) => (
  dispatch,
  getState
) => {
  //
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
  });
  // return axios({
  //   url: ``,
  // });
};
export function selectAll() {
  return (dispatch, getState) => {
    
  };
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
      if (data) {
        const playlistObj = {};
        const playlists = data.data.playlists;
        let trackArr = [];
        let promiseArr = playlists.map((playlist) => {
          return getPlayListTracks(playlist.id).then((data) => {
            playlist["track_count"] = playlist.tracks.total;
            playlist["tracks"] = data.data.map((track) => {
              if (track.uid) {
                trackArr.push(track);
              }

              return track.uid;
            });
            playlist["offset"] = playlist.tracks.length;
            return {
              [playlist.id]: playlist,
            };
          });
        });

        Promise.all(promiseArr).then((values) => {
          const trackObj = {};
          trackArr.forEach((track) => {
            trackObj[track.uid] = track;
          });
          let obj = {};

          values.forEach((playlist) => {
            Object.assign(obj, playlist);
          });
          dispatch({
            tracks: trackObj,
            byIds: obj,
            type: RECIEVE_PLAYLISTS,
            allIds: Object.keys(obj),
          });
        });
      }
    });
  };
}

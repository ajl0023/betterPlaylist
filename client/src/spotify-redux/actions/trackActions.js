import {
  RECIEVE_PLAYLIST_TRACKS,
  RECIEVE_RECENT_TRACKS,
  RECIEVE_TOP_TRACKS,
  REQUEST_RECENT_TRACKS,
  REQUEST_TOP_TRACKS,
} from "../types/types";
import { getPlayListTracks, getRecentTracks, getTopTracks } from "./calls";

function requestTopTracks() {
  return {
    type: REQUEST_TOP_TRACKS,
  };
}
function requestRecentTracks() {
  return {
    type: REQUEST_RECENT_TRACKS,
  };
}
export function recieveTopTracks() {
  return (dispatch, getState) => {
    const getAllTracks = Object.keys(getState().tracks.byIds);
    const filtered = {};
    dispatch(requestTopTracks());

    getTopTracks().then((data) => {
      if (data) {
        const toptracks = data.data.items;

        const obj = {};
        toptracks.forEach((track) => {
          obj[track.uid] = track;
          if (!getAllTracks.includes(track.uid)) {
            filtered[track.uid] = track;
          }
        });

        dispatch({
          byIds: filtered,
          type: RECIEVE_TOP_TRACKS,
          top_tracks: obj,
          allIds: Object.keys(obj),
        });
      }
    });
  };
}
export function recieveRecentTracks() {
  return (dispatch, getState) => {
    const cursors = getState().tracks.cursor;
    dispatch(requestRecentTracks());
    const getAllTracks = Object.keys(getState().tracks.byIds);
    const filtered = {};

    getRecentTracks(cursors).then((data) => {
      if (data) {
        const recentTracks = data.data.items;

        const obj = {};
        recentTracks.forEach((track) => {
          obj[track.track.uid] = track.track;
          if (!getAllTracks.includes(track.track.uid)) {
            filtered[track.track.uid] = track.track;
          }
        });

        dispatch({
          byIds: filtered,
          cursors: data.data.cursors,
          type: RECIEVE_RECENT_TRACKS,
          recent_tracks: obj,
          allIds: Object.keys(obj),
        });
      }
    });
  };
}
export function getTracks(playlistid) {
  return async (dispatch) => {
    const obj = {};
    const tracks = await getPlayListTracks(playlistid);
    tracks.data.items.forEach((track) => {
      obj[track.uid] = track;
    });
    if (tracks.status === 200) {
      dispatch({
        trackIds: tracks.data.items.map((tracks) => {
          return tracks.uid;
        }),
        type: RECIEVE_PLAYLIST_TRACKS,
        tracks: obj,
        pageInfo: tracks.data.page,
        playlistid,
      });
    }
  };
}

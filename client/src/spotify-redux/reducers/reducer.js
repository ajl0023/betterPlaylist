import { combineReducers } from "redux";
import { Map } from "immutable";
import ObjectId from "bson-objectid";
import {
  REQUEST_TOP_TRACKS,
  RECIEVE_TOP_TRACKS,
  REQUEST_PLAYLISTS,
  RECIEVE_PLAYLISTS,
  RECIEVE_RECENT_TRACKS,
  REQUEST_RECENT_TRACKS,
  NAVBAR_LINK_CLICKED,
  LOGIN_REQUEST,
  ACCESS_TOKEN_RECIEVED,
  USER_INFO_SUCCESS,
  LOG_OUT,
  ADD_TRACK_REQUEST,
  ADD_TRACK_SUCCESS,
  RECIEVE_TRACKS,
  RECIEVE_PLAYLIST_TRACKS,
  REQUEST_TRACKS,
  DELETE_TRACK_SUCCESS,
  GET_SINGLE_PLAYLIST,
  RECIEVE_SEARCH_RESULTS,
  REQUEST_SEARCH_RESULTS,
  CLEAR_SEARCH_RESULTS,
  SCROLL_SEARCH_RESULTS,
  RECIEVE_ADDITIONAL_TRACKS,
  DATABASE_SYNC_ERROR,
  UPDATE_PLAYLIST_SUCCESS,
  UPDATE_PLAYLIST_REQUEST,
} from "../types/types";
import {} from "../actions/trackActions";
function addTracksTrack(state, action) {
  const tracks = {};
  for (let id in action.tracksToAdd) {
    for (let track of action.tracksToAdd[id]) {
      const copy = { ...track };
      copy["playlistid"] = id;
      tracks[track.uid] = copy;
    }
  }
  const stateCopy = { ...state };
  stateCopy.byIds = {
    ...stateCopy.byIds,
    ...tracks,
  };
  return stateCopy;
}
function deleteTrackFunc(state, action) {
  const newState = { ...state };
  for (let id of action.trackids) {
    delete state.byIds[id];
  }
  return newState;
}
export function tracks(
  state = {
    isFetching: false,
    err: null,
    status: "idle",
    top_tracks: {},
    recent_tracks: {},
    allIds: [],
    cursor: null,
    byIds: {},
    tracks: {},
    offset: null,
  },
  action
) {
  switch (action.type) {
    case DELETE_TRACK_SUCCESS:
      return deleteTrackFunc(state, action);
    case UPDATE_PLAYLIST_SUCCESS:
      const { tracks, idsToRemove } = action;
      const copy = { ...state };
      for (let track in copy.byIds) {
        if (idsToRemove.includes(track)) {
          delete copy.byIds[track];
        }
      }
      copy.byIds = {
        ...copy.byIds,
        ...tracks,
      };
      return copy;
    case GET_SINGLE_PLAYLIST:
      return Object.assign({}, state, {
        byIds: {
          ...state.byIds,
          ...action.tracks,
        },
        allIds: [...state.allIds, ...action.trackIds],
      });
    case RECIEVE_ADDITIONAL_TRACKS:
      return Object.assign({}, state, {
        byIds: {
          ...state.byIds,
          ...action.tracks,
        },
        allIds: [...state.allIds, ...action.trackids],
      });
    case RECIEVE_TRACKS:
      return Object.assign({}, state, {
        byIds: {
          ...state.byIds,
          ...action.tracks,
        },
      });
    case ADD_TRACK_SUCCESS:
      return addTracksTrack(state, action);
    case RECIEVE_PLAYLIST_TRACKS:
      return Object.assign({}, state, {
        allIds: [...action.trackIds],
        byIds: {
          ...state.byIds,
          ...action.tracks,
        },
      });
    case REQUEST_TOP_TRACKS:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case REQUEST_RECENT_TRACKS:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case RECIEVE_TOP_TRACKS:
      return Object.assign({}, state, {
        top_tracks: action.top_tracks,
        isFetching: false,
        byIds: { ...state.byIds, ...action.byIds },
      });
    case RECIEVE_RECENT_TRACKS:
      return Object.assign({}, state, {
        recent_tracks: { ...state.recent_tracks, ...action.recent_tracks },
        cursor: action.cursors,
        isFetching: false,
        byIds: { ...state.byIds, ...action.byIds },
      });
    default:
      return state;
  }
}
function addTracks(state, action) {
  const { playlists, trackids, tracksToAdd } = action;
  let obj = { ...state };
  for (let i of playlists) {
    const ids = tracksToAdd[i].map((track) => {
      return track.uid;
    });
    obj.byIds[i].tracks = [...obj.byIds[i].tracks, ...ids];
  }
  return obj;
}
function deleteTrackPlaylist(state, action) {
  let obj = { ...state };
  for (let item in action.apiData) {
    obj.byIds[item].tracks = obj.byIds[item].tracks.filter((id) => {
      const find = action.apiData[item].tracks.some((track) => {
        return track.trackid.toString() === id.toString();
      });
      if (!find) {
        return id;
      }
    });
  }
  return obj;
}
function recievePlaylistTracks(state, action) {
  const tracks = action.tracks;
  const pageInfo = action.pageInfo;
  state = {
    ...state,
    byIds: {
      ...state.byIds,
      [action.playlistid]: {
        ...state.byIds[action.playlistid],
        tracks: [...action.trackIds],
        page: {
          ...state.byIds[action.playlistid].page,
          ...pageInfo,
        },
      },
    },
  };
  return state;
}
export function playlists(
  state = {
    byIds: {},
    allIds: [],
    isFetching: false,
    isUpdating: false,
    err: null,
    status: "idle",
  },
  action
) {
  switch (action.type) {
    case DATABASE_SYNC_ERROR:
      return Object.assign({}, state, {
        err: "Click update to sync data from Spotify",
      });
    case UPDATE_PLAYLIST_REQUEST:
      return Object.assign({}, state, {
        isUpdating: true,
      });
    case UPDATE_PLAYLIST_SUCCESS:
      function update() {
        const playlists = action.playlists;
        const copy = { ...state };
        for (let playlist in playlists) {
          copy.byIds[playlist] = playlists[playlist];
        }
        copy.isUpdating = false;
        return copy;
      }
      return update();
    case DELETE_TRACK_SUCCESS:
      return deleteTrackPlaylist(state, action);
    case REQUEST_TRACKS:
      return Object.assign({}, state, {
        isFetching: true,
        status: "fetching",
      });
    case GET_SINGLE_PLAYLIST:
      return Object.assign({}, state, {
        byIds: {
          ...state.byIds,
          [action.data.id]: { ...action.data, offset: action.offset },
        },
        allIds: [...state.allIds, action.data.id],
      });
    case RECIEVE_ADDITIONAL_TRACKS:
      return Object.assign({}, state, {
        byIds: {
          ...state.byIds,
          [action.playlistid]: {
            ...state.byIds[action.playlistid],
            offset: action.offset,
            tracks: [
              ...state.byIds[action.playlistid].tracks,
              ...action.trackids,
            ],
          },
        },
      });
    case RECIEVE_TRACKS:
      return Object.assign({}, state, {
        status: "idle",
        byIds: {
          ...state.byIds,
          [action.playlist.id]: {
            ...state.byIds[action.playlist.id],
            offset:
              state.byIds[action.playlist.id].tracks.length +
              action.trackIds.length,
            page: {
              ...action.page,
            },
            tracks: [
              ...state.byIds[action.playlist.id].tracks,
              ...action.trackIds,
            ],
          },
        },
      });
    case ADD_TRACK_REQUEST:
      return {
        ...state,
      };
    case RECIEVE_PLAYLIST_TRACKS:
      return recievePlaylistTracks(state, action);
    case ADD_TRACK_SUCCESS:
      return addTracks(state, action);
    case REQUEST_PLAYLISTS:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case RECIEVE_PLAYLISTS:
      const copy = { ...state };
      for (let playlist in action.byIds) {
        copy.byIds = {
          ...copy.byIds,
          [playlist]: { ...action.byIds[playlist], ...state.byIds[playlist] },
        };
      }
      return copy;
    default:
      return state;
  }
}
function navbar(
  state = {
    searchBar: false,
  },
  action
) {
  switch (action.type) {
    case NAVBAR_LINK_CLICKED:
      return Object.assign({}, state, {
        searchBar: action.clearSearch,
      });
    default:
      return state;
  }
}
export function current_user(
  state = {
    access_token: localStorage.getItem("access_token"),
    loggedIn: false,
    isLoggingIn: false,
    userInfo: null,
  },
  action
) {
  switch (action.type) {
    case LOGIN_REQUEST:
      return Object.assign({}, state, {
        isLoggingIn: true,
        access_token: action.access_token,
      });
    case ACCESS_TOKEN_RECIEVED:
      return Object.assign({}, state, {
        access_token: action.access_token,
      });
    case LOG_OUT:
      return Object.assign({}, state, {
        access_token: null,
        loggedIn: false,
        isLoggingIn: false,
        userInfo: null,
      });
    case USER_INFO_SUCCESS:
      return Object.assign({}, state, {
        userInfo: action.user,
      });
    default:
      return state;
  }
}
function search(
  state = {
    fetching: false,
    category: "all",
    results: [],
    prevResults: null,
  },
  action
) {
  switch (action.type) {
    case DELETE_TRACK_SUCCESS:
      const filtered = state.results.filter((track) => {
        return !action.trackids.includes(track);
      });
      return Object.assign({}, state, {
        results: filtered,
      });
    case REQUEST_SEARCH_RESULTS:
      return Object.assign({}, state, {
        fetching: true,
      });
    case RECIEVE_SEARCH_RESULTS:
      return Object.assign({}, state, {
        fetching: false,
        results: [...action.results],
        prevResults: action.results,
      });
    case SCROLL_SEARCH_RESULTS:
      return Object.assign({}, state, {
        results: [...state.results, ...action.results],
        prevResults: action.results,
      });
    case CLEAR_SEARCH_RESULTS:
      return Object.assign({}, state, {
        results: [],
      });
    default:
      return state;
  }
}
const rootReducer = combineReducers({
  current_user,
  tracks,
  playlists,
  navbar,
  search,
});
export default rootReducer;

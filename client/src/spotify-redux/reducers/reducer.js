import { combineReducers } from "redux";
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
  REQUEST_TRACKS,
} from "../types/types";

import {} from "../actions/trackActions";
function addTracksTrack(state, action) {
  const stateCopy = { ...state };
  stateCopy.byIds = {
    ...stateCopy.byIds,
    ...action.trackObjs,
  };
  return stateCopy;
}
function tracks(
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
  },
  action
) {
  switch (action.type) {
    case RECIEVE_TRACKS:
      return Object.assign({}, state, {
        byIds: {
          ...state.byIds,
          ...action.tracks,
        },
      });
    case ADD_TRACK_SUCCESS:
      return addTracksTrack(state, action);
    case RECIEVE_PLAYLISTS:
      return Object.assign({}, state, {
        byIds: action.tracks,
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
  const { playlists, tracksToAdd } = action;

  let obj = { ...state };
  const allPlaylists = state.byIds;

  for (let i of playlists) {
    obj.byIds[i].tracks = [...obj.byIds[i].tracks, ...tracksToAdd];
    // return {
    //   ...state,
    //   byIds: {
    //     ...state.byIds,
    //     [i]: {
    //       ...state.byIds[i],
    //       tracks: {
    //         ...state.byIds[i].tracks,
    //         ...tracksToAdd,
    //       },
    //     },
    //   },
    // };
  }
  return obj;
}
function playlists(
  state = {
    byIds: {},
    allIds: [],
    isFetching: false,
    err: null,

    status: "idle",
  },
  action
) {
  switch (action.type) {
    case REQUEST_TRACKS:
      return Object.assign({}, state, {
        isFetching: true,
        status: "fetching",
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
    case ADD_TRACK_SUCCESS:
      return addTracks(state, action);
    case REQUEST_PLAYLISTS:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case RECIEVE_PLAYLISTS:
      return Object.assign({}, state, {
        byIds: action.byIds,
        allIds: action.allIds,
        isFetching: false,
      });
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
function current_user(
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
const rootReducer = combineReducers({
  current_user,
  tracks,
  playlists,
  navbar,
});

export default rootReducer;

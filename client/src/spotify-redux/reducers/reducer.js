import { combineReducers } from "redux";
import { Map } from "immutable";
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
function deleteTrackFunc(state, action) {
  return {
    ...state,
    byIds: {
      ...action.filteredObj,
    },
  };
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
    case DELETE_TRACK_SUCCESS:
      return deleteTrackFunc(state, action);
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
          ...action.allTracksObj,
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
  const { playlists, tracksToAdd } = action;
  let obj = { ...state };
  for (let i of playlists) {
    obj.byIds[i].tracks = [...obj.byIds[i].tracks, ...tracksToAdd];
  }
  return obj;
}
function deleteTrackPlaylist(state, action) {
  let obj = { ...state };
  for (let item of action.items) {
    obj.byIds[item.playlistid].tracks = obj.byIds[
      item.playlistid
    ].tracks.filter((id) => {
      if (id !== item.trackid) {
        return id;
      }
    });
  }
  return obj;
}
function recievePlaylistTracks(state, action) {
  const tracksObj = action.tracks;
  const pageInfo = action.pageInfo;
  for (let key in tracksObj) {
    state = {
      ...state,
      byIds: {
        ...state.byIds,
        [key]: {
          ...state.byIds[key],
          tracks: [...tracksObj[key]],
          page: {
            ...state.byIds[key].page,
            ...pageInfo[key],
          },
        },
      },
    };
  }
  return state;
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
          [action.data.id]: { ...action.data },
        },
        allIds: [...state.allIds, action.data.id],
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

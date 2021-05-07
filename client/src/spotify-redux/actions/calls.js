import axios from "axios";
import { useCallback } from "react";
axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem(
  "access_token"
)}`;
axios.interceptors.response.use(
  (config) => {
    return config;
  },
  async (err) => {
    if (err.response.config._retry !== false) {
      err.response.config._retry = true;
    }
    if (err.response.status === 401 && err.response.config._retry === true) {
      err.response.config._retry = false;
      const refreshedToken = await timedRefresh();
      localStorage.setItem("access_token", refreshedToken.data.access_token);
      err.response.config.headers.Authorization = `Bearer ${refreshedToken.data.access_token}`;
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${localStorage.getItem("access_token")}`;
      return axios(err.response.config);
    }
    return Promise.reject(err);
  }
);
const timedRefresh = () => {
  return axios
    .post("/api/refresh", {
      method: "POST",
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
    .then((data) => {
      if (data.data) {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${localStorage.getItem("access_token")}`;
      }
      return data;
    });
};
const logoutApi = () => {
  return axios({
    url: "/api/logout",
    method: "POST",
    withCredentials: true,
  });
};
const authorization = (decodedToken) => {
  return axios.post("/api/authorization", {
    method: "POST",
    withCredentials: true,
    code: decodedToken,
  });
};
const addTracksToPlaylistsCall = (obj, tracks, tracksFordb) => {
  return axios.post(`/api/playlists/track`, {
    method: "POST",
    withCredentials: true,
    sets: obj,
    tracks,
    tracksFordb,
  });
};
const fetchSinglePlaylist = (id, scroll, offset) => {
  return axios.get(
    `/api/single/playlists/${id}/${scroll === true ? `?offset=${offset}` : ""}`,
    {
      withCredentials: true,
    }
  );
};
const getUserInfo = (token) => {
  axios.defaults.headers.common["Authorization"] = `Bearer ${
    token || localStorage.getItem("access_token")
  }`;
  return axios.get("/api/user-info", {
    withCredentials: true,
  });
};
const getRecentTracks = (cursor) => {
  return axios.get(
    `/api/recently-played${cursor ? `?before=${cursor.before}` : ""}`,
    {
      method: "GET",
      withCredentials: true,
    }
  );
};
const getTopTracks = () => {
  return axios.get("/api/top-tracks", {
    method: "GET",
    withCredentials: true,
  });
};
const getTrack = (trackId) => {
  return axios({
    url: `/api/track/${trackId.id}`,
    method: "GET",
    withCredentials: true,
  });
};
const getPlaylists = () => {
  return axios.get(`/api/playlists`, { withCredentials: true });
};
const getPlayListTracks = (id, offset) => {
  return axios({
    url: `/api/playlists/${id}${offset ? `?offset=${offset}` : ""}`,
    method: "GET",
    withCredentials: true,
  });
};
const getSearchResults = (regex, params, playlistid, offset) => {
  return axios.get(
    `/api/playlist/search/?regex=${regex}${offset ? `&offset=${offset}` : ""}${
      params === false ? `&playlist=${playlistid}` : ""
    }`,
    {
      method: "GET",
      withCredentials: true,
    }
  );
};
const deleteFromPlaylist = (playlist, searchActive, playlistids, trackids) => {
  return axios.delete(`/api/playlists/track`, {
    data: {
      searchActive,
      playlistids,
      trackids,
      tracks: playlist,
    },
    withCredentials: true,
  });
};
const updatePlaylistApi = (playlists) => {
  return axios.put(`/api/playlists`, {
    withCredentials: true,
  });
};
const testF = (callback) => {
  return;
};
export {
  updatePlaylistApi,
  testF,
  getSearchResults,
  timedRefresh,
  fetchSinglePlaylist,
  deleteFromPlaylist,
  getUserInfo,
  logoutApi,
  authorization,
  getRecentTracks,
  getTopTracks,
  getPlayListTracks,
  getTrack,
  addTracksToPlaylistsCall,
  getPlaylists,
};

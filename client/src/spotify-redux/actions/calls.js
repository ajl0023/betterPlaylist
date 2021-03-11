import axios from "axios";

axios.interceptors.response.use(
  function (request) {
    return request;
  },
  function (err) {
    const originalRequest = err.config;

    if (
      (err.response.status === 401 || err.response.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      return axios({
        url: "/api/refresh",
        method: "POST",
        withCredentials: true,
      }).then((data) => {
        if (data.data) {
          localStorage.setItem("access_token", data.data.access_token);
          axios.defaults.headers.common["Authorization"] =
            "Bearer " + data.access_token;
          originalRequest.headers["Authorization"] =
            "Bearer " + data.data.access_token;
          return axios(originalRequest);
        }
      });
    } else {
      return err;
    }
  }
);
axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem(
  "access_token"
)}`;
const logoutApi = () => {
  return axios({
    url: "/api/logout",
    method: "POST",
    withCredentials: true,
  });
};
const authorization = (decodedToken) => {
  return axios({
    url: "/api/authorization",
    method: "POST",
    withCredentials: true,
    data: {
      code: decodedToken,
    },
  });
};
const addTracksToPlaylistsCall = (id, tracks) => {
  return axios({
    url: `/api/playlists/${id}/track`,
    method: "POST",
    withCredentials: true,
    data: {
      tracks: tracks,
    },
  });
};
const getUserInfo = () => {
  return axios({
    url: "/api/user-info",
    method: "GET",
    withCredentials: true,
  });
};
const getRecentTracks = (cursor) => {
  return axios({
    url: `/api/recently-played?${cursor ? `before=${cursor.before}` : ""}`,
    method: "GET",
  });
};
const getTopTracks = () => {
  return axios({
    url: "/api/top-tracks",
    method: "GET",
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
  return axios({
    url: `/api/playlists`,
    method: "GET",
  });
};
const getPlayListTracks = (id, offset) => {
  return axios({
    url: `/api/playlists/${id}?${offset ? `offset=${offset}` : ""}`,
    method: "GET",
    withCredentials: true,
  });
};

const deleteFromPlaylist = (playlist) => {
  return axios({
    url: `/api/playlists/${playlist.id}/track`,
    method: "DELETE",
    data: {
      playlist_id: playlist.id,
      tracks: playlist.tracksToDelete,
    },
    withCredentials: true,
  });
};
export {
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

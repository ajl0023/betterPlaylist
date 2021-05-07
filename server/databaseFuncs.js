const axios = require("axios");
const { ObjectID } = require("bson");
module.exports = {
  updateTracks: async (tracks, playlists, playlistdb, tracksdb) => {
    const deletedArr = [];
    const playlistsArr = [];
    let obj = {};
    for (const id of playlists) {
      if (!playlistsArr.includes(id)) {
        const deleted = await tracksdb.deleteMany({ playlistid: id });
        deletedArr.push(deleted);
        playlistsArr.push(id);
      }
    }
    return deletedArr;
  },
  getTotalTrackCount: async (token, tracksdb) => {
    const data = await axios({
      url: `https://api.spotify.com/v1/me/playlists`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    let count = 0;
    data.data.items.forEach((item) => {
      count += item.tracks.total;
    });
    const dbCount = await tracksdb.find({}).toArray();
  },
  updatePlaylist: async (playlists, token, playlistdb, tracksdb) => {
    const playlistsArr = [];
    const tracksToInsert = [];
    const playlistsToInsert = {};
    const getTracks = async (url, id) => {
      const data = await axios({
        url: url || `https://api.spotify.com/v1/playlists/${id}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      [...(!url ? data.data.tracks.items : data.data.items)].forEach(
        (item, i) => {
          item["position"] = i;
          item["snapshot_id"] = data.data.snapshot_id;
          item["playlistid"] = id;
        }
      );
      if (!url) {
        if (!playlistsToInsert[id]) {
          playlistsToInsert[id] = data.data;
        }
        tracksToInsert.push(data.data.tracks.items);
      } else {
        tracksToInsert.push(data.data.items);
      }
      if (!url && data.data.tracks.next) {
        await getTracks(data.data.tracks.next, id);
      } else if (url && data.data.next) {
        await getTracks(data.data.next, id);
      }
    };
    for (let playlist of playlists) {
      await getTracks(null, playlist);
      if (!playlistsArr.includes(playlist)) {
        playlistsArr.push(playlist);
      }
    }
    for (let tracks of tracksToInsert) {
      const inserted = await tracksdb.insertMany(tracks);
    }
    for (let playlist of playlists) {
      let newTracks = await tracksdb.find({ playlistid: playlist }).toArray();
      newTracks = newTracks.map((track) => {
        return track._id;
      });
      playlistdb.updateOne(
        { id: playlist },
        { $set: { tracksArr: newTracks, ...playlistsToInsert[playlist] } }
      );
    }
  },
  getTracksAllTracks: async (token, playlistdb, tracksdb) => {
    let playlists = await axios({
      url: `https://api.spotify.com/v1/me/playlists`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const playlistData = playlists.data.items;
    let playlistids = playlists.data.items.map((playlist) => {
      return playlist.id;
    });
    const trackData = [];
    async function checkforNext(id, url, snapshot) {
      const checkNext = await axios({
        url: url || `https://api.spotify.com/v1/playlists/${id}/tracks`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      checkNext.data["playlistid"] = id;
      checkNext.data["snapshot_id"] = snapshot;
      trackData.push(checkNext.data);
      if (checkNext.data.next) {
        checkforNext(id, checkNext.data.next, true);
      }
    }
    for (let i = 0; i < playlistids.length; i++) {
      await checkforNext(playlistids[i], null, playlistData[i].snapshot_id);
    }
    const tracklength = trackData.length;
    const playlistlength = playlistids.length;
    for (let i = 0; i < tracklength; i++) {
      if (trackData[i].items.length > 0) {
        for (let j = 0; j < trackData[i].items.length; j++) {
          trackData[i].items[j]["playlistid"] = trackData[i].playlistid;
          trackData[i].items[j]["snapshot_id"] = trackData[i].snapshot_id;
          trackData[i].items[j]["position"] = j;
        }
        await tracksdb.insertMany(trackData[i].items);
      }
    }
    for (let i = 0; i < playlistlength; i++) {
      const tracks = await tracksdb
        .find({ playlistid: playlistids[i] })
        .toArray();
      const trackids = tracks.map((track) => {
        return track._id;
      });
      playlistData[i]["tracksArr"] = trackids;
    }
    playlistdb.insertMany(playlistData);
  },
};

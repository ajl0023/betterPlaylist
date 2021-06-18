const MongoClient = require("mongodb").MongoClient;
let connection;
let client;
let tracksdb;
let playlistdb;
let db;
require("dotenv").config();
const url = process.env.MONGO_URI;

module.exports = {
  connect: async () => {
    connection = await MongoClient.connect(url, { useUnifiedTopology: true });
    return connection;
  },
  getTracksdb: function () {
    tracksdb = connection.db("spotify-playlists").collection("tracks");
    return tracksdb;
  },
  getPlaylistdb: function () {
    playlistdb = connection.db("spotify-playlists").collection("playlists");
    return playlistdb;
  },
  disconnect: async function () {
    await connection.close();
  },
};

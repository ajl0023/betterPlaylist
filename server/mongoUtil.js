const MongoClient = require("mongodb").MongoClient;
let connection;
let client;
let tracksdb;
let playlistdb;
let db;
const url =
  "mongodb+srv://a:a@cluster0.2e6a1.mongodb.net/spotify-playlists?retryWrites=true&w=majority";
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

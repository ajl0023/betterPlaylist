// const app = require("./index");const express = require("express");const app = express();const PORT = process.env.PORT || 5000;let db;let playlistdb;let tracksdb;const obj = {};const MongoClient = require("mongodb").MongoClient;app.listen(PORT, () => {  const uri =    "mongodb+srv://a:a@cluster0.2e6a1.mongodb.net/spotify-playlists?retryWrites=true&w=majority";  MongoClient.connect(uri, (err, database) => {    if (err) throw err;  });});

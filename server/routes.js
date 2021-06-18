const uuid = require("uuid").v4;
const axios = require("axios");
const path = require("path");
const { ObjectId } = require("mongodb");
const {
  getTracksAllTracks,
  updatePlaylist,
  updateTracks,
  getTotalTrackCount,
} = require("./databaseFuncs");
const playlistdb = require("./mongoUtil").getPlaylistdb();
const tracksdb = require("./mongoUtil").getTracksdb();
module.exports = function (app) {
  app.post("/api/logout", async (req, res) => {
    res.clearCookie("refresh_token");
    res.json("User has been logged out");
  });
  app.post("/api/authorization", (req, res) => {
    let code = req.body.code;
    let client_cred =
      "da42a01c50ef409f802caf63a98de4d4:a238c69e5ab949e888857072b8795f5c";
    client_cred = Buffer.from(client_cred).toString("base64");
    axios({
      url: "https://accounts.spotify.com/api/token",
      method: "POST",
      headers: {
        Authorization: `Basic ${client_cred}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      params: {
        grant_type: "authorization_code",
        code: code,
        redirect_uri:
          req.headers["x-forwarded-host"] === "localhost:3000"
            ? "http://localhost:3000"
            : "better-playlist.vercel.app",
      },
    })
      .then((data) => {
        res.cookie("refresh_token", data.data.refresh_token, {
          httpOnly: true,
          secure: true,
        });
        res.json(data.data);
      })
      .catch((err) => {
        res.status(err.response.status).json({
          err,
        });
      });
  });
  app.get("/api/user-info", (req, res) => {
    let authHeader = req.headers.authorization.split(" ");
    let authToken = authHeader[1];
    axios({
      url: "https://api.spotify.com/v1/me",
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((data) => {
        res.json(data.data);
      })
      .catch((err) => {
        res.status(err.response.status).json(err);
      });
  });
  app.get("/api/playlist/search/", async (req, res) => {
    const regex = new RegExp("^" + req.query.regex, "gi");
    const offset = req.query.offset;
    const track = tracksdb.find({ _id: ObjectId(req.query.offset) });
    const offsetTrack = await track.toArray();
    const agg = [
      {
        $sort: { "track.name": 1, _id: 1 },
      },
      {
        $match: {
          "track.name": {
            $regex: regex,
          },
        },
      },
      {
        $limit: 60,
      },
    ];
    if (req.query.playlist) {
      agg[1]["$match"] = {
        ...agg[1]["$match"],
        playlistid: req.query.playlist,
      };
    }
    if (offset) {
      agg[1]["$match"] = {
        _id: { $gt: ObjectId(offset) },
        ...agg[1]["$match"],
        "track.name": {
          $regex: regex,
          $gte: offsetTrack[0].track.name,
        },
      };
    }
    tracksdb
      .aggregate(agg)
      .toArray()
      .then((data) => {
        res.json(data);
      });
  });
  app.post("/api/refresh", (req, res) => {
    let client_cred =
      "da42a01c50ef409f802caf63a98de4d4:a238c69e5ab949e888857072b8795f5c";
    client_cred = Buffer.from(client_cred).toString("base64");
    axios({
      url: "https://accounts.spotify.com/api/token",
      method: "POST",
      headers: {
        Authorization: `Basic ${client_cred}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      params: {
        grant_type: "refresh_token",
        refresh_token: req.cookies.refresh_token,
      },
    })
      .then((data) => {
        res.json(data.data);
      })
      .catch((err) => {
        res.status(err.response.status).json({
          err,
        });
      });
  });
  app.get("/api/top-tracks", (req, res) => {
    let authHeader = req.headers.authorization.split(" ");
    let authToken = authHeader[1];
    axios({
      url: "https://api.spotify.com/v1/me/top/tracks?limit=50",
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((data) => {
        const copy = { ...data };
        copy.data.items.forEach((item) => {
          item["uid"] = uuid();
        });
        res.json(copy.data);
      })
      .catch((err) => {
        if (err.response) {
          res.status(err.response.status).json({
            err: err.response.status,
          });
        } else {
          res.status(500).json({
            err: err.response.status,
          });
        }
      });
  });
  app.get("/api/recently-played", (req, res) => {
    let authHeader = req.headers.authorization.split(" ");
    let authToken = authHeader[1];
    let before = req.query.before;
    axios({
      url: `https://api.spotify.com/v1/me/player/recently-played?limit=50${
        before ? `&before=${before}` : ""
      }`,
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((data) => {
        const copy = { ...data };
        copy.data.items.forEach((item) => {
          item.track["uid"] = uuid();
        });
        res.json(copy.data);
      })
      .catch((err) => {
        if (err.response) {
          res.status(err.response.status).json({
            err: err.response.status,
          });
        } else {
          res.status(500).json({
            err: err.response.status,
          });
        }
      });
  });
  app.get("/api/track/:id", (req, res) => {
    let authHeader = req.headers.authorization.split(" ");
    let authToken = authHeader[1];
    let trackId = req.params.id;
    axios({
      url: `https://api.spotify.com/v1/tracks/${trackId}`,
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((data) => {
        const copy = { ...data };
        copy.data.items.forEach((item) => {
          item["uid"] = uuid();
        });
        res.json(copy.data);
      })
      .catch((err) => {
        if (err.response) {
          res.status(err.response.status).json({
            err: err.response.status,
          });
        } else {
          res.status(500).json({
            err: err.response.status,
          });
        }
      });
  });
  app.get("/api/playlists", (req, res) => {
    let authHeader = req.headers.authorization.split(" ");
    let authToken = authHeader[1];
    axios({
      url: `https://api.spotify.com/v1/me/playlists`,
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((data) => {
        const copy = { ...data };
        copy.data.items.forEach((item) => {
          item["uid"] = uuid();
        });
        res.json({
          playlists: copy.data.items,
        });
      })
      .catch((err) => {
        if (err.response) {
          res.status(err.response.status).json({
            err: err.response.status,
          });
        } else {
          res.status(500).json({
            err: err.response.status,
          });
        }
      });
  });
  app.get("/api/single/playlists/:playlist_id", async (req, res) => {
    let authHeader = req.headers.authorization.split(" ");
    let authToken = authHeader[1];
    const promises = [];
    promises.push(playlistdb.findOne({ id: req.params.playlist_id }));
    const promisesNext = [];
    promises.push(
      tracksdb
        .find({
          playlistid: req.params.playlist_id,
          _id: req.query.offset
            ? { $gt: ObjectId(req.query.offset) }
            : ObjectId,
        })
        .limit(99)
        .toArray()
        .then((value) => {
          return { trackData: value };
        })
    );
    const result = await Promise.all(promises);
    const tracks = result.find((promise) => {
      return promise.trackData;
    });
    const lastId =
      tracks.trackData.length > 1
        ? tracks.trackData[tracks.trackData.length - 1]
        : [];
    const hasNext = await tracksdb
      .find({
        playlistid: req.params.playlist_id,
        _id: { $gt: ObjectId(lastId._id) },
      })
      .hasNext();
    res.json({
      playlist: result[0],
      offset: hasNext ? lastId._id : null,
      tracks: [...tracks.trackData],
    });
  });
  app.get("/api/playlists/:playlist_id", (req, res) => {
    let authHeader = req.headers.authorization.split(" ");
    let authToken = authHeader[1];
    let queryOffset = req.query.offset;
    axios({
      url: `https://api.spotify.com/v1/playlists/${
        req.params.playlist_id
      }/tracks?${queryOffset ? `offset=${queryOffset}` : ""}`,
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((data) => {
        let tracks = data.data.items;
        let flattened = tracks
          .map((track, i) => {
            track.track["uid"] = uuid();
            track.track["index"] = i;
            return track.track;
          })
          .filter((track) => {
            if (track.id !== null) {
              return track;
            }
          });
        res.json({
          items: flattened,
          page: {
            limit: data.data.limit,
            next: data.data.next,
            offset: data.data.offset,
            previous: data.data.previous,
            total: data.data.total,
          },
          playlistId: req.params.playlist_id,
        });
      })
      .catch((err) => {
        if (err.response) {
          res.status(err.response.status).json({
            err: err.response.status,
          });
        } else {
          res.status(500).json({
            err: err.response.status,
          });
        }
      });
  });
  app.delete("/api/playlists/track", async (req, res) => {
    let authHeader = req.headers.authorization.split(" ");
    let authToken = authHeader[1];
    let tracks = {};
    const promises = [];
    const trackbody = req.body.tracks;
    const playlistsToUpdate = req.body.playlistids;
    const tracksToUpdate = req.body.trackids;
    const positions = {};
    for (let track in req.body.tracks) {
      const objectids = req.body.tracks[track].tracks.map((set) => {
        return set.trackid;
      });
      const foundPlaylists = await playlistdb.find({ id: track }).toArray();
      const playlistTracks = foundPlaylists[0].tracksArr;
      const playlistTracksString = playlistTracks.map((id) => {
        return id.toString();
      });
      for (let id of objectids) {
        positions[id] = playlistTracksString.indexOf(id);
      }
      tracks[track] = req.body.tracks[track].tracks.map((track) => {
        return {
          uri: track.uri,
          positions: [positions[track.trackid]],
        };
      });
    }
    for (let set in tracks) {
      promises.push(
        axios
          .delete(`https://api.spotify.com/v1/playlists/${set}/tracks`, {
            data: {
              tracks: tracks[set],
            },
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          })
          .then((data) => {
            return {
              ...data.data,
              playlistid: set,
            };
          })
          .catch((err) => {
            throw err;
          })
      );
    }
    let data;
    try {
      data = await Promise.all(promises);
    } catch (error) {
      res.status(500).json({
        error: "database out of sync with spotify API",
      });
      return;
    }
    const trackObjectIds = tracksToUpdate.map((track) => {
      return ObjectId(track);
    });
    const promisesdb = [];
    const trackProm = tracksdb.deleteMany({ _id: { $in: trackObjectIds } });
    promisesdb.push(trackProm);
    for (let result of data) {
      const tracksToDel = req.body.tracks[result.playlistid].tracks.map(
        (item) => {
          return ObjectId(item.trackid);
        }
      );
      const playlistProm = playlistdb.updateOne(
        { id: result.playlistid },
        {
          $set: {
            snapshot_id: result.snapshot_id,
          },
          $pullAll: {
            tracksArr: tracksToDel,
          },
        }
      );
      promisesdb.push(playlistProm);
    }
    await Promise.all(promisesdb);
    res.status(200).json(data.data);
  });
  app.post("/api/playlists/track", async (req, res) => {
    let authHeader = req.headers.authorization.split(" ");
    let authToken = authHeader[1];
    let tracks = req.body.sets;
    const promises = [];
    const setsToInsert = req.body.tracksFordb;
    const trackSet = new Set(req.body.tracks);
    const trackids = req.body.tracks;
    const foundTracks = {};
    const tracksToInsert = [];
    const playlistTracks = {};
    const promisesdb = [];
    for (let id of trackSet) {
      const track = await tracksdb.findOne({ "track.id": id });
      foundTracks[track.track.id] = track;
    }
    for (let set in setsToInsert) {
      for (let track of setsToInsert[set]) {
        const foundTrack = { ...foundTracks[track.id] };
        foundTrack._id = ObjectId(track.uid);
        foundTrack["playlistid"] = set;
        tracksToInsert.push(foundTrack);
        const _id = ObjectId(foundTrack._id);
        if (!playlistTracks[set]) {
          playlistTracks[set] = [_id];
        } else {
          playlistTracks[set].push(_id);
        }
      }
      const uris = setsToInsert[set].map((item) => {
        return item.uri;
      });
      promises.push(
        axios({
          url: `https://api.spotify.com/v1/playlists/${set}/tracks`,
          method: "POST",
          data: {
            uris: uris,
          },
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        })
          .then((data) => {
            return {
              playlistid: set,
              ...data.data,
            };
          })
          .catch((err) => {
            throw err;
          })
      );
      const playlistInserted = playlistdb.updateOne(
        { id: set },
        {
          $push: {
            tracksArr: {
              $each: playlistTracks[set],
            },
          },
        }
      );
      promisesdb.push(playlistInserted);
    }
    let resolved;
    try {
      resolved = await Promise.all(promises);
    } catch (error) {
      res.status(500).json({
        error: "database out of sync with spotify API",
      });
      return;
    }
    const tracksInserted = tracksdb.insertMany(tracksToInsert);
    promisesdb.push(tracksInserted);
    for (let promise of resolved) {
      await playlistdb.updateOne(
        { id: promise.playlistid },
        {
          $set: {
            snapshot_id: promise.snapshot_id,
          },
        }
      );
    }
    await Promise.all(promisesdb);
    const snapshots = resolved.map((promise) => {
      return promise.data;
    });
    res.json(snapshots);
  });
  app.put("/api/playlists", async (req, res) => {
    let authHeader = req.headers.authorization.split(" ");
    let authToken = authHeader[1];
    const promises = [];
    const data = await axios.get(`https://api.spotify.com/v1/me/playlists`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const apiplaylists = data.data.items.reduce((obj, curr) => {
      obj[curr.id] = curr;
      return obj;
    }, {});
    const playlistsToUpdate = [];
    const tracksToInsert = [];
    const playlistToDelete = [];
    let newTracks = {};
    const allTracks = [];
    const newPlaylists = [];
    const dbPlaylists = await playlistdb.find({}).toArray();
    for (let playlist of dbPlaylists) {
      if (apiplaylists[playlist.id]) {
        if (playlist.snapshot_id !== apiplaylists[playlist.id].snapshot_id) {
          playlistsToUpdate.push(playlist.id);
        }
      } else {
        playlistToDelete.push(playlist.id);
      }
    }
    if (playlistsToUpdate.length === 0) {
      res.json({ updatedPlaylists: playlistsToUpdate });
      return;
    }
    const searchForTracks = async (id, url) => {
      const trackids = [];
      const request = await axios.get(
        url || `https://api.spotify.com/v1/playlists/${id}/tracks`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      tracksToInsert.push(
        ...request.data.items.map((track) => {
          const newId = new ObjectId();
          const trackCopy = { ...track };
          trackCopy["snapshot_id"] = apiplaylists[id].snapshot_id;
          trackCopy["playlistid"] = id;
          trackCopy["_id"] = newId;
          if (!newTracks[id]) {
            newTracks[id] = [newId];
          } else {
            newTracks[id].push(newId);
          }
          return trackCopy;
        })
      );
      if (request.data.next) {
        await searchForTracks(id, request.data.next);
      }
    };
    for (let playlist of playlistsToUpdate) {
      await searchForTracks(playlist);
      let getPlaylist;
      try {
        getPlaylist = await axios.get(
          `https://api.spotify.com/v1/playlists/${playlist}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        newPlaylists.push(getPlaylist.data);
        const newTrackIds = newTracks[playlist];
        promises.push(
          playlistdb.updateOne(
            { id: playlist },
            {
              $set: {
                ...apiplaylists[playlist],
                tracksArr: [...newTrackIds],
              },
            }
          )
        );
        newTracks = [];
        promises.push(tracksdb.deleteMany({ playlistid: playlist }));
      } catch (error) {}
    }
    await Promise.all(promises);
    await tracksdb.insertMany(tracksToInsert);
    res.json({ updatedPlaylists: playlistsToUpdate });
  });
  app.delete("/api/test1", async () => {});
  app.post("/api/test2", async (req, res) => {
    const authtoken = req.body.token;
    await tracksdb.deleteMany({});
    await playlistdb.deleteMany({});
    await getTracksAllTracks(authtoken, playlistdb, tracksdb);
    res.json("done");
  });
  app.post("/api/test3", (req) => {
    const authtoken = req.body.token;
    getTotalTrackCount(authtoken, tracksdb);
  });
  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
};

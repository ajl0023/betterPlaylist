const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const uuid = require("uuid").v4;
const axios = require("axios");
const app = express();
const fs = require("fs");
const PORT = process.env.PORT || 5000;
app.use(cookieParser());
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "./build")));

app.listen(PORT, () => {
  console.log("online");
});
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
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
      redirect_uri: "http://localhost:5000",
    },
  })
    .then((data) => {
      res.cookie("refresh_token", data.data.refresh_token, {
        httpOnly: false,

        // domain: ".heroku.com",
      });
      res.json(data.data);
    })
    .catch((err) => {
      console.log(err);
      res.status(err.response.status).json({
        err,
      });
    });
});
app.get("/api/user-info", (req, res) => {
  console.log(req);
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
app.post("/api/login", (req, res) => {
  const scopes = `user-read-private user-read-email playlist-read-private playlist-modify-private user-top-read user-read-recently-played playlist-modify-public`;
  // let authHeader = req.headers.authorization.split(" ");
  // let authToken = authHeader[1];
  // const url_object = new URL(window.location);
  // const token = url_object.search;
  // let tokenSplit = token.split("=");
  // let decodedToken = tokenSplit[1];

  res.redirect(
    `https://accounts.spotify.com/authorize?client_id=da42a01c50ef409f802caf63a98de4d4&response_type=code&redirect_uri=http://localhost:5000&scope=${encodeURIComponent(
      scopes
    )}&show_dialog=true`
  );

  res.json("2323");
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
      res.status(err.response.status).json({
        err,
      });
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
      console.log(err);
      res.status(err.response.status).json({
        err,
      });
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
      res.status(err.response.status).json(err);
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
      let playlists = data.data.items;
      const copy = { ...data };
      copy.data.items.forEach((item) => {
        item["uid"] = uuid();
      });
      res.json({
        playlists: copy.data.items,
      });
    })
    .catch((err) => {
      res.status(err.response.status).json({
        err,
      });
    });
});
app.get("/api/playlists/:playlist_id", (req, res) => {
  let authHeader = req.headers.authorization.split(" ");

  let authToken = authHeader[1];
  let queryOffset = req.query.offset;

  let trackId = req.params.id;
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

      res.json(flattened);
    })
    .catch((err) => {
      res.status(err.response.status).json({
        err,
      });
    });
});
app.delete("/api/playlists/:playlist_id/track", (req, res) => {
  let authHeader = req.headers.authorization.split(" ");
  let authToken = authHeader[1];
  let trackId = req.params.id;
  let tracks = req.body.tracks.map((track) => {
    return { uri: track.uri, positions: [track.index] };
  });
  axios({
    url: `https://api.spotify.com/v1/playlists/${req.body.playlist_id}/tracks`,
    method: "DELETE",
    data: {
      tracks: tracks,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  })
    .then((data) => {
      console.log(1);
      res.json(data.data);
    })
    .catch((err) => {
      console.log(err);
    });
});
app.post("/api/playlists/:playlist_id/track", (req, res) => {
  let authHeader = req.headers.authorization.split(" ");
  let authToken = authHeader[1];
  let playlistId = req.params.playlist_id;
  let tracks = req.body.tracks;

  axios({
    url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    method: "POST",
    data: {
      uris: tracks,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  })
    .then((data) => {
      res.json(data.data);
    })
    .catch((err) => {
      console.log(err);
    });
});
// app.get("*", function (req, res) {

//   res.sendFile(path.join(__dirname, "../spotify-profile/build", "index.html"));
// });
// const express = require("express");
// const path = require("path");
// const app = express();

// app.listen(9000);

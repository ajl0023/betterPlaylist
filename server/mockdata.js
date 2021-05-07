const { ObjectId } = require("mongodb");
module.exports = {
  testPlaylist: {
    collaborative: false,
    description: "",
    external_urls: {
      spotify: "https://open.spotify.com/playlist/2ghQtiGDsCWZrVEywFmEfl",
    },
    href: "https://api.spotify.com/v1/playlists/2ghQtiGDsCWZrVEywFmEfl",
    images: [
      {
        height: 640,
        url: "https://i.scdn.co/image/ab67616d0000b2735873b13405402326a42218e1",
        width: 640,
      },
    ],
    name: "23232323",
    owner: { display_name: "Austin Lee" },
    primary_color: null,
    public: false,
    snapshot_id: "MTg0LGIyYjdjM2NkNGYxMGM2MGYzNGRmM2JjMTQ5OGNhYjA2OGI0ZWExOWM=",
    tracks: {
      href:
        "https://api.spotify.com/v1/playlists/2ghQtiGDsCWZrVEywFmEfl/tracks",
      total: 49,
    },
    type: "playlist",
    uri: "spotify:playlist:2ghQtiGDsCWZrVEywFmEfl",
    tracksArr: [new ObjectId()],
  },
  getPlaylist: async (db, id) => {
    return db.findOne({ id: id });
  },
  getTracks: async (db, id) => {
    return db.findOne({ _id: ObjectId(id) });
  },
};

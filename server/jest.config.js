// module.exports = {
module.exports = {
  globals: {
    MONGO_URI:
      "mongodb+srv://a:a@cluster0.2e6a1.mongodb.net/spotify-playlists?retryWrites=true&w=majority",
  },
  preset: "@shelf/jest-mongodb",
  roots: ["tests"],
};

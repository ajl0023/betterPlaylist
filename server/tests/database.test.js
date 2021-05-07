const { MongoClient, ObjectId } = require("mongodb");
const request = require("supertest");
const axios = require("axios");
let client;
const testTracks = [];
const trackSets = [];
const testPlaylists = [];
let getPlaylistFunc;
let getTracksFunc;
let playlistColl;
let tracksColl;
jest.mock("axios");
const {
  connect,
  getTracksdb,
  getPlaylistdb,
  disconnect,
} = require("../mongoUtil");
const { getPlaylist, getTracks, testPlaylist } = require("../mockdata");
let app;
test("", () => {});
beforeAll(async () => {
  await connect();
  app = require("../index");
  tracksColl = getTracksdb();
  playlistColl = getPlaylistdb();
  getPlaylistFunc = getPlaylist;
  getTracksFunc = getTracks;
  const id = testPlaylist.id;
  for (let i = 0; i < 4; i++) {
    let trackids = [];
    for (let j = 0; j < 3; j++) {
      const newid = ObjectId();
      trackids.push(newid);
      testTracks.push({
        _id: newid,
        test: true,
        snapshot_id: `old_snapshot${i}`,
        playlistid: `test${i}`,
      });
    }
    const copy = {
      ...testPlaylist,
      snapshot_id: `old_snapshot${i}`,
      id: `test${i}`,
      test: true,
      tracksArr: trackids,
    };
    testPlaylists.push(copy);
  }
  await playlistColl.insertMany(testPlaylists);
  await tracksColl.insertMany(testTracks);
  axios.delete.mockImplementation((url) => {
    switch (url) {
      case "https://api.spotify.com/v1/playlists/test1/tracks":
        return Promise.resolve({
          status: 200,
          data: {
            snapshot_id: "new shapshot_id",
          },
        });
      default:
        break;
    }
  });
});
afterAll(async () => {
  await playlistColl.deleteMany({
    test: true,
  });
  await tracksColl.deleteMany({
    test: true,
  });
  await disconnect();
});
describe("tests for database functions", () => {
  test("should properly fetch a single playlist", async (done) => {
    const id = "test1";
    const response = await request(app)
      .get(`/api/single/playlists/${id}`)
      .set(`Authorization`, `Bearer token123`);
    expect(response.body.playlist).toHaveProperty("name");
    expect(response.body.tracks[0]).toHaveProperty("playlistid");
    done();
  });
  test("should delete a track from both playlist and tracks", async () => {
    const playlist = await getPlaylistFunc(playlistColl, "test1");
    const idToDelete = testPlaylists.find((track) => {
      return track.id === "test1";
    }).tracksArr[0];
    const track = await getTracksFunc(tracksColl, idToDelete);
    expect(track).toBeTruthy();
    expect(playlist.tracksArr.length).toBe(3);
    const currentReq = await request(app)
      .delete("/api/playlists/track")
      .send({
        trackids: [idToDelete],
        tracks: {
          ["test1"]: {
            tracks: [
              {
                trackid: idToDelete,
                playlistid: "test1",
                index: 0,
                uri: "",
              },
            ],
          },
        },
      })
      .set(`Authorization`, `Bearer token123`);
    const updatedPlaylist = await getPlaylistFunc(playlistColl, "test1");
    expect(updatedPlaylist.tracksArr.length).toBe(2);
    expect(updatedPlaylist.snapshot_id).toBe("new shapshot_id");
    const updatedTracks = await getTracksFunc(tracksColl, idToDelete._id);
    expect(updatedTracks).toBeFalsy();
  });
  test("sends proper error when spotify api error", async () => {
    axios.delete.mockImplementation((url) => {
      switch (url) {
        case "https://api.spotify.com/v1/playlists/test1/tracks":
          return Promise.reject({
            status: 500,
            data: {
              snapshot_id: "new shapshot_id",
            },
          });
        default:
          break;
      }
    });
    const idToDelete = testTracks.find((track) => {
      return track.playlistid === "test1";
    });
    const response = await request(app)
      .delete("/api/playlists/track")
      .send({
        trackids: [idToDelete._id],
        tracks: {
          ["test1"]: {
            tracks: [
              {
                trackid: idToDelete._id,
                playlistid: "test1",
                index: 0,
                uri: "",
              },
            ],
          },
        },
      })
      .set(`Authorization`, `Bearer token123`);
    expect(response.body).toEqual({
      error: "database out of sync with spotify API",
    });
  });
  test("playlists get properly updated", async () => {
    let newSnapshots = testPlaylists.map((playlist, i) => {
      const copy = { ...playlist };
      copy["snapshot_id"] = `new_snapshot_id_${i}`;
      return copy;
    });
    const updateUrls = [];
    const singlePlaylistsUrls = {};
    for (let i = 0; i < 4; i++) {
      updateUrls.push(
        `https://api.spotify.com/v1/playlists/${testPlaylists[i].id}/tracks`
      );
      singlePlaylistsUrls[
        `https://api.spotify.com/v1/playlists/${testPlaylists[i].id}`
      ] = Promise.resolve({
        status: 200,
        data: {
          tracks: {
            items: testTracks.filter((track) => {
              return track.playlistid === testPlaylists[i].id;
            }),
          },
          snapshot_id: "new shapshot_id",
        },
      });
    }
    axios.get.mockImplementation((url) => {
      switch (url) {
        case `https://api.spotify.com/v1/me/playlists`:
          return Promise.resolve({
            status: 200,
            data: {
              tracks: {
                items: [],
              },
              items: [...newSnapshots],
              snapshot_id: "new shapshot_id",
            },
          });
        default:
          break;
      }
      if (updateUrls.includes(url)) {
        return Promise.resolve({
          status: 200,
          data: {
            items: testTracks.filter((track) => {
              return track.playlistid === "test0";
            }),
            snapshot_id: "new shapshot_id",
          },
        });
      }
      return singlePlaylistsUrls[url];
    });
    const old_snapshots = await tracksColl
      .find({
        snapshot_id: "old_snapshot3",
      })
      .toArray();
    expect(old_snapshots.length).toBe(3);
    await request(app)
      .put("/api/playlists")
      .set(`Authorization`, `Bearer token123`);
    const new_snapshots = await tracksColl
      .find({
        snapshot_id: "new_snapshot_id_3",
      })
      .toArray();
    expect(new_snapshots.length).toBe(3);
    const updated = await tracksColl
      .find({
        snapshot_id: "old_snapshot3",
      })
      .toArray();
    expect(updated.length).toBe(0);
  });
});

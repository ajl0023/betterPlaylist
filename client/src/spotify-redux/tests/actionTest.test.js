import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import * as actions from "../actions/playlistActions";
import * as types from "../types/types";

import expect from "expect"; // You can use any testing library

import axios from "axios";
import rootReducer, { tracks } from "../reducers/reducer";
import { playlists } from "../reducers/reducer";
import { createStore } from "redux";
const middlewares = [thunk];
const store = createStore(rootReducer);
const mockStore = configureMockStore(middlewares);
jest.mock("axios");

const defaultPlaylists = (obj) => {
  return playlists(
    {
      byIds: {
        "2ghQtiGDsCWZrVEywFmEfl": {
          tracks: [
            "6081ebded5e0ba3ee0f82d38",
            "6081ebded5e0ba3ee0f82d3a",
            "6081ebded5e0ba3ee0f82d3b",
          ],
        },
        "5SiP1oxlUAGXYc2g1fz2LO": {
          tracks: [
            "6081ebded5e0ba3ee0f82d38",
            "6081ebded5e0ba3ee0f82d3a",
            "6081ebded5e0ba3ee0f82d3b",
          ],
        },
        "0mePRlnjYWGFKl9yutsDt0": {
          tracks: [
            "6081ebded5e0ba3ee0f82d38",
            "6081ebded5e0ba3ee0f82d3a",
            "6081ebded5e0ba3ee0f82d3b",
          ],
        },
      },
    },
    {}
  );
};
const defaultTracks = (obj) => {
  return tracks(
    {
      byIds: {
        "6081f5bdd0ea054c94c456f8": {},
        "6081f5bdd0ea054c94c456f9": {},
      },
    },
    {}
  );
};
test("should delete tracks from playlist", () => {
  expect(
    playlists(defaultPlaylists(), {
      type: types.DELETE_TRACK_SUCCESS,
      trackids: [
        "6081ebded5e0ba3ee0f82d38",
        "6081ebded5e0ba3ee0f82d3a",
        "6081ebded5e0ba3ee0f82d3b",
      ],
      playlistids: ["2ghQtiGDsCWZrVEywFmEfl"],
      apiData: {
        "2ghQtiGDsCWZrVEywFmEfl": {
          tracks: [
            {
              trackid: "6081ebded5e0ba3ee0f82d38",
              playlistid: "2ghQtiGDsCWZrVEywFmEfl",
              uri: "spotify:track:0ztHfh4CYFT1UmzTeHHIWL",
              index: 0,
            },
            {
              trackid: "6081ebded5e0ba3ee0f82d3a",
              playlistid: "2ghQtiGDsCWZrVEywFmEfl",
              uri: "spotify:track:0ztHfh4CYFT1UmzTeHHIWL",
              index: 1,
            },
            {
              trackid: "6081ebded5e0ba3ee0f82d3b",
              playlistid: "2ghQtiGDsCWZrVEywFmEfl",
              uri: "spotify:track:4PUWpNtDejQwwa80LjvxXl",
              index: 2,
            },
          ],
        },
      },
    })
  ).toEqual({
    ...defaultPlaylists(),
    byIds: {
      ...defaultPlaylists().byIds,
      "2ghQtiGDsCWZrVEywFmEfl": {
        tracks: [],
      },
    },
  });
});
test("should delete tracks from multiple playlists", () => {
  expect(
    playlists(defaultPlaylists(), {
      trackids: [
        "6081ebded5e0ba3ee0f82d38",
        "6081ebded5e0ba3ee0f82d3a",
        "6081ebded5e0ba3ee0f82d3b",
      ],
      playlistids: ["5SiP1oxlUAGXYc2g1fz2LO", "0mePRlnjYWGFKl9yutsDt0"],
      apiData: {
        "5SiP1oxlUAGXYc2g1fz2LO": {
          tracks: [
            {
              trackid: "6081ebded5e0ba3ee0f82d38",
              playlistid: "5SiP1oxlUAGXYc2g1fz2LO",
              uri: "spotify:track:6PdCNxJLyD7E3JHbzwK7Wp",
              index: 47,
            },
            {
              trackid: "6081ebded5e0ba3ee0f82d3a",
              playlistid: "5SiP1oxlUAGXYc2g1fz2LO",
              uri: "spotify:track:6PdCNxJLyD7E3JHbzwK7Wp",
              index: 46,
            },
            {
              trackid: "6081ebded5e0ba3ee0f82d3b",
              playlistid: "5SiP1oxlUAGXYc2g1fz2LO",
              uri: "spotify:track:6PdCNxJLyD7E3JHbzwK7Wp",
              index: 45,
            },
          ],
        },
        "0mePRlnjYWGFKl9yutsDt0": {
          tracks: [
            {
              trackid: "6081ebded5e0ba3ee0f82d38",
              playlistid: "0mePRlnjYWGFKl9yutsDt0",
              uri: "spotify:track:6PdCNxJLyD7E3JHbzwK7Wp",
              index: 8,
            },
            {
              trackid: "6081ebded5e0ba3ee0f82d3a",
              playlistid: "0mePRlnjYWGFKl9yutsDt0",
              uri: "spotify:track:6PdCNxJLyD7E3JHbzwK7Wp",
              index: 9,
            },
            {
              trackid: "6081ebded5e0ba3ee0f82d3b",
              playlistid: "0mePRlnjYWGFKl9yutsDt0",
              uri: "spotify:track:6PdCNxJLyD7E3JHbzwK7Wp",
              index: 7,
            },
          ],
        },
      },
      type: types.DELETE_TRACK_SUCCESS,
    })
  ).toEqual({
    ...defaultPlaylists(),
    byIds: {
      ...defaultPlaylists().byIds,
      "5SiP1oxlUAGXYc2g1fz2LO": {
        tracks: [],
      },
      "0mePRlnjYWGFKl9yutsDt0": {
        tracks: [],
      },
    },
  });
});
test("should delete tracks in tracks reducer", () => {
  expect(
    tracks(defaultTracks(), {
      trackids: ["6081f5bdd0ea054c94c456f8", "6081f5bdd0ea054c94c456f9"],
      playlistids: ["5SiP1oxlUAGXYc2g1fz2LO", "0mePRlnjYWGFKl9yutsDt0"],
      apiData: {},
      type: types.DELETE_TRACK_SUCCESS,
    })
  ).toEqual(tracks({ byIds: {} }, {}));
});
test("should add track to playlist", () => {
  expect(
    playlists(defaultPlaylists(), {
      playlists: ["2ghQtiGDsCWZrVEywFmEfl"],
      tracksToAdd: {
        "2ghQtiGDsCWZrVEywFmEfl": [
          { uid: "6081fa8261aab700acab6882" },
          { uid: "6081fa8261aab700acab6883" },
        ],
      },
      trackids: ["6081fa8261aab700acab6882", "6081fa8261aab700acab6883"],
      type: types.ADD_TRACK_SUCCESS,
    })
  ).toEqual({
    ...defaultPlaylists(),
    byIds: {
      ...defaultPlaylists().byIds,
      "2ghQtiGDsCWZrVEywFmEfl": {
        tracks: [
          ...defaultPlaylists().byIds["2ghQtiGDsCWZrVEywFmEfl"].tracks,
          "6081fa8261aab700acab6882",
          "6081fa8261aab700acab6883",
        ],
      },
    },
  });
});
test("should add tracks to multiple playlists", () => {
  expect(
    playlists(defaultPlaylists(), {
      playlists: [
        "2ghQtiGDsCWZrVEywFmEfl",
        "5SiP1oxlUAGXYc2g1fz2LO",
        "0mePRlnjYWGFKl9yutsDt0",
      ],
      tracksToAdd: {
        "2ghQtiGDsCWZrVEywFmEfl": [
          { uid: "6081fa8261aab700acab6882" },
          { uid: "6081fa8261aab700acab6883" },
        ],
        "5SiP1oxlUAGXYc2g1fz2LO": [
          { uid: "6081fa8261aab700acab6882" },
          { uid: "6081fa8261aab700acab6883" },
        ],
        "0mePRlnjYWGFKl9yutsDt0": [
          { uid: "6081fa8261aab700acab6882" },
          { uid: "6081fa8261aab700acab6883" },
        ],
      },
      trackids: ["6081fa8261aab700acab6882", "6081fa8261aab700acab6883"],
      type: types.ADD_TRACK_SUCCESS,
    })
  ).toEqual({
    ...defaultPlaylists(),
    byIds: {
      ...defaultPlaylists().byIds,
      "2ghQtiGDsCWZrVEywFmEfl": {
        tracks: [
          ...defaultPlaylists().byIds["2ghQtiGDsCWZrVEywFmEfl"].tracks,
          "6081fa8261aab700acab6882",
          "6081fa8261aab700acab6883",
        ],
      },
      "5SiP1oxlUAGXYc2g1fz2LO": {
        tracks: [
          ...defaultPlaylists().byIds["5SiP1oxlUAGXYc2g1fz2LO"].tracks,
          "6081fa8261aab700acab6882",
          "6081fa8261aab700acab6883",
        ],
      },
      "0mePRlnjYWGFKl9yutsDt0": {
        tracks: [
          ...defaultPlaylists().byIds["0mePRlnjYWGFKl9yutsDt0"].tracks,
          "6081fa8261aab700acab6882",
          "6081fa8261aab700acab6883",
        ],
      },
    },
  });
});

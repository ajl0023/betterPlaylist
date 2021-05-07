import "@testing-library/jest-dom";
import { waitFor } from "@testing-library/react";
import axios from "axios";
import { createMemoryHistory } from "history";
import React from "react";
import { Router } from "react-router-dom";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import App from "../../App";
import { reducerObj } from "../playlistWrapper/mockreducer";
import { render } from "../test-utils/test-utils";
const middlewares = [thunk];
const mockStore = configureStore(middlewares);
jest.mock("axios");
jest.mock("react-router-dom", () => {
  return {
    ...jest.requireActual("react-router-dom"),
    useParams: () => {
      return { id: "testplaylist1" };
    },
    useRouteMatch: () => {
      return { path: "/playlists" };
    },
  };
});
let renderedComponent;
let history;
const realLocation = window.location;
beforeEach(() => {
  axios.delete.mockResolvedValue({ status: 200, data: {} });
  axios.post.mockImplementation((url) => {
    switch (url) {
      case "/api/authorization":
        return Promise.resolve({
          status: 200,
          data: { access_token: "testToken" },
        });
      case "/api/refresh":
        return Promise.resolve({
          status: 200,
          data: { access_token: "RefreshedTestToken" },
        });
      default:
        return;
    }
  });
  axios.get.mockImplementation((url) => {
    switch (url) {
      case "/api/user-info":
        return Promise.resolve({
          status: 200,
          data: {
            display_name: "users display name",
            images: [{ height: null, url: "", width: null }],
          },
        });
      case "/api/recently-played":
        return Promise.resolve({
          data: {
            items: [
              { track: reducerObj.tracks.byIds["1f5bdd0ea054c94c456a5"] },
            ],
          },
        });
      case "/api/top-tracks":
        return Promise.resolve({
          data: { items: [reducerObj.tracks.byIds["1f5bdd0ea054c94c456a5"]] },
        });
      default:
        return;
    }
  });
  delete global.window.location;
  global.window = Object.create(window);
  global.window.location = new URL(
    "http://localhost:3000/?code=AQBhZlAdapFFUY6CBiTA44…vohd7hP1qv2zp4EpnJKxoFvzxdbGLIbhOd-DogDUgjFPiE2zA"
  );
  Storage.prototype.store = {};
  Storage.prototype.getItem = jest.fn((test) => {
    return Storage.prototype.store[test];
  });
  Storage.prototype.setItem = jest.fn((key, value) => {
    Storage.prototype.store[key] = value;
  });
});
afterEach(() => {
  window.location = realLocation;
});
describe("test for user auth process", () => {
  beforeEach(() => {
    history = createMemoryHistory();
    history.location.search = "";
    renderedComponent = render(
      <Router history={history}>
        <App key={5}></App>
      </Router>,
      { initialState: reducerObj }
    );
  });
  test("test if new user is sent through correct auth process", () => {
    expect(localStorage.getItem).toBeCalled();
    expect(history.location.search).toBe("");
    expect(localStorage.getItem("access_token")).toBe("testToken");
  });
  test("test if user was not provided a url code", () => {
    Storage.prototype.store = {};
    history = createMemoryHistory();
    history.location.search = "";
    renderedComponent = render(
      <Router history={history}>
        <App key={6}></App>
      </Router>,
      { initialState: reducerObj }
    );
    expect(Storage.prototype.getItem).toBeCalled();
    expect(history.location.search).toBe("");
    expect(localStorage.getItem("access_token")).toBeFalsy();
  });
  test("user info and their top/most recent tracks are shown", async () => {
    localStorage.setItem("access_token", "test_token");
    renderedComponent = render(
      <Router history={history}>
        <App key={7}></App>
      </Router>,
      { initialState: reducerObj }
    );
    const { getByText, getAllByText } = renderedComponent;
    await waitFor(() => {
      expect(getAllByText(/users display name/i)[0]).toBeInTheDocument();
      expect(getByText(/RECENTLY PLAYED/i)).toBeInTheDocument();
      expect(getByText(/YOUR TOP TRACKS/i)).toBeInTheDocument();
    });
  });
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {});
  it("users access_token gets refreshed every 30 mins", async () => {
    localStorage.setItem("access_token", "test_token");
    const userActions = require("../../spotify-redux/actions/userActions");
    const calls = require("../../spotify-redux/actions/calls");
    userActions.loginCheck = jest
      .fn()
      .mockImplementation(() => Promise.resolve("logged in"));
    calls.getUserInfo = jest.fn().mockImplementation(() =>
      Promise.resolve({
        status: 200,
        data: {
          display_name: "users display name",
          images: [{ height: null, url: "", width: null }],
        },
      })
    );
    calls.timedRefresh = jest.fn().mockImplementation(() =>
      Promise.resolve({
        status: 200,
        data: { access_token: "RefreshedTestToken2" },
      })
    );
    const { getAllByText } = render(
      <Router history={history}>
        <App key={90}></App>
      </Router>,
      { initialState: reducerObj }
    );
    expect(userActions.loginCheck).toHaveBeenCalled();
    await Promise.resolve();
    expect(calls.getUserInfo).toBeCalled();
    await Promise.resolve();
    expect(setTimeout).toBeCalled();
    expect(setTimeout).toHaveBeenLastCalledWith(
      expect.any(Function),
      1.8 * Math.pow(10, 6)
    );
    jest.advanceTimersByTime(1.9 * Math.pow(10, 6));
    await Promise.resolve();
    expect(localStorage.setItem).toBeCalled();
    expect(localStorage.getItem("access_token")).toBe("RefreshedTestToken2");
    await waitFor(() => {});
  });
});

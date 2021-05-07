import "@testing-library/jest-dom";
import { cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { createMemoryHistory } from "history";
import React from "react";
import { Provider } from "react-redux";
import { Router } from "react-router-dom";
import { act, create } from "react-test-renderer";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { ReactComponent as CheckIcon } from "../../images/check.svg";
import PlaylistTracks from "../../PlaylistTracks";
import PlaylistWrapper from "../../PlaylistWrapper";
import { render } from "../test-utils/test-utils";
import { reducerObj } from "./mockreducer";
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
let component;
let renderedComponent;
let componentRoot;
let history;
beforeEach(() => {
  axios.delete.mockResolvedValue({ status: 200, data: {} });
  axios.post.mockResolvedValue({ status: 200, data: {} });
  axios.get.mockImplementation((url) => {
    switch (url) {
      case "/api/playlist/search/?regex=a":
        return Promise.resolve({
          status: 200,
          data: [
            {
              playlistid: "testplaylist1",
              _id: "608a30325d933b44d87ba9bb",
              track: {
                name: "A Song test",
                album: {
                  ...reducerObj.tracks.byIds["1f5bdd0ea054c94c456a5"].album,
                },
                artists: [
                  ...reducerObj.tracks.byIds["1f5bdd0ea054c94c456a5"].artists,
                ],
              },
            },
          ],
        });
      case "/api/playlist/search/?regex=a&playlist=testplaylist1":
        return Promise.resolve({
          status: 200,
          data: [
            {
              playlistid: "testplaylist1",
              _id: "608a30325d933b44d87ba9bb",
              track: {
                name: "A Song test",
                album: {
                  ...reducerObj.tracks.byIds["1f5bdd0ea054c94c456a5"].album,
                },
                artists: [
                  ...reducerObj.tracks.byIds["1f5bdd0ea054c94c456a5"].artists,
                ],
              },
            },
          ],
        });
      case "/api/playlist/search/?regex=a&offset=608a30325d933b44d87ba9bb":
        return Promise.resolve({
          status: 200,
          data: [
            {
              playlistid: "testplaylist1",
              _id: "searchresultsscrollid",
              track: {
                name: "search results scroll song name",
                album: {
                  ...reducerObj.tracks.byIds["1f5bdd0ea054c94c456a5"].album,
                },
                artists: [
                  ...reducerObj.tracks.byIds["1f5bdd0ea054c94c456a5"].artists,
                ],
              },
            },
          ],
        });
      case "/api/single/playlists/testplaylist1/?offset=1f5bdd0ea054c94c456a5":
        return Promise.resolve({
          status: 200,
          data: {
            offset: "null",
            playlist: { id: "testplaylist1" },
            tracks: [
              {
                playlistid: "testplaylist1",
                track: {
                  ...reducerObj.tracks.byIds["1f5bdd0ea054c94c456a5"],
                  name: "scroll song name",
                },
                _id: "newscrolledTrackid",
              },
            ],
          },
        });
      default:
        return Promise.resolve({
          status: 200,
          data: {
            offset: "1f5bdd0ea054c94c456a5",
            playlist: { ...reducerObj.playlists.byIds.testplaylist1 },
            tracks: [
              {
                playlistid: "testplaylist1",
                _id: "1f5bdd0ea054c94c456a5",
                track: { ...reducerObj.tracks.byIds["1f5bdd0ea054c94c456a5"] },
              },
            ],
          },
        });
    }
  });
  history = createMemoryHistory();
  history.push("/playlists/testplaylist1");
  const store = mockStore(reducerObj);
  const mainComponent = (
    <Router history={history}>
      <Provider store={store}>
        <PlaylistWrapper></PlaylistWrapper>
      </Provider>
    </Router>
  );
  renderedComponent = render(
    <Router history={history}>
      <PlaylistWrapper key={5}></PlaylistWrapper>
    </Router>,
    { initialState: reducerObj }
  );
  component = create(mainComponent);
  componentRoot = component.root;
});
describe("ui changes for singleplaylist component", () => {
  afterEach(cleanup);
  test("correctly handles ui changes when track is selected", async () => {
    const playlistTracks = componentRoot.findAllByType(PlaylistTracks)[0];
    const checkIcon = playlistTracks.findAllByType(CheckIcon)[0];
    let tree;
    await act(async () => {
      await checkIcon.props.onClick();
    });
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  test("delete modal properly displays", async () => {
    const { getByTestId } = renderedComponent;
    const deleteModal = getByTestId(/delete modal test/);
    const deleteButton = getByTestId(/delete icon/, { exact: false });
    expect(deleteModal.className).toBe("inactive");
    fireEvent(deleteButton, new MouseEvent("click", { bubbles: true }));
  });
  test("track is deleted from the ui", async () => {
    const {
      getByText,
      queryByText,
      getByTestId,
      getByRole,
    } = renderedComponent;
    const checkIcon = getByTestId("1f5bdd0ea054c94c456a5");
    const confirmDelete = getByRole("button", { name: "Delete" });
    userEvent.click(checkIcon);
    await waitFor(() => {
      expect(getByText(/selected 1/i)).toBeInTheDocument();
    });
    expect(queryByText(/song name/i)).toBeInTheDocument();
    await waitFor(() => {
      userEvent.click(confirmDelete);
      expect(queryByText(/song name/i)).not.toBeInTheDocument();
    });
  });
  test("track is added into the ui", async () => {
    const { queryAllByText, getByTestId, getByRole } = renderedComponent;
    const checkIcon = getByTestId("1f5bdd0ea054c94c456a5");
    const addTracksButton = getByRole("button", { name: "Add" });
    act(() => {
      userEvent.click(checkIcon);
    });
    act(() => {
      userEvent.click(getByTestId("addModaltestplaylist1"));
    });
    expect(queryAllByText(/song name/i).length).toBe(1);
    userEvent.click(addTracksButton);
    await waitFor(() => {
      expect(queryAllByText(/song name/i).length).toBe(2);
    });
  });
});
describe("tests for search results", () => {
  test("search results show for all playlists", async () => {
    history.push("/playlists");
    const { queryByText, getByLabelText } = renderedComponent;
    const calls = require("../../spotify-redux/actions/calls");
    calls.testF = jest.fn();
    jest.useFakeTimers();
    const input = getByLabelText("search-bar");
    act(() => {
      fireEvent.change(input, { target: { value: "a" } });
      jest.advanceTimersByTime(300);
    });
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);
    await waitFor(async () => {
      expect(queryByText(/A Song test/i)).toBeInTheDocument();
      expect(queryByText(/song name/i)).not.toBeInTheDocument();
    });
  });
  test("search results show for only one playlist", async () => {
    history.push("/playlists/testplaylist1");
    const { queryByText, getByLabelText } = renderedComponent;
    jest.useFakeTimers();
    const input = getByLabelText("search-bar");
    expect(queryByText(/song name/i)).toBeInTheDocument();
    act(() => {
      fireEvent.change(input, { target: { value: "a" } });
      jest.advanceTimersByTime(300);
    });
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);
    await waitFor(async () => {
      expect(queryByText(/A Song test/i)).toBeInTheDocument();
      expect(queryByText(/song name/i)).not.toBeInTheDocument();
    });
  });
});
describe("data is fetched when user is scrolled to bottom", () => {
  test("data is fetched on scroll when user is on a single playlist", async () => {
    const { getByText, getByTestId } = renderedComponent;
    const scrollContainer = getByTestId("scroll-container");
    Object.defineProperty(scrollContainer, "clientHeight", {
      configurable: true,
      value: 500,
    });
    Object.defineProperty(scrollContainer, "scrollHeight", {
      configurable: true,
      value: 680,
    });
    fireEvent.scroll(scrollContainer, { target: { scrollTop: 200 } });
    await Promise.resolve();
    expect(getByText(/scroll song name/i)).toBeInTheDocument();
  });
  test("data is fetched on scroll when user is on search results", async () => {
    const {
      getByText,
      getByTestId,
      findByText,
      getByLabelText,
    } = renderedComponent;
    history.push("/playlists");
    const scrollContainer = getByTestId("scroll-container");
    const input = getByLabelText("search-bar");
    jest.useFakeTimers();
    act(() => {
      fireEvent.change(input, { target: { value: "a" } });
      jest.advanceTimersByTime(300);
    });
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);
    expect(await findByText(/A Song test/i)).toBeInTheDocument();
    Object.defineProperty(scrollContainer, "clientHeight", {
      configurable: true,
      value: 500,
    });
    Object.defineProperty(scrollContainer, "scrollHeight", {
      configurable: true,
      value: 680,
    });
    fireEvent.scroll(scrollContainer, { target: { scrollTop: 200 } });
    await Promise.resolve();
    expect(getByText(/search results scroll song name/i)).toBeInTheDocument();
  });
});

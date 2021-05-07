import React from "react";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";

import { render as rtlRender } from "@testing-library/react";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import thunkMiddleware from "redux-thunk";

import reducer from "../../spotify-redux/reducers/reducer";

function render(
  ui,
  {
    initialState,
    store = createStore(
      reducer,
      initialState,
      applyMiddleware(thunkMiddleware)
    ),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    const history = createMemoryHistory();
    history.push("/playlists/testplaylist1");
    return <Provider store={store}>{children}</Provider>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from "@testing-library/react";
// override render method
export { render };

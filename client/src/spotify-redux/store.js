import { createStore, applyMiddleware } from "redux";
import rootReducer from "./reducers/reducer";
import { composeWithDevTools } from "redux-devtools-extension";
import thunkMiddleware from "redux-thunk";
export default function configureStore() {
  const composeEnhancers = composeWithDevTools({ trace: true });
  return createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(thunkMiddleware))
  );
}

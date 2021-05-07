import {
  ACCESS_TOKEN_RECIEVED,
  LOG_OUT,
  USER_INFO_SUCCESS,
} from "../types/types";
import { authorization, getUserInfo, logoutApi, timedRefresh } from "./calls";
export function loginCheck() {
  return new Promise(function (resolve, reject) {
    let check = localStorage.getItem("access_token");
    if (check) {
      resolve("logged In");
    } else {
      reject("not logged In");
    }
  });
}
export const logout = () => (dispatch, getState) => {
  localStorage.removeItem("access_token");
  return new Promise(function (resolve, reject) {
    logoutApi()
      .then((data) => {
        if (data.status === 200) {
          dispatch({ type: LOG_OUT });
          window.location.reload();
          resolve(data.status);
        }
      })
      .catch();
  });
};
export const getAccessToken = (code) => (dispatch, getState) => {
  return authorization(code)
    .then((data) => {
      if (data.status === 200) {
        dispatch({
          access_token: data.data.access_token,
          type: ACCESS_TOKEN_RECIEVED,
        });
        localStorage.setItem("access_token", data.data.access_token);
        return data.data.access_token;
      }
    })
    .catch((err) => {
      return err;
    });
};
let timeout;
export const getUserInfoAction = () => {
  return (dispatch, getState) => {
    getUserInfo()
      .then((data) => {
        if (data.status === 200) {
          dispatch({ type: USER_INFO_SUCCESS, user: data.data });
          dispatch(refreshTime());
        }
      })
      .catch(() => {});
  };
};
let interval;
export const refreshTime = () => {
  clearTimeout(interval);
  return async (dispatch, getState) => {
    interval = setTimeout(async () => {
      try {
        const data = await timedRefresh();
        localStorage.setItem("access_token", data.data.access_token);
      } catch (err) {
        clearTimeout(interval);
        dispatch(logout());
      }
    }, 1.8 * Math.pow(10, 6));
  };
};

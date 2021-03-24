import {
  ACCESS_TOKEN_RECIEVED,
  LOG_OUT,
  USER_INFO_REQUEST,
  USER_INFO_SUCCESS,
} from "../types/types";
import { authorization, getUserInfo, logoutApi } from "./calls";

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
    logoutApi().then((data) => {
      if (data.status === 200) {
        dispatch({
          type: LOG_OUT,
        });
        resolve(data.status);
      }
    });
  });
};
export const getAccessToken = (code) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    authorization(code)
      .then((data) => {
        if (data) {
          dispatch({
            access_token: data.data.access_token,
            type: ACCESS_TOKEN_RECIEVED,
          });
          localStorage.setItem("access_token", data.data.access_token);
          resolve("");
        }
      })
      .catch((err) => {
        return err;
      });
  });
};
export function getUserInfoAction() {
  return (dispatch, getState) => {
    getUserInfo().then((data) => {
      if (data.status === 200) {
        dispatch({
          type: USER_INFO_SUCCESS,
          user: data.data,
        });
      }
    });
  };
}

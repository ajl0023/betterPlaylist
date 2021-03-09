import {
  RECIEVE_TOP_TRACKS,
  REQUEST_TOP_TRACKS,
  RECIEVE_RECENT_TRACKS,
  REQUEST_RECENT_TRACKS,
  USER_INFO_REQUEST,
  LOGIN_REQUEST,
  ACCESS_TOKEN_RECIEVED,
  USER_INFO_SUCCESS,
  LOG_OUT,
} from "../types/types";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import {
  authorization,
  getRecentTracks,
  getTopTracks,
  getUserInfo,
  logoutApi,
} from "./calls";

function requestUserInfo() {
  return {
    type: USER_INFO_REQUEST,
  };
}
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
   
        localStorage.setItem("access_token", 123);
      });
  });

  // if (!localStorage.getItem("token")) {
  //   return (dispatch, getState) => {
  //     let checkAccessToken = getState().current_user.access_token;
  //     if (checkAccessToken) {
  //       dispatch({
  //         access_token: localStorage.getItem("token"),
  //         type: LOGIN_REQUEST,
  //       });
  //       authorization(code).then((data) => {
  //         if (data) {
  //           dispatch({
  //             access_token: data.data.access_token,
  //             type: ACCESS_TOKEN_RECIEVED,
  //           });
  //           localStorage.setItem("token", data.data.access_token);
  //         }
  //       });
  //     }
  //   };
  // } else {
  //   return { type: "logged in" };
  // }
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

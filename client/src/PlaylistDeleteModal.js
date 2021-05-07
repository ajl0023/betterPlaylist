import React from "react";
import { useSelector } from "react-redux";
import style from "./styles/playlistOptionsModal.module.scss";
const PlaylistOptionsModal = (props) => {
  const error = useSelector((state) => {
    return state.playlists.err;
  });
  const handleDelete = () => {
    props.handleDelete();
  };
  const closeModal = () => {
    props.closeModal();
  };
  return (
    <div
      data-testid="delete modal test"
      className={style[props.showModal ? "container" : "inactive"]}
    >
      <div onClick={props.closeModal} className={style["container-mask"]}></div>
      <div className={style["modal-container"]}>
        <div className={style["header-container"]}>
          <div
            onClick={props.closeModal}
            className={style["cancel-icon-container"]}
          >
            <span className={style["main-trigger-icon-container"]}>
              <i className={style["main-trigger-icon"]}></i>
            </span>
          </div>
        </div>
        <p>Are you sure you want to delete these tracks?</p>
        <div className={style["button-container"]}>
          <button onClick={closeModal} className={style["cancel-button"]}>
            Cancel
          </button>
          <button
            role="button"
            name="delete-button"
            onClick={handleDelete}
            className={style["delete-button"]}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
export default PlaylistOptionsModal;

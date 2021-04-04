import React from "react";
import style from "./styles/playlistOptionsModal.module.scss";
const PlaylistOptionsModal = (props) => {
  const handleDelete = () => {
    props.handleDelete();
  };
  const closeModal = () => {
    props.closeModal();
  };
  return (
    <div className={style[props.showModal ? "container" : "inactive"]}>
      <div onClick={props.closeModal} className={style["container-mask"]}></div>
      <div className={style["modal-container"]}>
        <div className={style["header-container"]}>
          <div
            onClick={props.closeModal}
            className={style["cancel-icon-container"]}
          >
            <span className={style["main-trigger-icon-container"]}>
              <i className={style["main-trigger-icon"]}></i>
            </span>{" "}
          </div>
        </div>
        <p>Are you sure you want to delete these tracks?</p>
        <div className={style["button-container"]}>
          <button onClick={closeModal} className={style["cancel-button"]}>
            Cancel
          </button>
          <button onClick={handleDelete} className={style["delete-button"]}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
export default React.memo(PlaylistOptionsModal, (prev, next) => {
  if (prev.showModal === next.showModal) {
    return true;
  } else if (prev.checkAll !== next.checkAll) {
    return true;
  }
});

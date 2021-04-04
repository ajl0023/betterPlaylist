import React, { useState } from "react";
import { ReactComponent as CheckIcon } from "./images/check.svg";
import { ReactComponent as CheckIconPlaceH } from "./images/checkIconPlaceH.svg";
import style from "./styles/playlistAddModal.module.scss";
const PlaylistAddModal = (props) => {
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  let filteredPlaylists = props.playlist;
  const handlePlaylistSelect = (id) => {
    const selected = [...selectedPlaylists];
    let obj = {};
    obj["playlistid"] = id;
    const findId = selected.find((obj) => {
      return obj.playlistid === id;
    });
    if (!findId) {
      selected.push(obj);
    } else {
      let index = selected.findIndex((obj) => {
        return obj.playlistid === id;
      });
      selected.splice(index, 1);
    }
    setSelectedPlaylists(selected);
  };
  const handleAdd = () => {
    props.handleAdd(selectedPlaylists);
  };
  return (
    <div className={style[props.showModal ? "" : "inactive"]}>
      <div onClick={props.closeModal} className={style["container-mask"]}></div>
      <div className={style[props.showModal ? "container" : "inactive"]}>
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
          <p className={style["modal-title"]}>Add to playlists</p>
          <div className={style["playlist-container"]}>
            {filteredPlaylists.map((playlist, i) => {
              return (
                <div
                  key={playlist.id}
                  className={style["playlist-item-container"]}
                >
                  <div className={style["playlist-item"]}>
                    <div className={style["check-index-container"]}>
                      <p
                        className={
                          style[
                            selectedPlaylists.length > 0
                              ? "inactive"
                              : "playlist-count"
                          ]
                        }
                      >
                        {i + 1}
                      </p>
                      <CheckIconPlaceH
                        key={playlist.id}
                        style={{
                          display:
                            selectedPlaylists.length > 0 ? "flex" : "none",
                        }}
                        className={style["check-icon-place"]}
                      />
                      <CheckIcon
                        style={{
                          display: selectedPlaylists.find((obj) => {
                            return obj.playlistid === playlist.id;
                          })
                            ? "flex"
                            : "none",
                          fill: selectedPlaylists.find((obj) => {
                            return obj.playlistid === playlist.id;
                          })
                            ? "#1db954"
                            : "white",
                        }}
                        onClick={() => handlePlaylistSelect(playlist.id)}
                        className={style["check-icon"]}
                      />
                    </div>
                    <p className={style["playlist-title"]}>{playlist.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={style["button-container"]}>
            <button
              onClick={props.closeModal}
              className={style["cancel-button"]}
            >
              Cancel
            </button>
            <button
              onClick={() => handleAdd()}
              className={style["delete-button"]}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default React.memo(PlaylistAddModal, (prev, next) => {
  return prev.showModal === next.showModal;
});

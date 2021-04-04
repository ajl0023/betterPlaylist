import PlaylistWrapper from "./PlaylistWrapper";
export const handleCheckSearch = (
  uid,
  playlistid,
  setSelected,
  searchArr,
  selectedAllIds,
  setSelectedAllIds,
  getPlaylists,
  setSearchArr
) => {
  setSelected((prev) => {
    let searchArrCopy = [...searchArr];
    let selectedCopy = [...prev];
    let selectedAllIdsCopy = [...selectedAllIds];
    let findTrack = selectedCopy.find((item) => {
      return item.trackid === uid;
    });
    let length = searchArrCopy.length;
    if (selectedAllIds.includes("search")) {
      let index = selectedAllIdsCopy.indexOf("search");
      selectedAllIdsCopy.splice(index, 1);
      setSelectedAllIds(selectedAllIdsCopy);
    }
    const indexFromPlaylist = getPlaylists[playlistid].tracks.indexOf(uid);
    for (let i = 0; i < length; i++) {
      if (searchArrCopy[i].track.uid === uid && !findTrack) {
        selectedCopy.push({
          trackid: searchArrCopy[i].track.uid,
          playlistid: searchArrCopy[i].playlist.id,
          uri: searchArrCopy[i].track.uri,
          index: indexFromPlaylist,
          origin: "search",
        });
        let obj = { ...searchArrCopy[i] };
        searchArrCopy[i] = obj;
        let checkAllFiltered = searchArrCopy.filter((track) => {
          let findId = selectedCopy.find((item) => {
            return item.trackid === track.track.uid;
          });
          if (!findId) {
            return track;
          }
        });
        if (
          checkAllFiltered.length === 0 &&
          !selectedAllIdsCopy.includes("search")
        ) {
          selectedAllIdsCopy.push("search");
        }
      } else if (searchArrCopy[i].track.uid === uid && findTrack) {
        selectedCopy = selectedCopy.filter((item) => {
          return item.trackid !== searchArrCopy[i].track.uid;
        });
      }
      setSelectedAllIds(selectedAllIdsCopy);
      setSearchArr(searchArrCopy);
    }
    return selectedCopy;
  });
};
export const handleCheckSelected = (
  trackid,
  playlistid,
  uri,
  allTracks,
  index,
  setSelected,
  selectedAllIds
) => {
  setSelected((prev) => {
    let selectedArr = [...prev];
    let selectedAllIdsCopy = [...selectedAllIds];
    let obj = {};
    obj["trackid"] = trackid;
    obj["playlistid"] = playlistid;
    obj["uri"] = uri;
    obj["index"] = index;
    const findId = selectedArr.find((obj) => {
      return obj.trackid === trackid;
    });
    const prevCopy = [...prev];
    if (!findId) {
      prevCopy.push(obj);
      let getTracks = allTracks;
      let checkAllFiltered = getTracks.filter((track) => {
        let findId = prevCopy.find((item) => {
          return item.trackid === track.track.uid;
        });
        if (!findId) {
          return track;
        }
      });
      if (checkAllFiltered.length === 0) {
        selectedAllIdsCopy.push(playlistid);
      }
    } else {
      let index = prevCopy.findIndex((obj) => {
        return obj.trackid === trackid;
      });
      if (selectedAllIdsCopy.includes(playlistid)) {
        let playlistIndex = selectedAllIdsCopy.indexOf(playlistid);
        selectedAllIdsCopy.splice(playlistIndex, 1);
      }
      prevCopy.splice(index, 1);
    }
    return prevCopy;
  });
};
export const handleChange = (
  e,
  setSearchText,
  setSelected,
  location,
  getPlaylistsArr,
  currentPlaylist,
  getAllTracks,
  uuidv4,
  setSearchArr,
  setFilteredSearch,
  getPlaylists
) => {
  let tempArr = [];
  setSearchText("");
  setSelected([]);
  let arrToSearch;
  let text = e.target.value.trim();
  const whitespace = /\s/g;
  let searchComp;
  text = text.replace(whitespace, "");
  const regex = new RegExp("^" + text, "gi");
  if (location.pathname !== "/playlists") {
    arrToSearch = getPlaylistsArr.find((playlist) => {
      return playlist.id === currentPlaylist;
    });
    searchComp = arrToSearch.tracks.reduce((arr, item) => {
      let track = getAllTracks[item];
      let name = track.name;
      if (regex.test(name.trim()) && text.length > 0) {
        arr.push({
          track: track,
          playlist: arrToSearch,
          uid: uuidv4(),
        });
      }
      return arr;
    }, []);
  } else {
    let allTracks = getPlaylistsArr.reduce((arr, playlist) => {
      let tracksArr = playlist.tracks;
      tracksArr.reduce((arrNest, trackNest) => {
        arr.push({
          ...getAllTracks[trackNest],
          playlist: playlist,
        });
      }, []);
      return arr;
    }, []);
    searchComp = allTracks.reduce((arr, track) => {
      let name = track.name;
      if (regex.test(name.trim()) && text.length > 0) {
        arr.push({
          track: track,
          playlist: track.playlist,
          uid: uuidv4(),
        });
      }
      return arr;
    }, []);
  }
  setSearchText(e.target.value);
  setSearchArr(searchComp);
  setFilteredSearch(() => {
    let obj = {};
    for (let i = 0; i < tempArr.length; i++) {
      if (obj[tempArr[i].playlist.id]) {
        obj[tempArr[i].playlist.id].push(tempArr[i].track);
      } else {
        obj[tempArr[i].playlist.id] = [tempArr[i].track];
      }
    }
    let keys = Object.keys(obj);
    let toArray = keys.map((id) => {
      return getPlaylists[id];
    });
    return toArray;
  });
};
export const handleCheckAll = (
  tracks,
  playlistId,
  scroll,
  setSelectedAllIds,
  selected,
  setSelected
) => {
  setSelectedAllIds((prev) => {
    let copyAll = [...prev];
    let copySelected = [...selected];
    let index = copyAll.indexOf(playlistId);
    let filteredArr = [];
    if (!copyAll.includes(playlistId) && !scroll) {
      filteredArr = copySelected.filter((item) => {
        return item.playlistid !== playlistId;
      });
      filteredArr.push(...tracks);
      copyAll.push(playlistId);
      setSelected(() => {
        return filteredArr;
      });
    } else if (copyAll.includes(playlistId) && !scroll) {
      filteredArr = copySelected.filter((item) => {
        return item.playlistid !== playlistId;
      });
      copyAll.splice(index, 1);
      setSelected(() => {
        return filteredArr;
      });
    } else if (copyAll.includes(playlistId) && scroll) {
      copyAll.splice(index, 1);
      setSelected((prev) => {
        return prev;
      });
    }
    return copyAll;
  });
};
export const handleCheckSearchAll = (
  searchArr,
  selected,
  selectedAllIds,
  setSelectedAllIds,
  setSelected
) => {
  let searchArrCopy = [...searchArr];
  let selectedCopy = [...selected];
  let selectedAllIdsCopy = [...selectedAllIds];
  let index = selectedAllIdsCopy.indexOf("search");
  if (index >= 0) {
    selectedAllIdsCopy.splice(index, 1);
    selectedCopy = selectedCopy.filter((set) => {
      return set.checkId !== "search";
    });
  } else {
    let checkAllFiltered = searchArrCopy
      .filter((track) => {
        let findId = selectedCopy.find((item) => {
          return item.trackid === track.track.uid;
        });
        if (!findId) {
          return track;
        }
      })
      .map((item) => {
        let obj = {
          trackid: item.track.uid,
          playlistid: item.playlist.id,
          uri: item.track.uri,
          index: item.track.index,
          selected: true,
          checkId: "search",
        };
        return obj;
      });
    selectedAllIdsCopy.push("search");
    selectedCopy.push(...checkAllFiltered);
  }
  setSelectedAllIds(selectedAllIdsCopy);
  setSelected(selectedCopy);
};

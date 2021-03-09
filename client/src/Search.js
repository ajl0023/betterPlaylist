import React from "react";
import style from "./styles/searchBar.module.scss";

const Search = (props) => {
  return (
    <>
    
      <div className={style["input-container"]}>
        <input
          onChange={handleChange}
          className={style["input-searchbar"]}
          type="text"
          name=""
          id=""
        />
        <div className={style["input-content-container"]}>
          <SearchIcon className={style["search-icon"]} />
        </div>
      </div>
    </>
  );
};

export default Search;

import { NAVBAR_LINK_CLICKED } from "../types/types";
export const linkClick = () => {
  return (dispatch, getState) => {
    const currentState = getState().navbar.searchBar;
  
    dispatch({
      type: NAVBAR_LINK_CLICKED,
      clearSearch: !currentState,
    });
  };
};

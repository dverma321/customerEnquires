export const initialState = {
  isAuthenticated: false, // Default state structure
};

export const reducer = (state, action) => {
  switch (action.type) {
    case "USER":
      return {
        ...state,
        isAuthenticated: action.payload,
      };
    default:
      return state;
  }
};

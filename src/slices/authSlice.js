import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("token")
    ? JSON.parse(localStorage.getItem("token"))
    : null,
  signupData: null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setSignupData: (state, action) => {
      state.signupData = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setToken, setSignupData, setLoading } = authSlice.actions;
export default authSlice.reducer;

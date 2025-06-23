import { createSlice } from "@reduxjs/toolkit";

const signupSlice = createSlice({
    name: 'signup',
    initialState: null,
    reducers: {
        addSignup: (state, action) => {
            return action.payload
        },
        removeSignup: (state, action) => null
    }
})

export const { addSignup, removeSignup } = signupSlice.actions;
export default signupSlice.reducer;

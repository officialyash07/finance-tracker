import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { User } from "../../types/user";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        setAuthenticatedUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },

        clearAuthentication: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setAuthenticatedUser, clearAuthentication } = authSlice.actions;

export default authSlice.reducer;

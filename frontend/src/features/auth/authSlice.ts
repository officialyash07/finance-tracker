import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { User } from "../../types/user";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isInitialized: false,
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

        setAuthInitialized: (state) => {
            state.isInitialized = true;
        },
    },
});

export const { setAuthenticatedUser, clearAuthentication, setAuthInitialized } =
    authSlice.actions;

export default authSlice.reducer;

import axios from "axios";

import type { User } from "../../types/user";
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
} from "../../types/auth";

export const loginUser = async (
    credentials: LoginRequest,
): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        credentials,
        {
            withCredentials: true,
        },
    );

    return response.data;
};

export const getCurrentUser = async (signal?: AbortSignal): Promise<User> => {
    const response = await axios.get<User>(
        `${import.meta.env.VITE_API_BASE_URL}/users/me`,
        { withCredentials: true, signal },
    );

    return response.data;
};

export const registerUser = async (data: RegisterRequest): Promise<User> => {
    const response = await axios.post<User>(
        `${import.meta.env.VITE_API_BASE_URL}/auth/register`,
        data,
        {
            withCredentials: true,
        },
    );

    return response.data;
};

export const logoutUser = async (): Promise<void> => {
    await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/logout`,
        {},
        { withCredentials: true },
    );
};

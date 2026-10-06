import axios from "axios";

import type { User } from "../../types/user";

interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    expiresIn: number;
}

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

export const getCurrentUser = async (): Promise<User> => {
    const response = await axios.get<User>(
        `${import.meta.env.VITE_API_BASE_URL}/users/me`,
        { withCredentials: true },
    );

    return response.data;
};

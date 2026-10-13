import apiClient from "./client";
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
} from "../types/auth";

import type { User } from "../types/user";

export async function register(request: RegisterRequest): Promise<User> {
    const response = await apiClient.post<User>("/auth/register", request);

    return response.data;
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
        "/auth/login",
        request,
    );

    return response.data;
}

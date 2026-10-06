import { useMutation } from "@tanstack/react-query";
import { getCurrentUser, loginUser } from "./authApi";
import type { User } from "../../types/user";

interface LoginCredentials {
    email: string;
    password: string;
}

export const useLogin = () => {
    return useMutation<User, Error, LoginCredentials>({
        mutationFn: async (credentials) => {
            await loginUser(credentials);

            return getCurrentUser();
        },
    });
};

import { useMutation } from "@tanstack/react-query";

import { getCurrentUser, loginUser } from "./authApi";
import type { User } from "../../types/user";
import type { LoginRequest } from "../../types/auth";

export const useLogin = () => {
    return useMutation<User, Error, LoginRequest>({
        mutationFn: async (credentials) => {
            await loginUser(credentials);

            return getCurrentUser();
        },
    });
};

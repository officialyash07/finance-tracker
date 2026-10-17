import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import { getCurrentUser, loginUser } from "./authApi";
import type { User } from "../../types/user";
import type { LoginRequest } from "../../types/auth";

export class SessionEstablishmentError extends Error {
    constructor() {
        super(
            "Login succeeded, but the authenticated session could not be started.",
        );
        this.name = "SessionEstablishmentError";
    }
}

export const useLogin = () => {
    return useMutation<User, Error, LoginRequest>({
        mutationFn: async (credentials) => {
            await loginUser(credentials);

            try {
                return await getCurrentUser();
            } catch (error) {
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 401
                ) {
                    throw new SessionEstablishmentError();
                }

                throw error;
            }
        },
    });
};

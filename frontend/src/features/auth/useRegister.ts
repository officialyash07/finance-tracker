import { useMutation } from "@tanstack/react-query";

import { registerUser } from "./authApi";
import type { RegisterRequest } from "../../types/auth";
import type { User } from "../../types/user";

export const useRegister = () => {
    return useMutation<User, Error, RegisterRequest>({
        mutationFn: (data) => registerUser(data),
    });
};

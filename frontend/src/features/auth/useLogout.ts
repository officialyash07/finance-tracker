import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { logoutUser } from "./authApi";
import { useAppDispatch } from "../../store/hooks";
import { clearAuthentication } from "./authSlice";

export const useLogout = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation<void, Error, void>({
        mutationFn: logoutUser,

        onSuccess: async () => {
            dispatch(clearAuthentication());

            await queryClient.cancelQueries();
            queryClient.clear();

            navigate("/login", { replace: true });
        },
    });
};

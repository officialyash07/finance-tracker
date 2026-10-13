import { getCurrentUser } from "./authApi";

import { useQuery } from "@tanstack/react-query";

export const useCurrentUser = () => {
    return useQuery({
        queryKey: ["currentUser"],
        queryFn: ({ signal }) => getCurrentUser(signal),
        retry: false,
    });
};

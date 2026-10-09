import { useEffect } from "react";

import { useAppDispatch } from "../../store/hooks";
import {
    setAuthenticatedUser,
    clearAuthentication,
    setAuthInitialized,
} from "./authSlice";
import { useCurrentUser } from "./useCurrentUser";

const AuthInitializer = () => {
    const dispatch = useAppDispatch();
    const { data: user, isSuccess, isError } = useCurrentUser();

    useEffect(() => {
        if (isSuccess && user) {
            dispatch(setAuthenticatedUser(user));
        } else if (isError) {
            dispatch(clearAuthentication());
        } else {
            return;
        }

        dispatch(setAuthInitialized());
    }, [dispatch, user, isSuccess, isError]);

    return null;
};

export default AuthInitializer;

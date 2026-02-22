const ACCESS_KEY = "eunoia_access";
const REFRESH_KEY = "eunoia_refresh";

export const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
};

export const getAccessToken = () => {
    return localStorage.getItem(ACCESS_KEY);
};

export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_KEY);
};

export const clearTokens = () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
};
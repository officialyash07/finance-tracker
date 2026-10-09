export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    preferredCurrency: string;
}

export interface LoginRequest {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface LoginResponse {
    expiresIn: number;
}

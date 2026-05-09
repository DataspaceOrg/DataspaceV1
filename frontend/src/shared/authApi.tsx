// For Frontend authed user, password not stored. 
const API_BASE = 'http://localhost:8000';

export type User = {
    user_id: string;
    username: string;
    email: string;
    created_at: string;
    updated_at: string;
}   

// // The response from the backend for authentication.
export type AuthResponse = {
    message: string;
    user: User;
}

export async function signupUser(body: { username: string, email: string, password: string }): Promise<AuthResponse> {
    // Send the request to the  /signup API in the backend. 
    const response = await fetch(`${API_BASE}/auth/signup`, 
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(body),
        });

    if (!response.ok) {
        throw new Error(`Failed to sign up user: ${response.statusText}`);
    }

    console.log('Signup response:', response);

    // Return the new user that was created as an AuthResponse object.
    const AuthData = await response.json();
    return AuthData;
    
}

export async function loginUser(body: { email: string, password: string }): Promise<AuthResponse> {
    // Send the request to the  /login API in the backend. 
    const response = await fetch(`${API_BASE}/auth/login`, 
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(body),
        });

    if (!response.ok) {
            throw new Error(`Failed to login user: ${response.statusText}`);
    }

    const AuthData = await response.json();
    return AuthData;
}
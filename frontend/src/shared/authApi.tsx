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

type ApiValidationError = {
    loc?: Array<string | number>;
    msg?: string;
    type?: string;
};

/*
getErrorMessage function is used to get the error message from the backend response for validation errors. 

For passwordErrors, it will return the password error for not beign inbetween 7 and 72 characters long and not containing at least 1 digit.
*/
async function getErrorMessage(response: Response): Promise<string> {
    // Attempts to parse the error response as a json body. 
    const data = await response.json().catch(() => null);
    
    if (Array.isArray(data?.detail)) {

        // Search through the validations to find the one related to the password. 
        const passwordError = data.detail.find((error: ApiValidationError) =>
            error.loc?.includes('password')
        );

        if (passwordError) {
            return 'Password must be longer than 6 characters and contain at least 1 digit.';
        }

        return data.detail[0]?.msg ?? response.statusText;
    }
    if (typeof data?.detail === 'string') {
        return data.detail;
    }
    return response.statusText;
}

/*
registerUser function sends a request to the /signup API in the backend to create a new user.
It returns an AuthResponse object (see frontend objects) and the public information of the user.
*/
export async function registerUser(body: { username: string, email: string, password: string }): Promise<AuthResponse> {
    // Send the request to the  /signup API in the backend. 
    const response = await fetch(`${API_BASE}/auth/register`, 
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(body),
        });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
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
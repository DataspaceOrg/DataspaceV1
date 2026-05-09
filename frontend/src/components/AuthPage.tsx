import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupUser, loginUser, type AuthResponse } from '../shared/authApi';

import '../styles/AuthPage.css';


type AuthMode = "login" | "signup";

function AuthPage({ mode }: { mode: AuthMode }) {

    const SigningUp = mode === "signup";

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        // Set the submitting state to true to disable the submit button.
        setSubmitting(true);

        try {
            let user_data: AuthResponse;
            if (SigningUp) {
                user_data = await signupUser({ username, email, password });
            } else {
                user_data = await loginUser({ email, password });
            }

            // Set local storage paramters for our session. 
            localStorage.setItem('dataspace_user_id', user_data.user.user_id);
            localStorage.setItem('dataspace_username', user_data.user.username);
            localStorage.setItem('dataspace_email', user_data.user.email);

            // Navigate to the dashboard page.
            navigate('/dashboard');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setSubmitting(false);
        }

    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>{SigningUp ? "Create your Account" : "Login to Dataspace"}</h1>
                    <p>{SigningUp ? "Sign up to start learning more about the power of your data" : "Welcome back. Log in to continue working with your datasets."}</p>
                </div>
                <form className="auth-form" onSubmit={handleSubmit}>
                    {/* If signing up is true. Then a username is needed to create an account. Email and password are needed regardless of logging in or signing up. */}
                    { SigningUp && (
                        <label className="auth-field">
                            <p>Username</p>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" required />
                        </label>
                    )}

                    <label className="auth-field">
                        <p>Email</p>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
                    </label>

                    <label className="auth-field">
                        <p>Password</p>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
                    </label>

                    {error && <p className="error-message">{error}</p>}

                    {/* Display different test if we are signing up or logging in.  */}
                    <button className="auth-submit-button" type="submit" disabled={submitting}>
                        {submitting ? SigningUp ? "Signing Up..." : "Logging In..." : SigningUp ? "Create Account" : "Login"}
                    </button>
                </form>
                <div className="auth-switch">
                    {
                        SigningUp ? (
                            <p>Already have an account? <Link to="/login" className="auth-switch-link">Login</Link></p>
                        ) : (
                            <p>Don't have an account? <Link to="/signup" className="auth-switch-link">Sign up</Link></p>
                        )
                    }
                </div>
            </div>    
        </div>
    )

}

export default AuthPage;
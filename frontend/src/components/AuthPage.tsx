import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/userService";

import "../styles/AuthPage.css";

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
      const { user } = SigningUp
        ? await registerUser({ username, email, password })
        : await loginUser({ email, password });

      localStorage.setItem("dataspace_user_id", user.id);
      localStorage.setItem("dataspace_username", user.username);
      localStorage.setItem("dataspace_email", user.email);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="public-page">
      <header className="public-nav">
        <Link className="brand" to="/">
          dataspace
        </Link>
        <Link to={SigningUp ? "/login" : "/signup"}>
          {SigningUp ? "Log in" : "Create account"}
        </Link>
      </header>
      <main className="auth-wrap">
        <h1>{SigningUp ? "Create account" : "Log in"}</h1>
        <p className="muted auth-description">
          {SigningUp
            ? "Sign up to start learning more about the power of your data"
            : "Welcome back. Log in to continue working with your datasets."}
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* If signing up is true. Then a username is needed to create an account. Email and password are needed regardless of logging in or signing up. */}
          {SigningUp && (
            <label className="field" htmlFor="username">
              <span>Username</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </label>
          )}

          <label className="field" htmlFor="email">
            <span>Email</span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </label>

          <label className="field" htmlFor="password">
            <span>Password</span>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {error && (
            <p className="feedback error" role="alert">
              {error}
            </p>
          )}

          {/* Display different test if we are signing up or logging in.  */}
          <button
            className="button primary auth-submit-button"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? SigningUp
                ? "Signing Up..."
                : "Logging In..."
              : SigningUp
                ? "Create Account"
                : "Login"}
          </button>
        </form>
        <p className="auth-switch muted small">
          {SigningUp ? "Already have an account? " : "Don't have an account? "}
          <Link
            to={SigningUp ? "/login" : "/signup"}
            className="auth-switch-link"
          >
            {SigningUp ? "Log in" : "Sign up"}
          </Link>
        </p>
      </main>
    </div>
  );
}

export default AuthPage;

import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../shared/authApi";
import { errorMessage } from "../shared/http";
import { clearWorkspace } from "../shared/workspace";
import { Button, Feedback, Field } from "./ui";
export default function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const [username, setUsername] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  const navigate = useNavigate(),
    busy = useRef(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      const response = await (signup
        ? registerUser({ username, email, password })
        : loginUser({ email, password }));
      clearWorkspace();
      localStorage.setItem("dataspace_user_id", response.user.user_id);
      localStorage.setItem("dataspace_username", response.user.username);
      localStorage.setItem("dataspace_email", response.user.email);
      navigate("/dashboard");
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <div className="public-page">
      <header className="public-nav">
        <Link className="brand" to="/">
          dataspace
        </Link>
        <Link to={signup ? "/login" : "/signup"}>
          {signup ? "Log in" : "Create account"}
        </Link>
      </header>
      <main className="auth-wrap">
        <h1>{signup ? "Create account" : "Log in"}</h1>
        <form onSubmit={submit}>
          {signup && (
            <Field label="Username" htmlFor="username">
              <input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={pending}
              />
            </Field>
          )}
          <Field label="Email" htmlFor="email">
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={pending}
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <input
              id="password"
              type="password"
              autoComplete={signup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={pending}
            />
          </Field>
          {error && <Feedback error>{error}</Feedback>}
          <Button type="submit" className="primary" disabled={pending}>
            {pending
              ? signup
                ? "Creating account…"
                : "Logging in…"
              : signup
                ? "Create account"
                : "Log in"}
          </Button>
        </form>
        <p className="auth-switch muted small">
          {signup ? "Already have an account? " : "New to Dataspace? "}
          <Link to={signup ? "/login" : "/signup"}>
            {signup ? "Log in" : "Create account"}
          </Link>
        </p>
      </main>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import { setToken } from "../auth";

export default function Login() {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { token } = await login(apiKey);
      setToken(token);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Manga Tracker Admin</h1>
        {error && <p className="error">{error}</p>}
        <label>
          API key
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
        </label>
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}

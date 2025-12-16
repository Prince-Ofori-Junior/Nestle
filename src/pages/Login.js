import { useState } from "react";
import api from "../api/api";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../login.css";
import nestleLogo from "../asset/logo192.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      const user = res.data.user;

      if (user.role.toLowerCase() === "admin") {
        setError("Admins must use the admin login page.");
        return;
      }

      if (user.role.toLowerCase() !== role) {
        setError(`This account is not an(a) ${role}.`);
        return;
      }

      login(res.data.token, user, rememberMe);

      if (user.role === "technician") navigate("/technician");
      if (user.role === "employee") navigate("/employee");

    } catch (err) {
      setError(err.response?.data?.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form animate" onSubmit={handleSubmit}>

        {/* LOGO */}
        <img src={nestleLogo} alt="Nestlé Ghana" className="auth-logo" />

        <h2>IT Helpdesk Login</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* PASSWORD */}
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        {/* ROLE */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="role-select"
          required
        >
          <option value="employee">Employee</option>
          <option value="technician">Technician</option>
        </select>

        {/* REMEMBER ME */}
        <div className="remember-me">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label>Remember me</label>
        </div>

        <button className="btn primary" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="auth-footer">
          First time here?{" "}
          <Link to="/register" className="auth-link">
            Create an account
          </Link>
        </p>

      </form>
    </div>
  );
};

export default Login;

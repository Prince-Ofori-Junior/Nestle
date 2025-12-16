import { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import "../register.css"
import nestleLogo from "../asset/logo192.png";


const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        department,
        role: "employee" // default role
      });

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
     <img src={nestleLogo} alt="Nestlé Ghana" className="auth-logo" />

      <h2>Create Account</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Department (optional)"
        value={department}
        onChange={e => setDepartment(e.target.value)}
      />

      <button className="btn primary" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>

      <p className="auth-footer">
        Already have an account?{" "}
        <Link to="/login" className="auth-link">
          Login here
        </Link>
      </p>
    </form>
  );
};

export default Register;

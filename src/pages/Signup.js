import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

import "../styles/auth.css";
import "../styles/login.css";

/* 🔒 EMAIL VALIDATION HELPERS */
const isValidEmail = (email) => {
  const regex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

const blockedDomains = [
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "yopmail.com",
  "guerrillamail.com",
];

const allowedDomains = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "citchennai.net", // college mail (optional)
];

const isBlockedDomain = (email) => {
  const domain = email.split("@")[1];
  return blockedDomains.includes(domain);
};

const isAllowedDomain = (email) => {
  const domain = email.split("@")[1];
  return allowedDomains.includes(domain);
};

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Enter a valid email address");
      return;
    }

    if (isBlockedDomain(email)) {
      setError("Temporary email addresses are not allowed");
      return;
    }

    if (!isAllowedDomain(email)) {
      setError("Please use a valid personal or college email");
      return;
    }

    try {
      setLoading(true);

      // 🔐 Create Firebase Auth user
      const res = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 🧾 Create Firestore user profile
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        name,
        email,
        role: "student",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // ✅ Redirect ONLY to login (no auto-login)
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* TOP NAV */}
      <div className="auth-navbar">
        <h2>Smart Study Rooms</h2>
        <div>
          <span onClick={() => navigate("/login")}>Login</span>
          <span className="active">Signup</span>
        </div>
      </div>

      {/* SIGNUP FORM */}
      <div className="login-page">
        <div className="login-box">
          <h1 className="login-title">Create Account</h1>
          <p className="subtitle">Student Registration</p>

          <form onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Student Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="error-message">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          <p className="login-hint">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </div>
      </div>
    </>
  );
}

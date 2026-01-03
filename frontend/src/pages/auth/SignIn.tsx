import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, Building2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../../components/common";
import styles from "./Auth.module.css";

export const SignIn = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signIn(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authHeader}>
        <div className={styles.logo}>
          <Building2 size={24} color="#7c3aed" />
          <span className={styles.logoText}>HRMS Portal</span>
        </div>
        <p className={styles.subtitle}>Human Resource Management System</p>
      </div>

      <div className={styles.authCard}>
        <div className={styles.cardIcon}>
          <Building2 size={48} color="#7c3aed" />
        </div>

        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.description}>Access your employee dashboard</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorBanner}>{error}</div>}

          <div>
            <Input
              type="text"
              name="email"
              label="Login ID / Email"
              placeholder="OIODO20220001 or name@company.com"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail size={18} />}
              fullWidth
              required
            />
          </div>

          <div style={{ position: "relative" }}>
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock size={18} />}
              fullWidth
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.eyeButton}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className={styles.forgotPassword}>
            <Link to="/forgot-password" className={styles.link}>
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            icon={<LogIn size={18} />}
            iconPosition="right"
          >
            Sign In
          </Button>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <div className={styles.footer}>
            <span>Don't have an account?</span>
            <Link to="/signup" className={styles.linkPrimary}>
              Sign Up
            </Link>
          </div>
        </form>

        <div className={styles.infoBox}>
          <span className={styles.infoIcon}>ⓘ</span>
          <p className={styles.infoText}>
            Employees: Use your system-generated Login ID (e.g., OIODO20220001)
            and password. Admins can sign in with email. Change your password
            after first login.
          </p>
        </div>
      </div>
    </div>
  );
};

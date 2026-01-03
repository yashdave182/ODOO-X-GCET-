import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, ArrowLeft, Building2 } from "lucide-react";
import { Button } from "../../components/common";
import styles from "./Auth.module.css";

export const VerifyEmailPending = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Get email from navigation state
  const email = location.state?.email || "your email";

  const handleResendEmail = async () => {
    try {
      setResendLoading(true);

      // TODO: Replace with actual API call when backend is ready
      // await fetch('/api/auth/resend-verification', {
      //   method: 'POST',
      //   body: JSON.stringify({ email })
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setResendSuccess(true);

      // Start countdown
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setResendSuccess(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error("Failed to resend email:", error);
    } finally {
      setResendLoading(false);
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
          <Mail size={48} color="#7c3aed" />
        </div>

        <h1 className={styles.title}>Verify Your Email</h1>
        <p className={styles.description}>
          We've sent a verification link to
        </p>
        <p style={{
          fontSize: "0.9375rem",
          fontWeight: 600,
          color: "var(--primary)",
          textAlign: "center",
          marginTop: "0.25rem",
          marginBottom: "1.5rem"
        }}>
          {email}
        </p>

        <div className={styles.infoBox} style={{ marginBottom: "1.5rem" }}>
          <span className={styles.infoIcon}>📧</span>
          <p className={styles.infoText}>
            Click the verification link in your email to activate your account.
            The link will expire in 24 hours.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
          <Button
            fullWidth
            size="lg"
            onClick={handleResendEmail}
            isLoading={resendLoading}
            disabled={resendSuccess}
          >
            {resendSuccess
              ? `Resend in ${countdown}s`
              : "Resend Verification Email"}
          </Button>

          <Button
            fullWidth
            size="lg"
            variant="secondary"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate("/signin")}
          >
            Back to Sign In
          </Button>
        </div>

        <div className={styles.infoBox} style={{ marginTop: "1.5rem" }}>
          <span className={styles.infoIcon}>💡</span>
          <div className={styles.infoText}>
            <p style={{ marginBottom: "0.5rem" }}>
              <strong>Didn't receive the email?</strong>
            </p>
            <ul style={{ paddingLeft: "1.25rem", margin: 0, lineHeight: 1.6 }}>
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email</li>
              <li>Wait a few minutes and try resending</li>
            </ul>
          </div>
        </div>

        {resendSuccess && (
          <div style={{
            marginTop: "1rem",
            padding: "0.75rem 1rem",
            backgroundColor: "#d1fae5",
            color: "#065f46",
            borderRadius: "var(--border-radius)",
            fontSize: "0.875rem",
            textAlign: "center",
            border: "1px solid #a7f3d0"
          }}>
            ✓ Verification email sent successfully!
          </div>
        )}
      </div>
    </div>
  );
};

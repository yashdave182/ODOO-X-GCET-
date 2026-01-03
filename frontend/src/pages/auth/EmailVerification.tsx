import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Mail, CheckCircle, XCircle, Loader, Building2 } from "lucide-react";
import { Button } from "../../components/common";
import styles from "./Auth.module.css";

export const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else if (!email) {
      setStatus("error");
      setMessage("Invalid verification link. Please check your email or request a new verification link.");
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus("verifying");

      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate success
      setStatus("success");
      setMessage("Your email has been successfully verified! You can now sign in to your account.");

      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate("/signin");
      }, 3000);

    } catch (error) {
      setStatus("error");
      setMessage("Email verification failed. The link may be expired or invalid.");
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setMessage("Email address not found. Please sign up again.");
      return;
    }

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
      setMessage(`Verification email has been resent to ${email}`);

    } catch (error) {
      setMessage("Failed to resend verification email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <>
            <div className={styles.cardIcon}>
              <Loader size={48} color="#7c3aed" className="animate-spin" />
            </div>
            <h1 className={styles.title}>Verifying Your Email</h1>
            <p className={styles.description}>
              Please wait while we verify your email address...
            </p>
          </>
        );

      case "success":
        return (
          <>
            <div className={styles.cardIcon} style={{ background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)" }}>
              <CheckCircle size={48} color="#059669" />
            </div>
            <h1 className={styles.title}>Email Verified!</h1>
            <p className={styles.description}>{message}</p>
            <div className={styles.successAnimation}>
              <div className={styles.checkmark}>✓</div>
            </div>
            <Button
              fullWidth
              size="lg"
              onClick={() => navigate("/signin")}
            >
              Go to Sign In
            </Button>
          </>
        );

      case "error":
        return (
          <>
            <div className={styles.cardIcon} style={{ background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)" }}>
              <XCircle size={48} color="#dc2626" />
            </div>
            <h1 className={styles.title}>Verification Failed</h1>
            <p className={styles.description} style={{ color: "#dc2626" }}>
              {message}
            </p>

            {email && (
              <div style={{ marginTop: "1.5rem", width: "100%" }}>
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleResendEmail}
                  isLoading={resendLoading}
                  disabled={resendSuccess}
                >
                  {resendSuccess ? "Email Sent!" : "Resend Verification Email"}
                </Button>
              </div>
            )}

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <div className={styles.footer}>
              <span>Need help?</span>
              <Link to="/signin" className={styles.linkPrimary}>
                Back to Sign In
              </Link>
            </div>
          </>
        );
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
        {renderContent()}

        {status === "verifying" && (
          <div className={styles.infoBox} style={{ marginTop: "1.5rem" }}>
            <span className={styles.infoIcon}>ⓘ</span>
            <p className={styles.infoText}>
              This may take a few moments. Please don't close this window.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .successAnimation {
          margin: 1rem 0;
        }
        .checkmark {
          font-size: 4rem;
          color: #059669;
          animation: scaleIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, Phone, Building2, Upload } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../../components/common";
import styles from "./Auth.module.css";

export const SignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    companyName: "",
    companyCode: "",
    companyLogo: "",
    adminName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setFormData({ ...formData, companyLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await signUp(formData);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.splitLayout}>
      <div className={styles.leftSection}>
        <div className={styles.leftLogo}>
          <Building2 size={40} />
          <span className={styles.leftLogoText}>HRMS Portal</span>
        </div>

        <div className={styles.leftContent}>
          <h1 className={styles.leftHeading}>
            Streamline your workforce management today.
          </h1>
          <p className={styles.leftDescription}>
            Join thousands of companies managing their employees efficiently
            with our all-in-one HR solution.
          </p>

          <div className={styles.testimonial}>
            <div className={styles.testimonialImages}>
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=User1"
                alt="User"
                className={styles.testimonialImage}
              />
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=User2"
                alt="User"
                className={styles.testimonialImage}
              />
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=User3"
                alt="User"
                className={styles.testimonialImage}
              />
            </div>
            <span className={styles.testimonialText}>
              Trusted by HR professionals
            </span>
          </div>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.signupCard}>
          <h1 className={styles.title}>Company Registration</h1>
          <p className={styles.description}>
            Create your company account to get started
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.uploadSection}>
              <label className={styles.uploadLabel}>Company Logo</label>
              <div className={styles.uploadWrapper}>
                <div className={styles.avatarPlaceholder}>
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Upload size={24} />
                  )}
                </div>
                <input
                  type="file"
                  id="logoUpload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: "none" }}
                />
                <label htmlFor="logoUpload" className={styles.uploadButton}>
                  Upload Logo
                </label>
              </div>
            </div>

            <Input
              type="text"
              name="companyName"
              label="Company Name"
              placeholder="Acme Inc."
              value={formData.companyName}
              onChange={handleChange}
              icon={<Building2 size={18} />}
              fullWidth
              required
            />

            <Input
              type="text"
              name="companyCode"
              label="Company Code"
              placeholder="AI (Auto-generated or custom)"
              value={formData.companyCode}
              onChange={handleChange}
              icon={<Building2 size={18} />}
              fullWidth
              helperText="2-letter code for Login ID generation (e.g., OI for Odoo India)"
            />

            <Input
              type="text"
              name="adminName"
              label="Admin Name"
              placeholder="John Doe"
              value={formData.adminName}
              onChange={handleChange}
              icon={<User size={18} />}
              fullWidth
              required
            />

            <Input
              type="email"
              name="email"
              label="Email Address"
              placeholder="admin@company.com"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail size={18} />}
              fullWidth
              required
            />

            <Input
              type="tel"
              name="phone"
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
              icon={<Phone size={18} />}
              fullWidth
              required
            />

            <div className={styles.formGrid}>
              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                icon={<Lock size={18} />}
                fullWidth
                required
              />

              <Input
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={<Lock size={18} />}
                fullWidth
                required
              />
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Sign Up
            </Button>

            <div className={styles.footer}>
              <span>Already have an account?</span>
              <Link to="/signin" className={styles.linkPrimary}>
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/errorMessage";

function Login() {

    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState(
        () => location.state?.email || localStorage.getItem("rememberedEmail") || ""
    );
    const [password, setPassword] = useState("");

    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [slowRequest, setSlowRequest] = useState(false);
    const [notice, setNotice] = useState(
        () => location.state?.registered
            ? "Your account was created. Sign in to continue."
            : sessionStorage.getItem("interviewiq.sessionExpired")
                ? "Your session expired. Please sign in again."
            : ""
    );

    useEffect(() => {
        if (sessionStorage.getItem("interviewiq.sessionExpired")) {
            sessionStorage.removeItem("interviewiq.sessionExpired");
        }
    }, []);

    useEffect(() => {
        if (!loading) {
            return undefined;
        }

        const timer = window.setTimeout(() => setSlowRequest(true), 5000);

        return () => window.clearTimeout(timer);
    }, [loading]);


    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");
        setNotice("");
        setSlowRequest(false);
        setLoading(true);

        const normalizedEmail = email.trim().toLowerCase();

        try {

            // Remove any old / expired JWT
            localStorage.removeItem("token");

            const response = await api.post("/auth/login", {
                email: normalizedEmail,
                password: password
            });

            // Backend returns JWT directly
            const token = response.data;

            // Store JWT
            localStorage.setItem("token", token);

            // Remember email if selected
            if (rememberMe) {
                localStorage.setItem("rememberedEmail", normalizedEmail);
            } else {
                localStorage.removeItem("rememberedEmail");
            }

            // Go to dashboard
            navigate("/dashboard");

        } catch (error) {

            setError(
                error.response?.status === 401
                    ? "Invalid email or password."
                    : getApiErrorMessage(
                        error,
                        "Unable to sign in right now. Please try again."
                    )
            );

        } finally {

            setSlowRequest(false);
            setLoading(false);

        }
    };


    return (
        <div style={styles.page}>

            <div style={styles.container}>

                {/* Heading */}

                <div style={styles.headingSection}>

                    <h1 style={styles.title}>
                        Ready for your
                        <br />
                        next interview?
                    </h1>

                    <p style={styles.subtitle}>
                        Sign in to keep your applications, preparation,
                        <br />
                        and progress in one place.
                    </p>

                </div>


                {/* Login Form */}

                <form
                    onSubmit={handleLogin}
                    style={styles.form}
                >

                    {/* Email */}

                    <div style={styles.inputGroup}>

                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            aria-label="Email address"
                            style={styles.input}
                        />

                    </div>


                    {/* Password */}

                    <div style={styles.inputGroup}>

                        <div style={styles.passwordWrapper}>

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                                autoComplete="current-password"
                                aria-label="Password"
                                style={styles.passwordInput}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                style={styles.showButton}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>

                        </div>

                    </div>


                    {/* Remember Me / Forgot Password */}

                    <div style={styles.optionsRow}>

                        <label style={styles.rememberLabel}>

                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) =>
                                    setRememberMe(e.target.checked)
                                }
                                style={styles.checkbox}
                            />

                            <span>
                                Remember me
                            </span>

                        </label>


                        <button
                            type="button"
                            style={styles.forgotButton}
                            onClick={() => setError("Password reset is not available yet. Please contact support.")}
                        >
                            Forgot Password?
                        </button>

                    </div>


                    {/* Error */}

                    {notice && (
                        <div style={styles.notice} role="status">
                            {notice}
                        </div>
                    )}

                    {error && (
                        <div style={styles.error} role="alert" aria-live="assertive">
                            {error}
                        </div>
                    )}

                    {slowRequest && !error && (
                        <div style={styles.wakingNotice} role="status" aria-live="polite">
                            The server is waking up. This first request can take a little longer.
                        </div>
                    )}


                    {/* Sign In */}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.signInButton,
                            ...(loading
                                ? styles.loadingButton
                                : {})
                        }}
                    >
                        {loading
                            ? "Signing In..."
                            : "Sign In"}
                    </button>

                </form>


                {/* Sign Up */}

                <div style={styles.bottomText}>

                    <span>
                        Don't have an account?
                    </span>

                    <button
                        type="button"
                        style={styles.signUpButton}
                        onClick={() => navigate("/register")}
                    >
                        Sign Up
                    </button>

                </div>

            </div>

        </div>
    );
}


const styles = {

    /* ================================= */
    /* PAGE                              */
    /* ================================= */

    page: {
        minHeight: "100vh",
        width: "100%",
        background: "#ffffff",
        fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        padding: "40px 24px"
    },


    /* ================================= */
    /* MAIN CONTAINER                    */
    /* ================================= */

    container: {
        width: "100%",
        maxWidth: "500px",
        boxSizing: "border-box",
        transform: "translateY(-20px)"
    },


    /* ================================= */
    /* HEADING                           */
    /* ================================= */

    headingSection: {
        marginBottom: "36px"
    },

    title: {
        margin: "0",
        fontSize: "clamp(38px, 8vw, 50px)",
        lineHeight: "1.08",
        fontWeight: "720",
        letterSpacing: "-2.2px",
        color: "#111111"
    },

    subtitle: {
        margin: "22px 0 0",
        fontSize: "16px",
        lineHeight: "1.6",
        color: "#858585",
        fontWeight: "400",
        maxWidth: "460px"
    },


    /* ================================= */
    /* FORM                              */
    /* ================================= */

    form: {
        width: "100%"
    },

    inputGroup: {
        width: "100%",
        marginBottom: "13px"
    },


    /* ================================= */
    /* EMAIL                             */
    /* ================================= */

    input: {
        width: "100%",
        height: "58px",
        boxSizing: "border-box",
        border: "1px solid #d8d8d8",
        borderRadius: "9px",
        padding: "0 20px",
        fontSize: "15px",
        color: "#222222",
        background: "#ffffff",
        outline: "none",
        fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease"
    },


    /* ================================= */
    /* PASSWORD                          */
    /* ================================= */

    passwordWrapper: {
        width: "100%",
        height: "58px",
        boxSizing: "border-box",
        border: "1px solid #d8d8d8",
        borderRadius: "9px",
        display: "flex",
        alignItems: "center",
        background: "#ffffff",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease"
    },

    passwordInput: {
        flex: "1",
        height: "100%",
        border: "none",
        outline: "none",
        padding: "0 20px",
        fontSize: "15px",
        color: "#222222",
        background: "transparent",
        minWidth: "0",
        fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },

    showButton: {
        border: "none",
        background: "transparent",
        color: "#6d28d9",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        padding: "10px 18px"
    },


    /* ================================= */
    /* OPTIONS                           */
    /* ================================= */

    optionsRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "17px",
        marginBottom: "40px"
    },

    rememberLabel: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
        color: "#777777",
        fontSize: "14px",
        cursor: "pointer",
        userSelect: "none"
    },

    checkbox: {
        width: "18px",
        height: "18px",
        accentColor: "#6d28d9",
        cursor: "pointer"
    },

    forgotButton: {
        border: "none",
        background: "transparent",
        padding: "0",
        color: "#777777",
        fontSize: "14px",
        cursor: "pointer"
    },


    /* ================================= */
    /* ERROR                             */
    /* ================================= */

    error: {
        color: "#dc2626",
        fontSize: "13px",
        marginTop: "-22px",
        marginBottom: "18px"
    },

    notice: {
        color: "#047857",
        background: "#ecfdf5",
        border: "1px solid #a7f3d0",
        borderRadius: "8px",
        padding: "10px 12px",
        fontSize: "13px",
        marginTop: "-22px",
        marginBottom: "18px"
    },

    wakingNotice: {
        color: "#92400e",
        background: "#fffbeb",
        border: "1px solid #fde68a",
        borderRadius: "8px",
        padding: "10px 12px",
        fontSize: "13px",
        marginTop: "-22px",
        marginBottom: "18px"
    },


    /* ================================= */
    /* SIGN IN                           */
    /* ================================= */

    signInButton: {
        height: "58px",
        width: "170px",
        padding: "0 32px",
        border: "none",
        borderRadius: "9px",
        background: "#6d28d9",
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: "650",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 6px 18px rgba(109, 40, 217, 0.20)"
    },

    loadingButton: {
        opacity: "0.7",
        cursor: "not-allowed"
    },


    /* ================================= */
    /* BOTTOM                            */
    /* ================================= */

    bottomText: {
        display: "flex",
        alignItems: "center",
        gap: "5px",
        marginTop: "72px",
        color: "#777777",
        fontSize: "14px"
    },

    signUpButton: {
        border: "none",
        background: "transparent",
        padding: "0",
        color: "#6d28d9",
        fontSize: "14px",
        fontWeight: "650",
        cursor: "pointer"
    }

};


export default Login;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api/axios";

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (form.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (form.password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/register", {
                ...form,
                name: form.name.trim(),
                email: form.email.trim().toLowerCase()
            });
            navigate("/login", {
                replace: true,
                state: {
                    registered: true,
                    email: form.email.trim().toLowerCase()
                }
            });
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to create your account. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-6 py-10">
            <div className="w-full max-w-md">
                <div className="mb-8">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
                        InterviewIQ
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                        Create your account
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                        Start organizing your interviews, questions, and lessons learned.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        name="name"
                        value={form.name}
                        onChange={updateField}
                        placeholder="Full name"
                        autoComplete="name"
                        required
                        className="h-14 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    />
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={updateField}
                        placeholder="Email address"
                        autoComplete="email"
                        required
                        className="h-14 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    />
                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={updateField}
                            placeholder="Password (8+ characters)"
                            autoComplete="new-password"
                            minLength={8}
                            required
                            aria-label="Password"
                            className="h-14 w-full rounded-lg border border-slate-300 px-4 pr-14 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((visible) => !visible)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-2 text-slate-500 hover:text-violet-700"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <p className="-mt-2 text-xs text-slate-500">
                        Use at least 8 characters so your account stays secure.
                    </p>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Confirm password"
                            autoComplete="new-password"
                            minLength={8}
                            required
                            aria-label="Confirm password"
                            aria-invalid={Boolean(confirmPassword && form.password !== confirmPassword)}
                            className="h-14 w-full rounded-lg border border-slate-300 px-4 pr-14 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((visible) => !visible)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-2 text-slate-500 hover:text-violet-700"
                            aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {confirmPassword && form.password !== confirmPassword && (
                        <p className="-mt-2 text-xs text-red-600" role="alert">
                            Passwords do not match yet.
                        </p>
                    )}

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="h-14 w-full rounded-lg bg-violet-700 px-5 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="mt-8 text-sm text-slate-500">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="font-semibold text-violet-700 hover:text-violet-900"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </main>
    );
}

export default Register;

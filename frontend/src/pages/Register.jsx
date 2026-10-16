import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (form.password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/register", form);
            navigate("/login", { replace: true });
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
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={updateField}
                        placeholder="Password (8+ characters)"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        className="h-14 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Confirm password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        className="h-14 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    />

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

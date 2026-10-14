import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    User,
    Mail,
    ShieldCheck,
    LogOut,
    ArrowLeft,
} from "lucide-react";

import api from "../api/axios";


function Settings() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    /* -------------------------------- */
    /* Load Current User               */
    /* -------------------------------- */

    useEffect(() => {

        const fetchCurrentUser = async () => {

            try {

                const response = await api.get("/users/me");

                setUser(response.data);

            } catch (error) {

                console.error(
                    "Failed to load user:",
                    error
                );

                setError(
                    "Unable to load your account information."
                );

            } finally {

                setLoading(false);

            }
        };

        fetchCurrentUser();

    }, []);


    /* -------------------------------- */
    /* Logout                           */
    /* -------------------------------- */

    const handleLogout = () => {

        localStorage.removeItem("token");

        navigate("/login", {
            replace: true,
        });

    };


    /* -------------------------------- */
    /* Loading                          */
    /* -------------------------------- */

    if (loading) {

        return (

            <div className="flex min-h-[70vh] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600"></div>

                    <p className="text-sm text-slate-500">
                        Loading your account...
                    </p>

                </div>

            </div>

        );

    }


    /* -------------------------------- */
    /* Error                            */
    /* -------------------------------- */

    if (error) {

        return (

            <div className="mx-auto max-w-3xl">

                <div className="rounded-xl border border-red-200 bg-red-50 p-6">

                    <p className="text-sm font-medium text-red-700">
                        {error}
                    </p>

                </div>

            </div>

        );

    }


    /* -------------------------------- */
    /* User Data                        */
    /* -------------------------------- */

    const userName = user?.name || "User";

    const userEmail = user?.email || "Not available";

    const userRole = user?.role || "USER";

    const userInitial =
        userName.charAt(0).toUpperCase();


    return (

        <div className="mx-auto max-w-4xl">


            {/* ================================= */}
            {/* Header                            */}
            {/* ================================= */}

            <div className="mb-8">

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
                >

                    <ArrowLeft size={16} />

                    Back

                </button>


                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Settings
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage your InterviewIQ account information.
                </p>

            </div>


            {/* ================================= */}
            {/* Profile Card                      */}
            {/* ================================= */}

            <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


                {/* Profile Header */}

                <div className="border-b border-slate-100 px-6 py-5">

                    <h2 className="text-base font-semibold text-slate-900">
                        Profile
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Your account information.
                    </p>

                </div>


                {/* Profile Content */}

                <div className="p-6">


                    {/* Avatar */}

                    <div className="mb-8 flex items-center gap-4">

                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-xl font-bold text-violet-700">

                            {userInitial}

                        </div>

                        <div>

                            <h3 className="text-lg font-semibold text-slate-900">
                                {userName}
                            </h3>

                            <p className="text-sm text-slate-500">
                                {userEmail}
                            </p>

                        </div>

                    </div>


                    {/* Information Grid */}

                    <div className="grid gap-4 md:grid-cols-2">


                        {/* Name */}

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                            <div className="mb-2 flex items-center gap-2">

                                <User
                                    size={17}
                                    className="text-slate-400"
                                    strokeWidth={1.8}
                                />

                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Name
                                </span>

                            </div>

                            <p className="text-sm font-semibold text-slate-900">
                                {userName}
                            </p>

                        </div>


                        {/* Email */}

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                            <div className="mb-2 flex items-center gap-2">

                                <Mail
                                    size={17}
                                    className="text-slate-400"
                                    strokeWidth={1.8}
                                />

                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Email
                                </span>

                            </div>

                            <p className="break-all text-sm font-semibold text-slate-900">
                                {userEmail}
                            </p>

                        </div>


                        {/* Role */}

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                            <div className="mb-2 flex items-center gap-2">

                                <ShieldCheck
                                    size={17}
                                    className="text-slate-400"
                                    strokeWidth={1.8}
                                />

                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Role
                                </span>

                            </div>

                            <div className="flex items-center gap-2">

                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                        userRole === "ADMIN"
                                            ? "bg-violet-100 text-violet-700"
                                            : "bg-slate-200 text-slate-700"
                                    }`}
                                >
                                    {userRole}
                                </span>

                            </div>

                        </div>


                        {/* Account Status */}

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                            <div className="mb-2 flex items-center gap-2">

                                <ShieldCheck
                                    size={17}
                                    className="text-slate-400"
                                    strokeWidth={1.8}
                                />

                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Account Status
                                </span>

                            </div>

                            <div className="flex items-center gap-2">

                                <span className="h-2 w-2 rounded-full bg-green-500"></span>

                                <span className="text-sm font-semibold text-slate-900">
                                    Active
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ================================= */}
            {/* Account Actions                   */}
            {/* ================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


                <div className="border-b border-slate-100 px-6 py-5">

                    <h2 className="text-base font-semibold text-slate-900">
                        Account
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage your current session.
                    </p>

                </div>


                <div className="p-6">

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-3 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >

                        <LogOut
                            size={17}
                            strokeWidth={1.8}
                        />

                        Logout

                    </button>

                </div>

            </div>

        </div>

    );

}


export default Settings;
import { useEffect, useState } from "react";

import {
    LayoutDashboard,
    BriefcaseBusiness,
    MessageSquare,
    BookOpen,
    Settings,
    LogOut,
    ChevronUp,
    ShieldCheck,
    X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import api from "../api/axios";


const navigation = [
    {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Interviews",
        path: "/interviews",
        icon: BriefcaseBusiness,
    },
    {
        name: "Questions",
        path: "/questions",
        icon: MessageSquare,
    },
    {
        name: "Journal",
        path: "/journal",
        icon: BookOpen,
    },
];


function Sidebar({ mobileOpen = false, onClose = () => {} }) {

    const navigate = useNavigate();

    const [profileOpen, setProfileOpen] = useState(false);

    const [user, setUser] = useState(null);


    /* -------------------------------- */
    /* Get Current Logged-In User       */
    /* -------------------------------- */

    useEffect(() => {

        const fetchCurrentUser = async () => {

            try {

                const response = await api.get("/users/me");

                setUser(response.data);

            } catch (error) {

                console.error(
                    "Failed to load current user:",
                    error
                );

                // If the token is invalid/expired,
                // send the user back to login.
                if (
                    error.response?.status === 401 ||
                    error.response?.status === 403
                ) {

                    localStorage.removeItem("token");

                    navigate("/login", {
                        replace: true,
                    });
                }
            }
        };

        fetchCurrentUser();

    }, [navigate]);


    /* -------------------------------- */
    /* Logout                           */
    /* -------------------------------- */

    const handleLogout = () => {

        // Remove JWT
        localStorage.removeItem("token");

        // Close profile menu
        setProfileOpen(false);

        // Redirect to login
        navigate("/login", {
            replace: true,
        });
    };


    /* -------------------------------- */
    /* User Display Data                */
    /* -------------------------------- */

    const userName = user?.name || "User";

    const userRole = user?.role || "USER";

    const userInitial =
        userName.charAt(0).toUpperCase();


    return (

        <>
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={onClose}
                    className="fixed inset-0 z-30 bg-slate-900/20 md:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 md:translate-x-0 md:shadow-none ${
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >


            {/* ================================ */}
            {/* Logo                             */}
            {/* ================================ */}

            <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">

                <h1 className="text-2xl font-bold tracking-tight text-slate-900">

                    Interview

                    <span className="text-violet-600">
                        IQ
                    </span>

                </h1>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
                    aria-label="Close navigation"
                >
                    <X size={19} />
                </button>

            </div>


            {/* ================================ */}
            {/* Navigation                       */}
            {/* ================================ */}

            <nav className="flex-1 px-4 py-6">

                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Main
                </p>


                <div className="space-y-1">

                    {/* Main Navigation */}

                    {navigation.map((item) => {

                        const Icon = item.icon;

                        return (

                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-violet-50 text-violet-700"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`
                                }
                            >

                                <Icon
                                    size={19}
                                    strokeWidth={1.8}
                                />

                                <span>
                                    {item.name}
                                </span>

                            </NavLink>

                        );

                    })}


                    {/* ================================ */}
                    {/* Admin Navigation                 */}
                    {/* ================================ */}

                    {userRole === "ADMIN" && (

                        <NavLink
                            to="/admin"
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                    isActive
                                        ? "bg-violet-50 text-violet-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`
                            }
                        >

                            <ShieldCheck
                                size={19}
                                strokeWidth={1.8}
                            />

                            <span>
                                Admin
                            </span>

                        </NavLink>

                    )}

                </div>


                {/* ================================ */}
                {/* Settings                         */}
                {/* ================================ */}

                <div className="mt-8">

                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Settings
                    </p>


                    <NavLink
                        to="/settings"
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                isActive
                                    ? "bg-violet-50 text-violet-700"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`
                        }
                    >

                        <Settings
                            size={19}
                            strokeWidth={1.8}
                        />

                        <span>
                            Settings
                        </span>

                    </NavLink>

                </div>

            </nav>


            {/* ================================ */}
            {/* User Profile                     */}
            {/* ================================ */}

            <div className="relative border-t border-slate-200 p-4">


                {/* Profile Button */}

                <button
                    type="button"
                    onClick={() =>
                        setProfileOpen(!profileOpen)
                    }
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-slate-50"
                >


                    {/* Avatar */}

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">

                        {userInitial}

                    </div>


                    {/* User Info */}

                    <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-semibold text-slate-900">

                            {userName}

                        </p>

                        <p className="truncate text-xs uppercase text-slate-500">

                            {userRole}

                        </p>

                    </div>


                    {/* Arrow */}

                    <ChevronUp
                        size={16}
                        strokeWidth={1.8}
                        className={`shrink-0 text-slate-400 transition-transform ${
                            profileOpen
                                ? "rotate-0"
                                : "rotate-180"
                        }`}
                    />

                </button>


                {/* ================================ */}
                {/* Profile Menu                     */}
                {/* ================================ */}

                {profileOpen && (

                    <div className="absolute bottom-[82px] left-4 right-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">


                        {/* Settings */}

                        <button
                            type="button"
                            onClick={() => {

                                setProfileOpen(false);
                                onClose();

                                navigate("/settings");

                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >

                            <Settings
                                size={17}
                                strokeWidth={1.8}
                            />

                            <span>
                                Settings
                            </span>

                        </button>


                        {/* Divider */}

                        <div className="border-t border-slate-100"></div>


                        {/* Logout */}

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >

                            <LogOut
                                size={17}
                                strokeWidth={1.8}
                            />

                            <span>
                                Logout
                            </span>

                        </button>

                    </div>

                )}

            </div>

            </aside>
        </>

    );
}


export default Sidebar;

import { useEffect, useState } from "react";

import {
    Users,
    BriefcaseBusiness,
    MessageSquare,
    TrendingUp,
    Search,
    ShieldCheck,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
} from "lucide-react";

import api from "../api/axios";


function AdminDashboard() {

    /* ==========================================
       STATE
    ========================================== */

    const [dashboard, setDashboard] = useState(null);

    const [users, setUsers] = useState([]);

    const [interviews, setInterviews] = useState([]);

    const [currentUser, setCurrentUser] = useState(null);

    const [userSearch, setUserSearch] = useState("");

    const [interviewSearch, setInterviewSearch] = useState("");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* ==========================================
       ROLE CHANGE STATE
    ========================================== */

    const [roleModalOpen, setRoleModalOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);

    const [updatingRole, setUpdatingRole] = useState(false);


    /* ==========================================
       DELETE STATE
    ========================================== */

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [deletingUser, setDeletingUser] = useState(null);

    const [deleting, setDeleting] = useState(false);


    /* ==========================================
       LOAD ADMIN DATA
    ========================================== */

    useEffect(() => {

        const loadAdminData = async () => {

            try {

                setLoading(true);

                setError("");


                const [
                    dashboardResponse,
                    usersResponse,
                    interviewsResponse,
                    currentUserResponse,
                ] = await Promise.all([

                    api.get("/dashboard"),

                    api.get("/users"),

                    api.get("/interviews/all"),

                    api.get("/users/me"),

                ]);


                setDashboard(
                    dashboardResponse.data
                );

                setUsers(
                    usersResponse.data
                );

                setInterviews(
                    interviewsResponse.data
                );

                setCurrentUser(
                    currentUserResponse.data
                );


            } catch (error) {

                console.error(
                    "Failed to load admin dashboard:",
                    error
                );


                if (error.response?.status === 401) {

                    setError(
                        "Your session has expired. Please login again."
                    );

                } else if (error.response?.status === 403) {

                    setError(
                        "You do not have permission to access the Admin Dashboard."
                    );

                } else {

                    setError(
                        "Failed to load Admin Dashboard."
                    );

                }

            } finally {

                setLoading(false);

            }

        };


        loadAdminData();

    }, []);


    /* ==========================================
       REFRESH USERS
    ========================================== */

    const refreshUsers = async () => {

        try {

            const response =
                await api.get("/users");

            setUsers(response.data);

        } catch (error) {

            console.error(
                "Failed to refresh users:",
                error
            );

        }

    };


    /* ==========================================
       FILTER USERS
    ========================================== */

    const filteredUsers = users.filter((user) => {

        const search =
            userSearch.toLowerCase().trim();

        if (!search) {
            return true;
        }

        return (

            user.name
                ?.toLowerCase()
                .includes(search)

            ||

            user.email
                ?.toLowerCase()
                .includes(search)

            ||

            user.role
                ?.toLowerCase()
                .includes(search)

        );

    });


    /* ==========================================
       FILTER INTERVIEWS
    ========================================== */

    const filteredInterviews =
        interviews.filter((interview) => {

            const search =
                interviewSearch
                    .toLowerCase()
                    .trim();

            if (!search) {
                return true;
            }

            return (

                interview.companyName
                    ?.toLowerCase()
                    .includes(search)

                ||

                interview.role
                    ?.toLowerCase()
                    .includes(search)

                ||

                interview.status
                    ?.toLowerCase()
                    .includes(search)

            );

        });


    /* ==========================================
       OPEN ROLE MODAL
    ========================================== */

    const openRoleModal = (user) => {

        setSelectedUser(user);

        setRoleModalOpen(true);

    };


    /* ==========================================
       CLOSE ROLE MODAL
    ========================================== */

    const closeRoleModal = () => {

        if (updatingRole) {
            return;
        }

        setRoleModalOpen(false);

        setSelectedUser(null);

    };


    /* ==========================================
       CHANGE USER ROLE
    ========================================== */

    const handleRoleChange = async () => {

        if (!selectedUser) {
            return;
        }


        const newRole =
            selectedUser.role === "ADMIN"
                ? "USER"
                : "ADMIN";


        try {

            setUpdatingRole(true);


            await api.put(
                `/users/${selectedUser.id}`,
                {
                    name: selectedUser.name,
                    email: selectedUser.email,
                    role: newRole,
                }
            );


            await refreshUsers();


            setRoleModalOpen(false);

            setSelectedUser(null);


        } catch (error) {

            console.error(
                "Failed to change user role:",
                error
            );


            alert(
                error.response?.data?.message ||
                "Failed to change user role."
            );

        } finally {

            setUpdatingRole(false);

        }

    };


    /* ==========================================
       OPEN DELETE MODAL
    ========================================== */

    const openDeleteModal = (user) => {

        /*
         * Prevent deleting yourself.
         */

        if (
            currentUser &&
            currentUser.id === user.id
        ) {

            alert(
                "You cannot delete your own account."
            );

            return;
        }


        setDeletingUser(user);

        setDeleteModalOpen(true);

    };


    /* ==========================================
       CLOSE DELETE MODAL
    ========================================== */

    const closeDeleteModal = () => {

        if (deleting) {
            return;
        }

        setDeleteModalOpen(false);

        setDeletingUser(null);

    };


    /* ==========================================
       DELETE USER
    ========================================== */

    const handleDeleteUser = async () => {

        if (!deletingUser) {
            return;
        }


        try {

            setDeleting(true);


            await api.delete(
                `/users/${deletingUser.id}`
            );


            await refreshUsers();


            setDeleteModalOpen(false);

            setDeletingUser(null);


        } catch (error) {

            console.error(
                "Failed to delete user:",
                error
            );


            const message =
                error.response?.data?.message ||
                error.response?.data ||
                "Failed to delete user.";


            alert(message);

        } finally {

            setDeleting(false);

        }

    };


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return (

            <div className="flex min-h-[70vh] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600"></div>

                    <p className="text-sm text-slate-500">
                        Loading Admin Dashboard...
                    </p>

                </div>

            </div>

        );

    }


    /* ==========================================
       ERROR
    ========================================== */

    if (error) {

        return (

            <div className="mx-auto max-w-4xl">

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

                    <div className="flex items-start gap-3">

                        <AlertTriangle
                            size={20}
                            className="mt-0.5 shrink-0 text-red-600"
                        />

                        <div>

                            <h2 className="font-semibold text-red-800">
                                Unable to load Admin Dashboard
                            </h2>

                            <p className="mt-1 text-sm text-red-700">
                                {error}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        );

    }


    /* ==========================================
       DASHBOARD VALUES
    ========================================== */

    const totalUsers = users.length;

    const totalInterviews =
        dashboard?.totalInterviews || 0;

    const totalQuestions =
        dashboard?.totalQuestions || 0;

    const selectedCount =
        dashboard?.selectedCount || 0;

    const averageConfidence =
        dashboard?.averageConfidenceLevel || 0;

    const appliedCount =
        dashboard?.appliedCount || 0;

    const inProgressCount =
        dashboard?.inProgressCount || 0;

    const rejectedCount =
        dashboard?.rejectedCount || 0;


    /* ==========================================
       RENDER
    ========================================== */

    return (

        <div className="space-y-7">


            {/* ==========================================
               HEADER
            ========================================== */}

            <div>

                <div className="mb-2 flex items-center gap-2">

                    <ShieldCheck
                        size={17}
                        className="text-violet-600"
                        strokeWidth={2}
                    />

                    <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                        Administrator
                    </span>

                </div>


                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Admin Dashboard
                </h1>


                <p className="mt-2 text-sm text-slate-500">
                    Monitor users, interviews, and application activity.
                </p>

            </div>


            {/* ==========================================
               STAT CARDS
            ========================================== */}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">


                {/* Total Users */}

                <StatCard
                    icon={Users}
                    label="Total Users"
                    value={totalUsers}
                />


                {/* Total Interviews */}

                <StatCard
                    icon={BriefcaseBusiness}
                    label="Total Interviews"
                    value={totalInterviews}
                />


                {/* Total Questions */}

                <StatCard
                    icon={MessageSquare}
                    label="Total Questions"
                    value={totalQuestions}
                />


                {/* Selected */}

                <StatCard
                    icon={TrendingUp}
                    label="Selected"
                    value={selectedCount}
                />


                {/* Confidence */}

                <StatCard
                    icon={TrendingUp}
                    label="Avg. Confidence"
                    value={`${Number(averageConfidence).toFixed(1)}/10`}
                />

            </div>


            {/* ==========================================
               OVERVIEW + SUMMARY
            ========================================== */}

            <div className="grid gap-5 lg:grid-cols-2">


                {/* Interview Overview */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <h2 className="text-lg font-semibold text-slate-900">
                        Interview Overview
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Application status across the platform.
                    </p>


                    <div className="mt-6 grid grid-cols-2 gap-3">


                        <OverviewCard
                            label="Applied"
                            value={appliedCount}
                            type="applied"
                        />


                        <OverviewCard
                            label="In Progress"
                            value={inProgressCount}
                            type="progress"
                        />


                        <OverviewCard
                            label="Selected"
                            value={selectedCount}
                            type="selected"
                        />


                        <OverviewCard
                            label="Rejected"
                            value={rejectedCount}
                            type="rejected"
                        />

                    </div>

                </div>


                {/* Platform Summary */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <h2 className="text-lg font-semibold text-slate-900">
                        Platform Summary
                    </h2>


                    <div className="mt-6 divide-y divide-slate-100">


                        <SummaryRow
                            label="Registered Users"
                            value={totalUsers}
                        />


                        <SummaryRow
                            label="Total Interviews"
                            value={totalInterviews}
                        />


                        <SummaryRow
                            label="Total Questions"
                            value={totalQuestions}
                        />


                        <SummaryRow
                            label="Selected Interviews"
                            value={selectedCount}
                        />

                    </div>

                </div>

            </div>


            {/* ==========================================
               USERS
            ========================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


                {/* Users Header */}

                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">

                    <div>

                        <h2 className="text-lg font-semibold text-slate-900">
                            Users
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage registered InterviewIQ users.
                        </p>

                    </div>


                    {/* Search */}

                    <div className="relative w-full md:w-64">

                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={userSearch}
                            onChange={(e) =>
                                setUserSearch(e.target.value)
                            }
                            placeholder="Search users..."
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />

                    </div>

                </div>


                {/* Users Table */}

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[760px]">

                        <thead>

                        <tr className="border-b border-slate-100 bg-slate-50">

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                User
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Email
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Role
                            </th>

                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Actions
                            </th>

                        </tr>

                        </thead>


                        <tbody>

                        {filteredUsers.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="4"
                                    className="px-6 py-12 text-center"
                                >

                                    <Users
                                        size={28}
                                        className="mx-auto mb-3 text-slate-300"
                                    />

                                    <p className="text-sm font-medium text-slate-600">
                                        No users found
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Try a different search.
                                    </p>

                                </td>

                            </tr>

                        ) : (

                            filteredUsers.map((user) => {

                                const isCurrentUser =
                                    currentUser?.id === user.id;

                                const initial =
                                    user.name
                                        ?.charAt(0)
                                        .toUpperCase() || "U";


                                return (

                                    <tr
                                        key={user.id}
                                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                                    >


                                        {/* User */}

                                        <td className="px-6 py-4">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">

                                                    {initial}

                                                </div>


                                                <div>

                                                    <div className="flex items-center gap-2">

                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {user.name}
                                                        </p>

                                                        {isCurrentUser && (

                                                            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-600">
                                                                    You
                                                                </span>

                                                        )}

                                                    </div>


                                                    <p className="text-xs text-slate-400">
                                                        ID #{user.id}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>


                                        {/* Email */}

                                        <td className="px-6 py-4">

                                            <p className="text-sm text-slate-600">
                                                {user.email}
                                            </p>

                                        </td>


                                        {/* Role */}

                                        <td className="px-6 py-4">

                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        user.role === "ADMIN"
                                                            ? "bg-violet-100 text-violet-700"
                                                            : "bg-slate-100 text-slate-600"
                                                    }`}
                                                >
                                                    {user.role}
                                                </span>

                                        </td>


                                        {/* Actions */}

                                        <td className="px-6 py-4">

                                            <div className="flex justify-end gap-2">


                                                {/* Change Role */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openRoleModal(user)
                                                    }
                                                    disabled={
                                                        isCurrentUser
                                                    }
                                                    title={
                                                        isCurrentUser
                                                            ? "You cannot change your own role"
                                                            : "Change role"
                                                    }
                                                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                                                        isCurrentUser
                                                            ? "cursor-not-allowed border-slate-100 text-slate-300"
                                                            : "border-slate-200 text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                                                    }`}
                                                >

                                                    <Pencil
                                                        size={14}
                                                    />

                                                    Role

                                                </button>


                                                {/* Delete */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDeleteModal(user)
                                                    }
                                                    disabled={
                                                        isCurrentUser
                                                    }
                                                    title={
                                                        isCurrentUser
                                                            ? "You cannot delete your own account"
                                                            : "Delete user"
                                                    }
                                                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                                                        isCurrentUser
                                                            ? "cursor-not-allowed border-slate-100 text-slate-300"
                                                            : "border-red-200 text-red-600 hover:bg-red-50"
                                                    }`}
                                                >

                                                    <Trash2
                                                        size={14}
                                                    />

                                                    Delete

                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                );

                            })

                        )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* ==========================================
               ALL INTERVIEWS
            ========================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


                {/* Header */}

                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">

                    <div>

                        <h2 className="text-lg font-semibold text-slate-900">
                            All Interviews
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Review interview activity across all users.
                        </p>

                    </div>


                    <div className="relative w-full md:w-64">

                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={interviewSearch}
                            onChange={(e) =>
                                setInterviewSearch(e.target.value)
                            }
                            placeholder="Search interviews..."
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />

                    </div>

                </div>


                {/* Interview Table */}

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[760px]">

                        <thead>

                        <tr className="border-b border-slate-100 bg-slate-50">

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Company
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Role
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Date
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Status
                            </th>

                        </tr>

                        </thead>


                        <tbody>

                        {filteredInterviews.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="4"
                                    className="px-6 py-12 text-center"
                                >

                                    <BriefcaseBusiness
                                        size={28}
                                        className="mx-auto mb-3 text-slate-300"
                                    />

                                    <p className="text-sm font-medium text-slate-600">
                                        No interviews found
                                    </p>

                                </td>

                            </tr>

                        ) : (

                            filteredInterviews.map((interview) => (

                                <tr
                                    key={interview.id}
                                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                                >

                                    <td className="px-6 py-4">

                                        <p className="text-sm font-semibold text-slate-900">
                                            {interview.companyName}
                                        </p>

                                        <p className="text-xs text-slate-400">
                                            Interview #{interview.id}
                                        </p>

                                    </td>


                                    <td className="px-6 py-4">

                                        <p className="text-sm text-slate-600">
                                            {interview.role}
                                        </p>

                                    </td>


                                    <td className="px-6 py-4">

                                        <p className="text-sm text-slate-600">
                                            {interview.applicationDate || "—"}
                                        </p>

                                    </td>


                                    <td className="px-6 py-4">

                                        <StatusBadge
                                            status={interview.status}
                                        />

                                    </td>

                                </tr>

                            ))

                        )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* ==========================================
               ROLE MODAL
            ========================================== */}

            {roleModalOpen && selectedUser && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">

                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">


                        {/* Header */}

                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                            <div>

                                <h3 className="text-lg font-semibold text-slate-900">
                                    Change User Role
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Update this user's access level.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={closeRoleModal}
                                disabled={updatingRole}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >

                                <X size={18} />

                            </button>

                        </div>


                        {/* Content */}

                        <div className="p-6">

                            <div className="mb-5 flex items-center gap-3 rounded-xl bg-slate-50 p-4">

                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700">

                                    {selectedUser.name
                                        ?.charAt(0)
                                        .toUpperCase()}

                                </div>


                                <div>

                                    <p className="text-sm font-semibold text-slate-900">
                                        {selectedUser.name}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        {selectedUser.email}
                                    </p>

                                </div>

                            </div>


                            <div className="rounded-xl border border-slate-200 p-4">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-sm font-medium text-slate-900">
                                            Current role
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {selectedUser.role}
                                        </p>

                                    </div>


                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                            selectedUser.role === "ADMIN"
                                                ? "bg-violet-100 text-violet-700"
                                                : "bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        {selectedUser.role}
                                    </span>

                                </div>


                                <div className="my-4 border-t border-slate-100"></div>


                                <p className="text-sm text-slate-600">

                                    Change this user to{" "}

                                    <span className="font-semibold text-slate-900">

                                        {selectedUser.role === "ADMIN"
                                            ? "USER"
                                            : "ADMIN"}

                                    </span>

                                    ?

                                </p>

                            </div>

                        </div>


                        {/* Footer */}

                        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">

                            <button
                                type="button"
                                onClick={closeRoleModal}
                                disabled={updatingRole}
                                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                onClick={handleRoleChange}
                                disabled={updatingRole}
                                className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {updatingRole
                                    ? "Updating..."
                                    : "Change Role"}

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ==========================================
               DELETE MODAL
            ========================================== */}

            {deleteModalOpen && deletingUser && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">

                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">


                        {/* Header */}

                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">

                                    <AlertTriangle
                                        size={19}
                                        className="text-red-600"
                                    />

                                </div>


                                <div>

                                    <h3 className="text-lg font-semibold text-slate-900">
                                        Delete User
                                    </h3>

                                    <p className="text-sm text-slate-500">
                                        This action cannot be undone.
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >

                                <X size={18} />

                            </button>

                        </div>


                        {/* Content */}

                        <div className="p-6">

                            <p className="text-sm leading-6 text-slate-600">

                                Are you sure you want to delete{" "}

                                <span className="font-semibold text-slate-900">

                                    {deletingUser.name}

                                </span>

                                ?

                            </p>


                            <div className="mt-4 rounded-xl bg-red-50 p-4">

                                <p className="text-xs leading-5 text-red-700">

                                    The user's account will be removed. If this
                                    user has interviews or related records,
                                    the database may prevent the deletion.

                                </p>

                            </div>

                        </div>


                        {/* Footer */}

                        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">

                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                onClick={handleDeleteUser}
                                disabled={deleting}
                                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {deleting
                                    ? "Deleting..."
                                    : "Delete User"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


/* ==========================================
   STAT CARD
========================================== */

function StatCard({
                      icon: Icon,
                      label,
                      value,
                  }) {

    return (

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">

                <Icon
                    size={19}
                    className="text-violet-600"
                    strokeWidth={1.8}
                />

            </div>


            <p className="text-xs font-semibold text-slate-500">
                {label}
            </p>


            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                {value}
            </p>

        </div>

    );

}


/* ==========================================
   OVERVIEW CARD
========================================== */

function OverviewCard({
                          label,
                          value,
                          type,
                      }) {

    const styles = {

        applied:
            "bg-indigo-50 text-indigo-700",

        progress:
            "bg-blue-50 text-blue-700",

        selected:
            "bg-emerald-50 text-emerald-700",

        rejected:
            "bg-red-50 text-red-700",

    };


    return (

        <div
            className={`rounded-xl p-4 ${styles[type]}`}
        >

            <p className="text-xs font-semibold">
                {label}
            </p>

            <p className="mt-2 text-2xl font-bold">
                {value}
            </p>

        </div>

    );

}


/* ==========================================
   SUMMARY ROW
========================================== */

function SummaryRow({
                        label,
                        value,
                    }) {

    return (

        <div className="flex items-center justify-between py-4">

            <span className="text-sm text-slate-500">
                {label}
            </span>

            <span className="text-sm font-semibold text-slate-900">
                {value}
            </span>

        </div>

    );

}


/* ==========================================
   STATUS BADGE
========================================== */

function StatusBadge({
                         status,
                     }) {

    const styles = {

        APPLIED:
            "bg-indigo-50 text-indigo-600",

        IN_PROGRESS:
            "bg-blue-50 text-blue-600",

        SELECTED:
            "bg-emerald-50 text-emerald-600",

        REJECTED:
            "bg-red-50 text-red-600",

    };


    const style =
        styles[status] ||
        "bg-slate-100 text-slate-600";


    const label =
        status
            ?.replace("_", " ")
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );


    return (

        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
        >
            {label}
        </span>

    );

}


export default AdminDashboard;
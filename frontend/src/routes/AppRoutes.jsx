import { useEffect, useState } from "react";
import {
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import Dashboard from "../pages/Dashboard";
import Interviews from "../pages/Interviews";
import Questions from "../pages/Questions";
import Journal from "../pages/Journal";
import Settings from "../pages/Settings";
import Login from "../pages/Login";
import InterviewDetails from "../pages/InterviewDetails";
import EditInterview from "../pages/EditInterview";
import AdminDashboard from "../pages/AdminDashboard";

import api from "../api/axios";


/* -------------------------------- */
/* Protected Route                  */
/* -------------------------------- */

function ProtectedRoute({ children }) {

    const token = localStorage.getItem("token");

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return children;
}


/* -------------------------------- */
/* Admin Route                      */
/* -------------------------------- */

function AdminRoute({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchCurrentUser = async () => {

            try {

                const response = await api.get("/users/me");

                setUser(response.data);

            } catch (error) {

                console.error(
                    "Failed to verify admin access:",
                    error
                );

                setUser(null);

            } finally {

                setLoading(false);

            }
        };

        fetchCurrentUser();

    }, []);


    /* -------------------------------- */
    /* Loading                          */
    /* -------------------------------- */

    if (loading) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">

                <div className="text-center">

                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600"></div>

                    <p className="text-sm text-slate-500">
                        Checking access...
                    </p>

                </div>

            </div>
        );

    }


    /* -------------------------------- */
    /* Not Admin                        */
    /* -------------------------------- */

    if (!user || user.role !== "ADMIN") {

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );

    }


    /* -------------------------------- */
    /* Admin                            */
    /* -------------------------------- */

    return children;
}


/* -------------------------------- */
/* App Routes                       */
/* -------------------------------- */

function AppRoutes() {

    return (

        <Routes>


            {/* ================================ */}
            {/* Public Routes                    */}
            {/* ================================ */}

            <Route
                path="/login"
                element={<Login />}
            />


            {/* ================================ */}
            {/* Protected Routes                 */}
            {/* ================================ */}

            <Route
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >


                {/* -------------------------------- */}
                {/* Dashboard                         */}
                {/* -------------------------------- */}

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />


                {/* -------------------------------- */}
                {/* Interviews                        */}
                {/* -------------------------------- */}

                <Route
                    path="/interviews"
                    element={<Interviews />}
                />


                {/* -------------------------------- */}
                {/* Questions                         */}
                {/* -------------------------------- */}

                <Route
                    path="/questions"
                    element={<Questions />}
                />


                {/* -------------------------------- */}
                {/* Journal                           */}
                {/* -------------------------------- */}

                <Route
                    path="/journal"
                    element={<Journal />}
                />


                {/* -------------------------------- */}
                {/* Settings                          */}
                {/* -------------------------------- */}

                <Route
                    path="/settings"
                    element={<Settings />}
                />


                {/* -------------------------------- */}
                {/* Interview Details                 */}
                {/* -------------------------------- */}

                <Route
                    path="/interviews/:id"
                    element={<InterviewDetails />}
                />


                {/* -------------------------------- */}
                {/* Edit Interview                    */}
                {/* -------------------------------- */}

                <Route
                    path="/interviews/:id/edit"
                    element={<EditInterview />}
                />


                {/* -------------------------------- */}
                {/* Admin Dashboard                   */}
                {/* -------------------------------- */}

                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />

            </Route>


            {/* ================================ */}
            {/* Unknown Routes                   */}
            {/* ================================ */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />

        </Routes>

    );

}


export default AppRoutes;
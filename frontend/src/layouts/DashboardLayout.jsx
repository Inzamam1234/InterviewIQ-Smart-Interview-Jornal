import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
    return (
        <div className="flex min-h-screen bg-slate-50">

            <Sidebar />

            <main className="flex-1">
                <Outlet />
            </main>

        </div>
    );
}

export default DashboardLayout;
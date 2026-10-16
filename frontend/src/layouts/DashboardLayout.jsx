import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">

            <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
                aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileMenuOpen}
            >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Sidebar
                mobileOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />

            <div className="flex min-h-screen md:pl-64">
                <main className="min-w-0 flex-1 pt-14 md:pt-0">
                    <Outlet />
                </main>
            </div>

        </div>
    );
}

export default DashboardLayout;

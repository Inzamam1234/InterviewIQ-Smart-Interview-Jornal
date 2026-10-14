import { Bell, Search } from "lucide-react";

const Topbar = () => {
    return (
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">

            <div>
                <h2 className="text-lg font-semibold text-gray-900">
                    Dashboard
                </h2>

                <p className="text-sm text-gray-500">
                    Track and manage your interview journey.
                </p>
            </div>

            <div className="flex items-center gap-5">

                <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                    <Search size={17} className="text-gray-400" />

                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-40 bg-transparent text-sm outline-none placeholder:text-gray-400"
                    />
                </div>

                <button className="relative rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900">
                    <Bell size={20} strokeWidth={1.8} />

                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-600" />
                </button>

            </div>

        </header>
    );
};

export default Topbar;
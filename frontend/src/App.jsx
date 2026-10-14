import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
    return (
        <>
            <AppRoutes />

            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: {
                        borderRadius: "10px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        fontWeight: "500",
                    },
                }}
            />
        </>
    );
}

export default App;
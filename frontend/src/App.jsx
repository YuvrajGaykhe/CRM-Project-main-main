import { Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <div className="min-h-screen w-full bg-[var(--sigma-bg)] text-[var(--sigma-text)]">
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </div>
  );
};

export default App;

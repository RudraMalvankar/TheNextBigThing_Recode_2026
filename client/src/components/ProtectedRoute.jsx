import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-black rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

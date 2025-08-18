import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/Auth/AuthContext";

const ProtectedRoute = () => {
    const {user, loading} = useAuthContext();
    if(loading) return <div>Loading...</div>;
    return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute

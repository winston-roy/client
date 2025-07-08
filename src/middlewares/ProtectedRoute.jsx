import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
    const user = useSelector((store) => store.user);

    if (user === null) {
        // Show a loader or nothing until user is loaded
        return <div className="text-center mt-20">Loading...</div>;
    }

    return user._id ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;

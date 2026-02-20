import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const [status, setStatus] = useState('loading'); // 'loading' | 'authorized' | 'unauthenticated'

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            setStatus('authorized');
        } else {
            setStatus('unauthenticated');
        }
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-white/50 text-sm">Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default ProtectedRoute;

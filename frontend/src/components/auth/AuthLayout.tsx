import React from 'react';
import type { ReactNode } from'react';

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
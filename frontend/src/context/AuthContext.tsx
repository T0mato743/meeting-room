import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from'react';
import { authApi } from '../api/auth';
import { notification } from '../utils/notification';

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (token: string, userData: AuthUser) => void;
    logout: () => void;
    loading: boolean;
}

interface AuthUser {
    userId: number;
    username: string;
    name: string;
    role: string;
    token: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await authApi.getCurrentUser(token);
                    login(token, userData);
                } catch (error) {
                    console.error(error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = (token: string, userData: AuthUser) => {
        localStorage.setItem('token', token);
        setUser(userData);
        notification.success('登录成功', `欢迎回来，${userData.name}`);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        notification.info('已登出', '您已成功登出系统');
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { useAuth };

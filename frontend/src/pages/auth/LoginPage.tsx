import React from 'react';
import { Row, Col } from 'antd';
import { motion } from 'framer-motion';
import LoginForm from '@/components/auth/LoginForm';
import './AuthPage.scss';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    in: {
        opacity: 1,
        y: 0,
    },
    out: {
        opacity: 0,
        y: -20,
    },
};

const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
};

const LoginPage: React.FC = () => {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="auth-page"
        >
            <Row
                justify="center"
                align="middle"
                className="auth-container"
                style={{ width: '90%', maxWidth: '1000px' }}
            >
                <Col xs={0} md={12} className="auth-banner">
                    <div className="logo">
                        <div className="logo-icon">MR</div>
                    </div>
                    <div className="banner-content">
                        <div className="banner-text">
                            <h1>会议室预订系统</h1>
                            <p>高效管理您的会议室资源，简化预订流程</p>
                        </div>
                    </div>
                </Col>
                <Col xs={24} md={12} className="auth-form-wrapper">
                    <div className="auth-form-container">
                        <LoginForm />
                    </div>
                </Col>
            </Row>
        </motion.div>
    );
};

export default LoginPage;
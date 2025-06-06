import React from 'react';
import { Row, Col } from 'antd';
import RegisterForm from '@/components/auth/RegisterForm';
import './AuthPage.scss';
import { motion } from 'framer-motion';

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

const RegisterPage: React.FC = () => {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="auth-page"
        >
            <Row justify="center" align="middle" className="auth-container" style={{ width: '90%', maxWidth: '1000px' }}>
                <Col xs={0} sm={12} className="auth-banner">
                    <div className="logo">
                        <div className="logo-icon">MR</div>
                    </div>
                    <div className="banner-content">
                        <div className="banner-text">
                            <h1>开启高效会议室管理</h1>
                            <p>快速预订，便捷管理，提升工作效率</p>
                        </div>
                    </div>
                </Col>
                <Col xs={24} sm={12} className="auth-form-wrapper">
                    <div className="auth-form-container">
                        <RegisterForm />
                    </div>
                </Col>
            </Row>
        </motion.div>
    );
};

export default RegisterPage;
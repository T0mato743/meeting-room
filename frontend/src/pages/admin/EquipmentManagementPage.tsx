import React, { useState, useEffect } from 'react';
import {
    Button, Table, Space, Modal, Form, Input,
    message, Popconfirm, Card, Row, Col, Tag
} from 'antd';
import { PlusOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { meetingRoomApi } from '@/api/meetingRoom';
import type { Equipment } from '@/types/types';
import './AdminPage.scss';

const EquipmentManagement: React.FC = () => {
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchEquipments();
    }, []);

    const fetchEquipments = async () => {
        setLoading(true);
        try {
            const data = await meetingRoomApi.getAllEquipments();
            if (Array.isArray(data)) {
                setEquipments(data);
            }
        } catch (error) {
            message.error('获取设备列表失败');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        form.resetFields();
        setVisible(true);
    };

    const handleDelete = async (equipmentId: number) => {
        try {
            await meetingRoomApi.deleteEquipment(equipmentId);
            message.success('设备删除成功');
            fetchEquipments();
        } catch (error) {
            message.error('删除设备失败');
            console.log(error);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await meetingRoomApi.createEquipment(values);
            message.success('设备创建成功');
            setVisible(false);
            fetchEquipments();
        } catch (error) {
            console.error('提交失败:', error);
        }
    };

    const columns = [
        {
            title: '设备名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => (
                <Tag color="blue" style={{ fontSize: 14, padding: '4px 8px' }}>
                    {text}
                </Tag>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: Equipment) => (
                <Space size="middle">
                    <Popconfirm
                        title="确定删除这个设备吗？"
                        onConfirm={() => handleDelete(record.equipment_id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            className="action-button delete-btn"
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-page equipment-management">
            <div className="page-header">
                <h1>设备管理</h1>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                        className="add-equipment-btn"
                    >
                        添加设备
                    </Button>
                </div>

                {/* 卡片视图模式 - 可选 */}
                <Row gutter={[16, 16]} style={{ display: 'none' }}>
                    {equipments.map(equipment => (
                        <Col xs={24} sm={12} md={8} lg={6} key={equipment.equipment_id}>
                            <Card className="equipment-card">
                                <div className="equipment-name">
                                    <SettingOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                    {equipment.name}
                                </div>
                                <div className="equipment-actions">
                                    <Popconfirm
                                        title="确定删除这个设备吗？"
                                        onConfirm={() => handleDelete(equipment.equipment_id)}
                                        okText="确定"
                                        cancelText="取消"
                                    >
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                        >
                                            删除
                                        </Button>
                                    </Popconfirm>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* 表格视图模式 */}
                <Table
                    dataSource={equipments}
                    columns={columns}
                    rowKey="equipment_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </div>

            <Modal
                title="添加设备"
                open={visible}
                onOk={handleSubmit}
                onCancel={() => setVisible(false)}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="设备名称"
                        rules={[{ required: true, message: '请输入设备名称' }]}
                    >
                        <Input placeholder="例如：投影仪、音响系统等" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EquipmentManagement;
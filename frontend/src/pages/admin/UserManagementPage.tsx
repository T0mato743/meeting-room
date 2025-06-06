import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, Tag, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { userApi } from '@/api/user';
import type { User } from '@/types/types';
import './AdminPage.scss';

const { Option } = Select;

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    useEffect(() => {
        fetchUsers();
    }, [pagination.current, pagination.pageSize]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const result = await userApi.listUsers({
                page: pagination.current,
                limit: pagination.pageSize
            });
            setUsers(result.data);
            setPagination({ ...pagination, total: result.total });
        } catch (error) {
            message.error('获取用户列表失败');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pagination: any) => {
        setPagination(pagination);
    };

    const handleEdit = (user: User) => {
        form.setFieldsValue({
            ...user,
            status: user.status
        });
        setEditingUser(user);
        setVisible(true);
    };

    const handleDelete = async (userId: number) => {
        try {
            await userApi.deleteUser(userId);
            message.success('用户删除成功');
            fetchUsers();
        } catch (error) {
            message.error('删除用户失败');
            console.log(error);

        }
    };

    const handleStatusChange = async (userId: number, status: string) => {
        try {
            await userApi.updateUserStatus(userId, status);
            message.success('状态更新成功');
            fetchUsers();
        } catch (error) {
            message.error('状态更新失败');
            console.log(error);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingUser) {
                await userApi.updateUserStatus(editingUser.user_id, values.status);
                message.success('用户状态更新成功');
            }
            setVisible(false);
            fetchUsers();
        } catch (error) {
            console.error('提交失败:', error);
        }
    };

    const columns = [
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '姓名',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => {
                const roleMap: Record<string, string> = {
                    admin: '管理员',
                    staff: '员工',
                    customer: '客户'
                };
                return roleMap[role] || role;
            }
        },
        {
            title: '公司',
            dataIndex: 'company',
            key: 'company',
        },
        {
            title: '手机',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const statusMap: Record<string, { color: string; text: string }> = {
                    正常: { color: 'green', text: '正常' },
                    冻结: { color: 'red', text: '冻结' },
                    待审核: { color: 'orange', text: '待审核' }
                };
                const statusInfo = statusMap[status] || { color: 'default', text: status };
                return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
            },
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: User) => (
                <div>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定删除这个用户吗？"
                        onConfirm={() => handleDelete(record.user_id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            删除
                        </Button>
                    </Popconfirm>
                    {record.status !== '正常' && (
                        <Button
                            type="link"
                            onClick={() => handleStatusChange(record.user_id, '正常')}
                        >
                            激活
                        </Button>
                    )}
                    {record.status !== '冻结' && (
                        <Button
                            type="link"
                            danger
                            onClick={() => handleStatusChange(record.user_id, '冻结')}
                        >
                            冻结
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>用户管理</h1>
            </div>
            <div className="table-container">
                <Table
                    dataSource={users}
                    columns={columns}
                    rowKey="user_id"
                    loading={loading}
                    pagination={pagination}
                    onChange={handleTableChange}
                />
            </div>

            <Modal
                title="编辑用户状态"
                open={visible}
                onOk={handleSubmit}
                onCancel={() => setVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="status"
                        label="状态"
                        rules={[{ required: true, message: '请选择状态' }]}
                    >
                        <Select>
                            <Option value="正常">正常</Option>
                            <Option value="冻结">冻结</Option>
                            <Option value="待审核">待审核</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
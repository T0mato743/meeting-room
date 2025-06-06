import React, { useState, useEffect } from 'react';
import { Button, Table, Space, Modal, Form, Input, Select, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { meetingRoomApi } from '@/api/meetingRoom';
import type { Equipment, MeetingRoom } from '@/types/types';
import './AdminPage.scss';

const { Option } = Select;

const MeetingRoomManagement: React.FC = () => {
    const [rooms, setRooms] = useState<MeetingRoom[]>([]);
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null);

    useEffect(() => {
        fetchRooms();
        fetchEquipments();
    }, []);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const data = await meetingRoomApi.listMeetingRooms();
            if (Array.isArray(data)) {
                setRooms(data);
            }
        } catch (error) {
            message.error('获取会议室列表失败');
            setRooms([]);
            console.log(error);

        } finally {
            setLoading(false);
        }
    };

    const fetchEquipments = async () => {
        try {
            const data = await meetingRoomApi.getAllEquipments();
            if (Array.isArray(data)) {
                setEquipments(data);
            }
        } catch (error) {
            message.error('获取设备列表失败');
            console.log(error);
        }
    };

    const handleCreate = () => {
        form.resetFields();
        setEditingRoom(null);
        setVisible(true);
    };

    const handleEdit = (room: MeetingRoom) => {
        form.setFieldsValue({
            ...room,
            equipments: room.equipments?.map((e: Equipment) => e.equipment_id)
        });
        setEditingRoom(room);
        setVisible(true);
    };

    const handleDelete = async (roomId: number) => {
        Modal.confirm({
            title: '确认删除会议室',
            content: '确定要删除这个会议室吗？此操作不可恢复。',
            onOk: async () => {
                try {
                    await meetingRoomApi.deleteMeetingRoom(roomId);
                    message.success('会议室删除成功');
                    fetchRooms();
                } catch (error) {
                    message.error('删除会议室失败');
                    console.log(error);

                }
            }
        });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingRoom) {
                await meetingRoomApi.updateMeetingRoom(editingRoom.room_id, values);
                message.success('会议室更新成功');
            } else {
                await meetingRoomApi.createMeetingRoom(values);
                message.success('会议室创建成功');
            }
            setVisible(false);
            fetchRooms();
        } catch (error) {
            console.error('提交失败:', error);
        }
    };

    const columns = [
        {
            title: '会议室名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => <Tag color={type === '教室型' ? 'blue' : 'green'}>{type}</Tag>,
        },
        {
            title: '容量',
            dataIndex: 'capacity',
            key: 'capacity',
        },
        {
            title: '价格(元/小时)',
            dataIndex: 'price_per_hour',
            key: 'price_per_hour',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const statusMap: Record<string, { color: string; text: string }> = {
                    空闲: { color: 'green', text: '空闲' },
                    锁定: { color: 'orange', text: '锁定' },
                    预定: { color: 'blue', text: '预定' },
                    使用: { color: 'red', text: '使用中' },
                    维护: { color: 'gray', text: '维护中' },
                };
                const statusInfo = statusMap[status] || { color: 'default', text: status };
                return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
            },
        },
        {
            title: '设备',
            dataIndex: 'equipments',
            key: 'equipments',
            render: (equipments: Equipment[]) => (
                <span>
                    {equipments?.map(e => e.name).join(', ')}
                </span>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: MeetingRoom) => (
                <Space size="middle">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.room_id)}
                    >
                        删除
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-page meeting-room-management">
            <div className="page-header">
                <h1>会议室管理</h1>
            </div>
            <div className="table-container">
                <div className="table-header" style={{ marginBottom: 16 }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        添加会议室
                    </Button>
                </div>

                <Table
                    dataSource={rooms}
                    columns={columns}
                    rowKey="room_id"
                    loading={loading}
                />
            </div>
            
            <Modal
                title={editingRoom ? '编辑会议室' : '添加会议室'}
                open={visible}
                onOk={handleSubmit}
                onCancel={() => setVisible(false)}
                destroyOnHidden
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="会议室名称"
                        rules={[{ required: true, message: '请输入会议室名称' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="类型"
                        rules={[{ required: true, message: '请选择会议室类型' }]}
                    >
                        <Select>
                            <Option value="教室型">教室型</Option>
                            <Option value="圆桌型">圆桌型</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="capacity"
                        label="容量"
                        rules={[{ required: true, message: '请输入容量' }]}
                    >
                        <Input type="number" min={1} />
                    </Form.Item>

                    <Form.Item
                        name="price_per_hour"
                        label="价格(元/小时)"
                        rules={[{ required: true, message: '请输入价格' }]}
                    >
                        <Input type="number" min={0} step={0.01} />
                    </Form.Item>

                    <Form.Item
                        name="equipments"
                        label="设备"
                    >
                        <Select mode="multiple" placeholder="请选择设备">
                            {equipments.map(e => (
                                <Option key={e.equipment_id} value={e.equipment_id}>
                                    {e.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {editingRoom && (
                        <Form.Item
                            name="status"
                            label="状态"
                            rules={[{ required: true, message: '请选择状态' }]}
                        >
                            <Select>
                                <Option value="空闲">空闲</Option>
                                <Option value="锁定">锁定</Option>
                                <Option value="预定">预定</Option>
                                <Option value="使用">使用中</Option>
                                <Option value="维护">维护中</Option>
                            </Select>
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default MeetingRoomManagement;
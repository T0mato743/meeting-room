import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Badge,
    Button,
    Tooltip,
    Popconfirm,
    Typography,
    Divider,
    message,
    Skeleton,
    Empty
} from 'antd';
import {
    SyncOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { meetingRoomApi } from '@/api/meetingRoom';
import type { MeetingRoom } from '@/types/types';
import './WorkPage.scss';

const { Title } = Typography;

const StaffWorkPage: React.FC = () => {
    const [rooms, setRooms] = useState<MeetingRoom[]>([]);
    const [loading, setLoading] = useState(true);

    // 获取所有会议室及其状态
    const fetchRooms = async () => {
        setLoading(true);
        try {
            const data = await meetingRoomApi.listMeetingRooms();
            if (Array.isArray(data)) {
                setRooms(data);
            }
        } catch (error) {
            message.error('获取会议室信息失败');
            setRooms([]);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    // 设置会议室为使用中状态
    const setToInUse = async (roomId: number) => {
        try {
            await meetingRoomApi.updateMeetingRoom(roomId, { status: '使用' });
            message.success('会议室已设置为使用中');
            fetchRooms();
        } catch (error) {
            message.error('操作失败');
            console.error(error);
        }
    };

    // 设置会议室为空闲状态
    const setToVacant = async (roomId: number) => {
        try {
            await meetingRoomApi.updateMeetingRoom(roomId, { status: '空闲' });
            message.success('会议室已设置为空闲');
            fetchRooms();
        } catch (error) {
            message.error('操作失败');
            console.error(error);
        }
    };

    // 设置会议室为维护状态
    const setToMaintenance = async (roomId: number) => {
        try {
            await meetingRoomApi.updateMeetingRoom(roomId, { status: '维护' });
            message.success('会议室已设置为维护中');
            fetchRooms();
        } catch (error) {
            message.error('操作失败');
            console.error(error);
        }
    };

    // 根据状态获取标签颜色
    const getStatusColor = (status: string) => {
        switch (status) {
            case '空闲': return 'green';
            case '预定': return 'blue';
            case '使用': return 'orange';
            case '维护': return 'red';
            default: return 'gray';
        }
    };

    // 根据状态获取状态文本
    const getStatusText = (status: string) => {
        switch (status) {
            case '空闲': return '空闲';
            case '预定': return '已预定';
            case '使用': return '使用中';
            case '维护': return '维护中';
            default: return '未知';
        }
    };

    // 根据状态获取图标
    const getStatusIcon = (status: string) => {
        switch (status) {
            case '空闲': return <CheckCircleOutlined />;
            case '预定': return <ClockCircleOutlined />;
            case '使用': return <SyncOutlined spin />;
            case '维护': return <WarningOutlined />;
            default: return null;
        }
    };

    // 根据状态获取卡片类名
    const getStatusClass = (status: string) => {
        switch (status) {
            case '空闲': return 'status-free';
            case '预定': return 'status-reserved';
            case '使用': return 'status-in-use';
            case '维护': return 'status-maintenance';
            default: return '';
        }
    };

    // 渲染会议室状态卡片 - 优化宽度
    const renderRoomCard = (room: MeetingRoom) => (
        <Col xs={24} sm={24} md={12} lg={8} xl={8} xxl={18} key={room.room_id}>
            <Card
                className={`room-card ${getStatusClass(room.status)}`}
                title={room.name}
                loading={loading}
                style={{ height: '100%', borderRadius: '8px' }}
            >
                <div className="room-details">
                    <div className="room-status">
                        {getStatusIcon(room.status)}
                        <Badge
                            status={getStatusColor(room.status) as any}
                            text={<span style={{ fontSize: '16px' }}>{getStatusText(room.status)}</span>}
                        />
                    </div>

                    <div className="room-info">

                        <span className="room-type-label">{room.type}会议室</span>
                    </div>

                    <div className="room-extra-info">

                        {room.capacity && (
                            <div className="room-info-item">
                                <strong>容量:</strong> {room.capacity}人
                            </div>
                        )}

                        {room.price_per_hour && (
                            <div className="room-info-item">
                                <strong>价格:</strong> ¥{room.price_per_hour}/小时
                            </div>
                        )}
                    </div>

                    <div className="room-actions">
                        {room.status === '预定' && (
                            <Tooltip title="客户开始使用后设置">
                                <Button
                                    type="primary"
                                    onClick={() => setToInUse(room.room_id)}
                                    block
                                    className="action-button"
                                >
                                    设为使用中
                                </Button>
                            </Tooltip>
                        )}

                        {room.status === '使用' && (
                            <div className="action-group">
                                <Popconfirm
                                    title="确认会议室正常可以继续使用？"
                                    onConfirm={() => setToVacant(room.room_id)}
                                    okText="确认"
                                    cancelText="取消"
                                    placement="bottom"
                                >
                                    <Button type="primary" block className="action-button">
                                        设为空闲
                                    </Button>
                                </Popconfirm>

                                <Popconfirm
                                    title="确认会议室需要维护？"
                                    onConfirm={() => setToMaintenance(room.room_id)}
                                    okText="确认"
                                    cancelText="取消"
                                    placement="bottom"
                                >
                                    <Button type="dashed" danger block className="action-button">
                                        设为维护
                                    </Button>
                                </Popconfirm>
                            </div>
                        )}

                        {room.status === '维护' && (
                            <Tooltip title="维护完成后设置">
                                <Button
                                    type="primary"
                                    onClick={() => setToVacant(room.room_id)}
                                    block
                                    className="action-button"
                                >
                                    设为空闲
                                </Button>
                            </Tooltip>
                        )}
                    </div>
                </div>
            </Card>
        </Col>
    );

    return (
        <div className="work-page-container">
            <div className="page-header">
                <Title level={3}>会议室状态管理</Title>
                <Divider />
            </div>

            <div className="instructions-section">
                <Title level={5} className="instructions-title">
                    <WarningOutlined /> 员工工作说明
                </Title>
                <ol className="instructions-list">
                    <li>查看会议室状态</li>
                    <li>客户开始使用后，将会议室设置为"使用中"状态</li>
                    <li>客户使用完成后，检查会议室：如果正常则设为"空闲"，需要维护则设为"维护中"</li>
                    <li>维护完成后，将会议室设为"空闲"状态</li>
                </ol>
            </div>

            <Divider className="section-divider" />

            <div className="rooms-container">
                {loading ? (
                    <Row gutter={[24, 24]} className="skeleton-grid">
                        {[1, 2, 3, 4, 5, 6].map(index => (
                            <Col key={index} xs={24} sm={24} md={12} lg={8} xl={6} xxl={4}>
                                <Skeleton active paragraph={{ rows: 8 }} />
                            </Col>
                        ))}
                    </Row>
                ) : rooms && rooms.length > 0 ? (
                    <Row gutter={[24, 24]} className="rooms-grid">
                        {rooms.map(room => renderRoomCard(room))}
                    </Row>
                ) : (
                    <div className="empty-state">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div className="empty-content">
                                    <WarningOutlined className="empty-icon" />
                                    <Title level={4} className="empty-title">未找到会议室信息</Title>
                                    <Button
                                        type="primary"
                                        onClick={fetchRooms}
                                        icon={<SyncOutlined />}
                                        className="reload-button"
                                    >
                                        重新加载
                                    </Button>
                                </div>
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffWorkPage;
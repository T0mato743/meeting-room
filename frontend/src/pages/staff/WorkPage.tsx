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
    Empty,
    Timeline,
    Tag,
} from 'antd';
import {
    SyncOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    ClockCircleOutlined,
    StopOutlined
} from '@ant-design/icons';
import { meetingRoomApi } from '@/api/meetingRoom';
import { bookingApi } from '@/api/booking';
import type { MeetingRoom } from '@/types/types';
import type { Booking } from '@/types/types';
import './WorkPage.scss';
import moment from 'moment';

const { Text, Title } = Typography;

const StaffWorkPage: React.FC = () => {
    const [rooms, setRooms] = useState<MeetingRoom[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = {};
            // 并行获取会议室和预订数据
            const [roomsData, bookingsData] = await Promise.all([
                meetingRoomApi.listMeetingRooms(),
                bookingApi.getCustomerBookings(params)
            ]);

            if (Array.isArray(roomsData)) {
                // 检查当前时间是否在营业时间内
                const currentHour = new Date().getHours();
                const isBusinessHours = currentHour >= 8 && currentHour < 21;

                // 如果不在营业时间，将所有会议室状态设置为锁定
                const updatedRooms = roomsData.map(room => ({
                    ...room,
                    status: isBusinessHours ? room.status : '锁定',
                    originalStatus: room.status
                }));

                setRooms(updatedRooms);
                console.log(rooms);
            }

            if (Array.isArray(bookingsData)) {
                const currentTime = new Date();
                const oldbookings = bookingsData.filter(booking =>
                    booking.payment_status !== '已退款'
                );
                const futureBookings = oldbookings.filter(booking =>
                    new Date(booking.start_time) > currentTime,
                );
                setBookings(futureBookings);

            }

        } catch (error) {
            message.error('获取数据失败');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // fetchRooms();
        fetchData();

        const timer = setInterval(() => {
            const currentHour = new Date().getHours();
            const isBusinessHours = currentHour >= 8 && currentHour < 21;

            setRooms(prevRooms =>
                prevRooms.map(room => ({
                    ...room,
                    status: isBusinessHours ? room.status : '锁定'
                }))
            );
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const getRoomBookings = (roomId: number) => {
        return bookings.filter(booking => booking.room_id === roomId);
    };

    // 设置会议室为使用中状态
    const setToInUse = async (roomId: number) => {
        try {
            await meetingRoomApi.updateMeetingRoom(roomId, { status: '使用' });
            message.success('会议室已设置为使用中');
            fetchData();
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
            fetchData();
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
            fetchData();
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
            default: return '锁定';
        }
    };

    // 根据状态获取图标
    const getStatusIcon = (status: string) => {
        switch (status) {
            case '空闲': return <CheckCircleOutlined />;
            case '预定': return <ClockCircleOutlined />;
            case '使用': return <SyncOutlined spin />;
            case '维护': return <WarningOutlined />;
            default: return <StopOutlined />;
        }
    };

    // 根据状态获取卡片类名
    const getStatusClass = (status: string) => {
        switch (status) {
            case '空闲': return 'status-free';
            case '预定': return 'status-reserved';
            case '使用': return 'status-in-use';
            case '维护': return 'status-maintenance';
            case '锁定': return 'status-locked';
            default: return '';
        }
    };

    const renderBookingTimeline = (roomBookings: Booking[]) => {
        if (!roomBookings || roomBookings.length === 0) {
            return <Text type="secondary" className="text">当前无预订</Text>;
        }

        const items = roomBookings.map((booking) => {
            return {
                key: booking.booking_id,
                children: (
                    <div className="booking-details">
                        <Text strong>
                            {moment(booking.start_time).format('MM-DD HH:mm')}-
                            {moment(booking.end_time).format('HH:mm')}
                        </Text>
                        <Tag
                            color={booking.payment_status === '已付' ? 'green' : 'orange'}
                            className="payment-tag"
                        >
                            {booking.payment_status || '未知状态'}
                        </Tag>
                    </div>
                ),
            };
        });

        return <Timeline mode="left" items={items} className="booking-timeline" />;
    }

    // 渲染会议室状态卡片
    const renderRoomCard = (room: MeetingRoom) => {
        const currentHour = new Date().getHours();
        const isBusinessHours = currentHour >= 8 && currentHour < 21;
        const roomBookings = getRoomBookings(room.room_id);

        return (
            <Col xs={24} sm={24} md={12} lg={8} xl={8} xxl={18} key={room.room_id}>
                <Card
                    className={`room-card ${getStatusClass(room.status)}`}
                    title={
                        <div className="room-title">
                            <span>{room.name}</span>
                            <Tag color={getStatusColor(room.status)} className="status-tag">
                                {getStatusText(room.status)}
                            </Tag>
                        </div>
                    }
                    loading={loading}
                    style={{ height: '100%', borderRadius: '8px' }}
                >
                    <div className="room-details">
                        <div className="room-status">
                            {getStatusIcon(room.status)}
                            <Badge
                                status={getStatusColor(room.status) as "default" | "success" | "processing" | "error" | "warning"}
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

                        <Divider className="room-divider" />

                        <div className="booking-section">
                            <Text strong>预订时间段:</Text>
                            <div className="booking-timeline-container">
                                {renderBookingTimeline(roomBookings)}
                            </div>
                        </div>

                        <div className="room-actions">
                            {!isBusinessHours ? (
                                <Tooltip title="非营业时间（8:00-21:00）">
                                    <Button disabled block>
                                        非营业时间
                                    </Button>
                                </Tooltip>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>
                    </div>
                </Card>
            </Col>)
    };

    return (
        <div className="work-page-container">
            <div className="page-header">
                <Title level={3}>会议室状态管理</Title>
                <Button
                    type="primary"
                    icon={<SyncOutlined />}
                    onClick={fetchData}
                    className="refresh-button"
                >
                    刷新数据
                </Button>
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
                                        onClick={fetchData}
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
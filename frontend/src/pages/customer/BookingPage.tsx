import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Form,
    Input,
    DatePicker,
    Select,
    Tag,
    Row,
    Col,
    Steps,
    Typography,
    Alert,
    Descriptions,
    Result,
    message,
    Modal,
} from 'antd';
import {
    SearchOutlined,
    CheckCircleOutlined,
    DollarOutlined,
    ArrowLeftOutlined,
    ClockCircleOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { bookingApi } from '@/api/booking';
import type { AvailableRoom, BookingRequest, Booking, Equipment } from '@/types/types';
import moment from 'moment';
import type { Moment } from 'moment';
import { useAuth } from '@/context/AuthContext';
import './BookingPage.scss';
import { meetingRoomApi } from '@/api/meetingRoom';

const { Title, Text } = Typography;
const { Step } = Steps;
const { RangePicker } = DatePicker;

const BookingPage: React.FC = () => {
    const [form] = Form.useForm();
    const [step, setStep] = useState(0);
    const [rooms, setRooms] = useState<AvailableRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<AvailableRoom | null>(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState<[Moment, Moment] | null>(null);
    const [bookingData, setBookingData] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(false);
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [paymentDeadline, setPaymentDeadline] = useState<Date | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const { user } = useAuth();

    const fetchEquipments = async () => {
        try {
            const data = await meetingRoomApi.getAllEquipments();
            if (Array.isArray(data)) {
                setEquipments(data);
            }
        } catch (error) {
            console.error('获取设备列表失败:', error);
            setEquipments([]);
        }
    };

    // 格式化倒计时
    const formatCountdown = () => {
        if (countdown === null) return '';
        if (countdown <= 0) return '已超时';

        const minutes = Math.floor(countdown / 60);
        const seconds = countdown % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleSearch = async (values: any) => {
        setLoading(true);
        try {
            const { dateRange, capacity, equipments } = values;
            const [start, end] = dateRange as Moment[];
            setSelectedTimeRange([start, end]);

            const request: BookingRequest = {
                startTime: start.format('YYYY-MM-DD HH:mm:ss'),
                endTime: end.format('YYYY-MM-DD HH:mm:ss'),
                capacity: capacity,
                equipmentIds: equipments
            };

            const data = await bookingApi.findAvailableRooms(request);
            setRooms(data);
            setStep(1);
        } catch (error) {
            console.error('搜索失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRoom = (room: AvailableRoom) => {
        setSelectedRoom(room);
        setStep(2);
    };

    const handleConfirmBooking = async () => {
        if (!selectedRoom || !selectedTimeRange) return;

        try {
            const [start, end] = selectedTimeRange;

            const booking = await bookingApi.createBooking({
                roomId: selectedRoom.room_id,
                startTime: start.format('YYYY-MM-DD HH:mm:ss'),
                endTime: end.format('YYYY-MM-DD HH:mm:ss')
            });

            setBookingData(booking);
            setPaymentDeadline(new Date(Date.now() + 30 * 60 * 1000)); // 30分钟后
            setStep(3);
        } catch (error) {
            console.error('创建预订失败:', error);
        }
    };

    const handlePay = async () => {
        if (!bookingData) {
            message.error('订单信息无效');
            return;
        }

        try {
            console.log(bookingData.bookingId);

            await bookingApi.payBooking(bookingData.bookingId);
            setStep(4);
        } catch (error) {
            console.error('支付失败:', error);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const handleNewBooking = () => {
        setStep(0);
        setSelectedRoom(null);
        setBookingData(null);
        form.resetFields();
    };

    const calculateDuration = (start: string, end: string) => {
        const startMoment = moment(start);
        const endMoment = moment(end);

        return endMoment.diff(startMoment, 'hours', true);
    };

    // 获取设备列表
    useEffect(() => {
        fetchEquipments();
    }, []);

    // 倒计时计时器
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        if (paymentDeadline && step === 3) {
            const deadline = new Date(paymentDeadline).getTime();

            const updateCountdown = () => {
                const now = new Date().getTime();
                const diff = deadline - now;

                if (diff <= 0) {
                    setCountdown(0);
                    if (timer) clearInterval(timer);
                    return;
                }

                setCountdown(Math.floor(diff / 1000));
            };

            updateCountdown();
            timer = setInterval(updateCountdown, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [paymentDeadline, step]);

    const renderRoomCard = (room: AvailableRoom) => (
        <Card
            key={room.room_id}
            className="room-card"
            title={
                <div className="room-header">
                    <span>{room.name}</span>
                    <Tag color={room.type === '教室型' ? 'blue' : 'green'}>{room.type}</Tag>
                </div>
            }
            actions={[
                <Button
                    type="primary"
                    onClick={() => handleSelectRoom(room)}
                    className="select-button"
                >
                    选择此会议室
                </Button>
            ]}
        >
            <div className="room-details">
                <div className="room-info">
                    <div className="info-item">
                        <Text strong>容量:</Text>
                        <Text>{room.capacity}人</Text>
                    </div>
                    <div className="info-item">
                        <Text strong>价格:</Text>
                        <Text className="price">¥{room.price_per_hour}/小时</Text>
                    </div>
                </div>

                {room.equipments && room.equipments.length > 0 && (
                    <div className="equipments">
                        <Text strong>设备:</Text>
                        <div className="equipment-tags">
                            {room.equipments.map(e => (
                                <Tag key={e.equipment_id} className="equipment-tag">
                                    {e.name}
                                </Tag>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );

    const renderBookingModal = () => (
        <Modal
            title="预订详情"
            open={showBookingModal}
            onCancel={() => setShowBookingModal(false)}
            footer={[
                <Button key="close" onClick={() => setShowBookingModal(false)}>
                    关闭
                </Button>
            ]}
            width={800}
        >
            {bookingData && selectedRoom && (
                <div className="booking-details-modal">
                    <Row gutter={16}>
                        <Col span={12}>
                            <div className="section">
                                <Title level={4} className="section-title">会议室信息</Title>
                                <div className="room-header">
                                    <Text strong className="room-name">
                                        {selectedRoom.name}
                                    </Text>
                                    <Tag color={selectedRoom.type === '教室型' ? 'blue' : 'green'}>
                                        {selectedRoom.type}
                                    </Tag>
                                </div>

                                <Descriptions column={1} className="details">
                                    <Descriptions.Item label="预订编号">
                                        {bookingData.bookingId}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="容量">
                                        {selectedRoom.capacity}人
                                    </Descriptions.Item>
                                    <Descriptions.Item label="价格">
                                        ¥{selectedRoom.price_per_hour}/小时
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </Col>

                        <Col span={12}>
                            <div className="section">
                                <Title level={4} className="section-title">预订信息</Title>
                                <Descriptions column={1} className="details">
                                    <Descriptions.Item label="预订人">
                                        {user?.name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="预订时间">
                                        {bookingData.start && moment(bookingData.start).format('YYYY-MM-DD HH:mm')} -{' '}
                                        {bookingData.end && moment(bookingData.end).format('HH:mm')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="时长">
                                        {calculateDuration(
                                            bookingData.start,
                                            bookingData.end
                                        ).toFixed(1)} 小时
                                    </Descriptions.Item>
                                    <Descriptions.Item label="总金额">
                                        <Text strong className="total-amount">
                                            ¥{bookingData.totalAmount?.toFixed(2) || '0.00'}
                                        </Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="支付状态">
                                        <Tag color={step === 4 ? "success" : "warning"}>
                                            {step === 4 ? "已支付" : "待支付"}
                                        </Tag>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </Col>
                    </Row>

                    {selectedRoom.equipments && selectedRoom.equipments.length > 0 && (
                        <div className="section">
                            <Title level={4} className="section-title">设备列表</Title>
                            <div className="equipment-list">
                                {selectedRoom.equipments.map(e => (
                                    <div key={e.equipment_id} className="equipment-item">
                                        <Text strong>{e.name}</Text>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 4 && bookingData && bookingData.created_at && (
                        <div className="section">
                            <Title level={4} className="section-title">支付信息</Title>
                            <Descriptions column={1} className="details">
                                <Descriptions.Item label="支付时间">
                                    {bookingData.created_at && moment(bookingData.created_at).format('YYYY-MM-DD HH:mm:ss')}
                                </Descriptions.Item>
                                <Descriptions.Item label="支付方式">
                                    在线支付
                                </Descriptions.Item>
                                <Descriptions.Item label="交易号">
                                    TXN-{bookingData.bookingId}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );

    return (
        <div className="booking-page">
            <div className="booking-header">
                <Title level={2} className="page-title">会议室预订</Title>
                <Steps current={step} className="booking-steps">
                    <Step title="选择时间" />
                    <Step title="选择会议室" />
                    <Step title="确认预订" />
                    <Step title="支付" />
                    <Step title="完成" />
                </Steps>
            </div>

            <div className="booking-content">
                {step === 0 && (
                    <Card className="search-card">
                        <Form
                            form={form}
                            onFinish={handleSearch}
                            layout="vertical"
                            initialValues={{ capacity: 5 }}
                        >
                            <Form.Item
                                name="dateRange"
                                label="预订时间"
                                rules={[{
                                    required: true,
                                    message: '请选择预订时间'
                                }]}
                            >
                                <RangePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm"
                                    disabledDate={(current) => current && current < moment().endOf('day')}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="capacity"
                                        label="参会人数"
                                        rules={[{
                                            required: true,
                                            message: '请输入参会人数'
                                        }]}
                                    >
                                        <Input type="number" min={1} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="equipments"
                                        label="所需设备"
                                    >
                                        <Select
                                            mode="multiple"
                                            placeholder="请选择所需设备"
                                            options={equipments.map(e => ({
                                                value: e.equipment_id,
                                                label: e.name
                                            }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SearchOutlined />}
                                    loading={loading}
                                    className="search-button"
                                >
                                    搜索可用会议室
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                )}

                {step === 1 && (
                    <div className="room-selection">
                        <div className="back-button-container">
                            <Button
                                type="link"
                                icon={<ArrowLeftOutlined />}
                                onClick={handleBack}
                                className="back-button"
                            >
                                返回修改条件
                            </Button>
                        </div>

                        <Title level={4} className="section-title">
                            找到 {rooms.length} 个可用会议室
                        </Title>

                        <div className="room-list">
                            {rooms.length > 0 ? (
                                rooms.map(renderRoomCard)
                            ) : (
                                <Card className="no-rooms-card">
                                    <Text type="secondary">没有找到符合条件的会议室，请尝试修改搜索条件</Text>
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && selectedRoom && (
                    <div className="confirmation-step">
                        <div className="back-button-container">
                            <Button
                                type="link"
                                icon={<ArrowLeftOutlined />}
                                onClick={handleBack}
                                className="back-button"
                            >
                                返回选择会议室
                            </Button>
                        </div>

                        <Card className="confirmation-card">
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Card
                                        title="会议室信息"
                                        className="room-info-card"
                                    >
                                        <div className="room-header">
                                            <Title level={4} className="room-name">
                                                {selectedRoom.name}
                                            </Title>
                                            <Tag color={selectedRoom.type === '教室型' ? 'blue' : 'green'}>
                                                {selectedRoom.type}
                                            </Tag>
                                        </div>

                                        <Descriptions column={1} className="room-details">
                                            <Descriptions.Item label="容量">
                                                {selectedRoom.capacity}人
                                            </Descriptions.Item>
                                            <Descriptions.Item label="价格">
                                                <Text strong className="price">
                                                    ¥{selectedRoom.price_per_hour}/小时
                                                </Text>
                                            </Descriptions.Item>
                                            {selectedRoom.equipments && selectedRoom.equipments.length > 0 && (
                                                <Descriptions.Item label="设备">
                                                    <div className="equipment-tags">
                                                        {selectedRoom.equipments.map(e => (
                                                            <Tag key={e.equipment_id} className="equipment-tag">
                                                                {e.name}
                                                            </Tag>
                                                        ))}
                                                    </div>
                                                </Descriptions.Item>
                                            )}
                                        </Descriptions>
                                    </Card>
                                </Col>

                                <Col span={12}>
                                    <Card
                                        title="预订详情"
                                        className="booking-details-card"
                                    >
                                        <Form form={form} layout="vertical">
                                            <Form.Item
                                                name="dateRange"
                                                label="预订时间"
                                                initialValue={form.getFieldValue('dateRange')}
                                                rules={[{ required: true, message: '请选择预订时间' }]}
                                            >
                                                <RangePicker
                                                    showTime
                                                    format="YYYY-MM-DD HH:mm"
                                                    disabledDate={(current) => current && current < moment().endOf('day')}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                            <div className="booking-summary">
                                                <div className="summary-item">
                                                    <Text>会议室:</Text>
                                                    <Text strong>{selectedRoom.name}</Text>
                                                </div>
                                                <div className="summary-item">
                                                    <Text>时长:</Text>
                                                    <Text strong>
                                                        {selectedTimeRange
                                                            ? selectedTimeRange[1].diff(selectedTimeRange[0], 'hours', true).toFixed(1)
                                                            : "0.0"} 小时
                                                    </Text>
                                                </div>
                                                <div className="summary-item">
                                                    <Text>总价:</Text>
                                                    <Text strong className="total-price">
                                                        ¥{(
                                                            selectedRoom.price_per_hour *
                                                            (selectedTimeRange
                                                                ? selectedTimeRange[1].diff(selectedTimeRange[0], 'hours', true)
                                                                : 0)
                                                        ).toFixed(2)}
                                                    </Text>
                                                </div>
                                            </div>

                                            <Form.Item className="submit-item">
                                                <Button
                                                    type="primary"
                                                    onClick={handleConfirmBooking}
                                                    className="confirm-button"
                                                >
                                                    确认预订
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    </Card>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                )}

                {step === 3 && bookingData && selectedTimeRange && (
                    <div className="payment-step">
                        <Card className="payment-card">
                            <div className="payment-header">
                                <CheckCircleOutlined className="success-icon" />
                                <Title level={3} className="payment-title">
                                    预订成功!
                                </Title>
                                <Text type="secondary" className="booking-id">
                                    订单号: {bookingData.bookingId}
                                </Text>
                            </div>

                            <div className="countdown-container">
                                <ClockCircleOutlined className="clock-icon" />
                                <Text className="countdown-text">
                                    支付剩余时间: {formatCountdown()}
                                </Text>
                            </div>

                            <Alert
                                message="请在30分钟内完成支付，否则预订将自动取消"
                                type="warning"
                                showIcon
                                className="payment-alert"
                            />

                            <div className="booking-details">
                                <Descriptions column={1} className="details-list">
                                    <Descriptions.Item label="会议室">
                                        {selectedRoom?.name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="类型">
                                        <Tag color={selectedRoom?.type === '教室型' ? 'blue' : 'green'}>
                                            {selectedRoom?.type}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="预订时间">
                                        {selectedTimeRange[0].format('YYYY-MM-DD HH:mm')} -{' '}
                                        {selectedTimeRange[1].format('HH:mm')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="时长">
                                        {calculateDuration(
                                            bookingData.start,
                                            bookingData.end
                                        ).toFixed(1)} 小时
                                    </Descriptions.Item>
                                    <Descriptions.Item label="单价">
                                        ¥{selectedRoom?.price_per_hour}/小时
                                    </Descriptions.Item>
                                </Descriptions>

                                <div className="total-amount">
                                    <Text>总金额:</Text>
                                    <Title level={3} className="amount">
                                        {bookingData?.totalAmount !== undefined
                                            ? `¥${bookingData.totalAmount.toFixed(2)}`
                                            : '¥0.00'}
                                    </Title>
                                </div>
                            </div>

                            <Button
                                type="primary"
                                size="large"
                                icon={<DollarOutlined />}
                                onClick={handlePay}
                                className="pay-button"
                                block
                            >
                                立即支付
                            </Button>

                            <div className="payment-methods">
                                <Text type="secondary">支持支付方式:</Text>
                                <div className="method-icons">
                                    <div className="method-icon wechat-pay" />
                                    <div className="method-icon alipay" />
                                    <div className="method-icon bank-card" />
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {step === 4 && (
                    <div className="success-step">
                        <Result
                            status="success"
                            title="预订支付成功!"
                            subTitle={`订单号: ${bookingData?.bookingId}，会议室预订已完成`}
                            extra={[
                                <Button
                                    type="primary"
                                    key="new"
                                    onClick={handleNewBooking}
                                >
                                    预订新会议室
                                </Button>,
                                <Button
                                    icon={<EyeOutlined />}
                                    key="view"
                                    onClick={() => setShowBookingModal(true)}
                                >
                                    查看我的预订
                                </Button>
                            ]}
                            className="result-card"
                        >
                            <div className="booking-info">
                                <Descriptions column={1}>
                                    <Descriptions.Item label="会议室">
                                        {selectedRoom?.name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="预订时间">
                                        {bookingData && moment(bookingData.start).format('YYYY-MM-DD HH:mm')} -{' '}
                                        {bookingData && moment(bookingData.end).format('HH:mm')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="支付金额">
                                        <Text strong>
                                            {bookingData?.totalAmount !== undefined
                                                ? `¥${bookingData.totalAmount.toFixed(2)}`
                                                : '¥0.00'}
                                        </Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="预订人">
                                        {user?.name}
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </Result>
                        {renderBookingModal()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingPage;
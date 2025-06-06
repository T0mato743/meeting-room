import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Popconfirm, message } from 'antd';
import { bookingApi } from '@/api/booking';
import type { Booking } from '@/types/types';
import moment from 'moment';
import './MyBookingsPage.scss';

const MyBookings: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await bookingApi.getCustomerBookings();
            if (Array.isArray(data)) {
                setBookings(data);
            }
        } catch (error) {
            message.error('获取订单列表失败');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId: number) => {
        try {
            const { refundAmount } = await bookingApi.cancelBooking(bookingId);
            message.success(`取消成功，退款金额：¥${refundAmount.toFixed(2)}`);
            fetchBookings();
        } catch (error) {
            message.error('取消失败');
            console.log(error);
        }
    };

    const columns = [
        {
            title: '会议室',
            dataIndex: 'room_name',
            key: 'room_name',
        },
        {
            title: '类型',
            dataIndex: 'room_type',
            key: 'room_type',
            render: (type: string) => <Tag color={type === '教室型' ? 'blue' : 'green'}>{type}</Tag>,
        },
        {
            title: '开始时间',
            dataIndex: 'start_time',
            key: 'start_time',
            render: (text: string) => moment(text).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: '结束时间',
            dataIndex: 'end_time',
            key: 'end_time',
            render: (text: string) => moment(text).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: '金额',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount: number) => {
                const numAmount = Number(amount);
                return `¥${numAmount.toFixed(2)}`
            },
        },
        {
            title: '状态',
            dataIndex: 'payment_status',
            key: 'payment_status',
            render: (status: string) => {
                const statusMap: Record<string, { color: string; text: string }> = {
                    未付: { color: 'orange', text: '未支付' },
                    已付: { color: 'green', text: '已支付' },
                    已退款: { color: 'blue', text: '已退款' }
                };
                const statusInfo = statusMap[status] || { color: 'default', text: status };
                return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
            },
        },
        {
            title: '操作',
            key: 'action',
            width: '121.96px',
            render: (_: unknown, record: Booking) => (
                <div>
                    {record.payment_status === '未付' && (
                        <Button type="link" onClick={() => handlePay(record.booking_id)}>
                            支付
                        </Button>
                    )}
                    {record.payment_status === '已付' && (
                        <Popconfirm
                            title="确定要取消预订吗？"
                            onConfirm={() => handleCancel(record.booking_id)}
                            okText="确定"
                            cancelText="取消"
                        >
                            <Button type="link" danger>
                                取消
                            </Button>
                        </Popconfirm>
                    )}
                </div>
            ),
        },
    ];

    const handlePay = async (bookingId: number) => {
        try {
            await bookingApi.payBooking(bookingId);
            message.success('支付成功');
            fetchBookings();
        } catch (error) {
            message.error('支付失败');
            console.log(error);
        }
    };

    return (
        <div className="my-bookings-page">
            <div className="my-bookings-header">
                <h2 className="page-title">我的预订</h2>
            </div>
            <div className="my-bookings-content">
                <Table
                    dataSource={bookings}
                    columns={columns}
                    rowKey="booking_id"
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default MyBookings;
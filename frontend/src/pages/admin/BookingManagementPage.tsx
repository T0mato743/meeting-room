import React, { useState, useEffect } from 'react';
import { Table, Tag, DatePicker, Button, Select } from 'antd';
import { bookingApi } from '@/api/booking';
import type { Booking } from '@/types/types';
import moment from 'moment';
import './AdminPage.scss';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const BookingManagement: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [dateRange, setDateRange] = useState<any>(null);

    useEffect(() => {
        fetchBookings();
    }, [statusFilter, dateRange]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = {};

            // 添加状态筛选
            if (statusFilter) {
                params.status = statusFilter;
            }

            // 添加日期范围筛选
            if (dateRange && dateRange[0] && dateRange[1]) {
                params.startTime = dateRange[0].format('YYYY-MM-DD');
                params.endTime = dateRange[1].format('YYYY-MM-DD');
            }

            const booking = await bookingApi.getCustomerBookings(params);
            if (Array.isArray(booking)) {
                const processedData = booking.map(booking => ({
                    ...booking,
                    totalAmount: Number(booking.totalAmount) || 0
                }));

                setBookings(processedData);
            }

        } catch (error) {
            console.error('获取预订列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setStatusFilter(undefined);
        setDateRange(null);
        fetchBookings();
    }

    const handleDateRangeChange = (dates: any) => {
        setDateRange(dates);
        fetchBookings();
    };

    const handleStatusChange = (status: string) => {
        setStatusFilter(status)
        fetchBookings();
    }

    const columns = [
        {
            title: '预订时间',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text: string) => text ? moment(text).format('YYYY-MM-DD HH:mm') : '-',
            sorter: (a: Booking, b: Booking) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        },
        {
            title: '会议室',
            dataIndex: 'room_name',
            key: 'room_name',
        },
        {
            title: '用户',
            dataIndex: 'customer_name',
            key: 'customer_name',
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
                const numAmount = typeof amount === 'number' ? amount : Number(amount) || 0;
                return `¥${numAmount.toFixed(2)}`;
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
    ];

    return (
        <div className="admin-page booking-management">
            <div className="page-header">
                <h1>预订管理</h1>
            </div>

            <div className="table-container">
                <div className="filters-container">
                    <div className="filters-content">
                        <div className="date-range-container">
                            <label className="label-text">日期范围</label>
                            <RangePicker
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                placeholder={['开始日期', '结束日期']}
                                style={{ marginRight: 16 }}
                                allowClear
                            />
                        </div>

                        <div className="filter-item">
                            <label className="label-text">状态筛选</label>
                            <Select
                                value={statusFilter}
                                placeholder="按状态筛选"
                                style={{ width: 120 }}
                                onChange={handleStatusChange}
                                allowClear
                            >
                                <Option value="未付">未支付</Option>
                                <Option value="已付">已支付</Option>
                                <Option value="已退款">已退款</Option>
                            </Select>
                        </div>
                    </div>

                    <div className="actions">
                        <Button
                            type="primary"
                            onClick={fetchBookings}
                            icon={<SearchOutlined />}
                        >
                            搜索
                        </Button>


                        <Button
                            style={{ marginLeft: 6 }}
                            onClick={resetFilters}
                            icon={<ReloadOutlined />}
                        >
                            重置
                        </Button>
                    </div>
                </div>

                <div className="date-filter-info">
                    {dateRange && dateRange[0] && dateRange[1] && (
                        <p>
                            显示从 {dateRange[0].format('YYYY年MM月DD日')} 到 {dateRange[1].format('YYYY年MM月DD日')} 的预订
                        </p>
                    )}
                </div>

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

export default BookingManagement;
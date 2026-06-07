import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Input, Button, Select, DatePicker, Table, Tag, Alert, Modal, message, Space, Progress, Descriptions, Badge } from 'antd';
import dayjs from 'dayjs';
import { mockAppointments, mockContainers, mockOrders, generateTimeSlots } from '@/services/mockData';
import { formatDateTime, getStatusColor, getStatusText } from '@/utils/format';
import { IconMap } from '@/components/IconMap';
import type { PickupAppointment, TimeSlot } from '@/types';

const { Option } = Select;

const DriverAppointment: React.FC = () => {
  const [form] = Form.useForm();
  const [appointments, setAppointments] = useState<PickupAppointment[]>(mockAppointments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<any>(null);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [releaseInfo, setReleaseInfo] = useState<any>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    setTimeSlots(generateTimeSlots());
  }, [selectedDate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0 && releaseInfo) {
      handleAutoRelease();
    }
  }, [countdown]);

  const columns = [
    {
      title: '预约编号',
      dataIndex: 'appointmentNo',
      key: 'appointmentNo',
      render: (text: string) => <span className="font-mono text-sm">{text}</span>,
    },
    {
      title: '集装箱号',
      dataIndex: 'containerNo',
      key: 'containerNo',
      render: (text: string) => <span className="font-mono font-medium">{text}</span>,
    },
    { title: '运单号', dataIndex: 'orderNo', key: 'orderNo' },
    {
      title: '预约日期',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
    },
    { title: '时段', dataIndex: 'timeSlot', key: 'timeSlot' },
    {
      title: '推荐时段',
      dataIndex: 'recommendedSlot',
      key: 'recommendedSlot',
      render: (text?: string) =>
        text ? (
          <Tag color="blue" icon={<IconMap name="Star" size={10} />}>
            {text}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: PickupAppointment) => (
        <Space size="small">
          {record.status === 'confirmed' && (
            <Button type="link" size="small" danger onClick={() => handleCancel(record)}>
              取消
            </Button>
          )}
          {record.status === 'no-show' && record.penaltyAmount && (
            <Button type="link" size="small" type="primary">
              支付扣费
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleNewAppointment = () => {
    setIsModalOpen(true);
    setSelectedSlot(null);
    setSelectedContainer(null);
    form.resetFields();
  };

  const handleContainerSelect = (containerNo: string) => {
    const container = mockContainers.find((c) => c.containerNo === containerNo);
    const order = mockOrders.find((o) => o.containerNos.includes(containerNo));
    setSelectedContainer({ ...container, order });
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (!selectedSlot) {
        message.warning('请选择预约时段');
        return;
      }

      const recommended = timeSlots.find((s) => s.recommended)?.slot;
      const newAppointment: PickupAppointment = {
        id: `a${Date.now()}`,
        appointmentNo: `APT${dayjs().format('YYYYMMDDHHmmss')}`,
        driverId: '4',
        driverName: '张师傅',
        plateNo: values.plateNo || '粤B12345',
        containerNo: values.containerNo,
        orderNo: selectedContainer?.order?.orderNo || '-',
        appointmentDate: selectedDate.format('YYYY-MM-DD'),
        timeSlot: selectedSlot,
        recommendedSlot: recommended !== selectedSlot ? recommended : undefined,
        status: 'confirmed',
      };

      setAppointments([newAppointment, ...appointments]);
      setIsModalOpen(false);
      message.success('预约成功');

      if (recommended && recommended !== selectedSlot) {
        message.info(`温馨提示：系统推荐${recommended}时段，该时段堆场更空闲`);
      }
    });
  };

  const handleCancel = (record: PickupAppointment) => {
    Modal.confirm({
      title: '确认取消预约',
      content: '取消预约后该时段将被释放，确定要取消吗？',
      okText: '确定取消',
      cancelText: '保留预约',
      okType: 'danger',
      onOk: () => {
        setAppointments(
          appointments.map((a) =>
            a.id === record.id ? { ...a, status: 'cancelled' as const } : a
          )
        );
        message.success('预约已取消');
      },
    });
  };

  const handleAutoRelease = () => {
    if (releaseInfo) {
      setAppointments(
        appointments.map((a) =>
          a.id === releaseInfo.id
            ? { ...a, status: 'no-show' as const, penaltyAmount: 200 }
            : a
        )
      );
      setShowReleaseModal(false);
      setReleaseInfo(null);
      setCountdown(0);
      message.warning('预约已超时自动释放，产生违约金200元');
    }
  };

  const getSlotColor = (slot: TimeSlot) => {
    if (slot.busyLevel === 'high') return 'border-red-200 bg-red-50';
    if (slot.busyLevel === 'medium') return 'border-amber-200 bg-amber-50';
    return 'border-emerald-200 bg-emerald-50';
  };

  const getSlotTextColor = (slot: TimeSlot) => {
    if (slot.busyLevel === 'high') return 'text-red-600';
    if (slot.busyLevel === 'medium') return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">提箱预约</h1>
          <p className="mt-1 text-gray-500">预约提箱时段，系统推荐最优时间</p>
        </div>
        <Button type="primary" icon={<IconMap name="CalendarPlus" size={16} />} onClick={handleNewAppointment}>
          新建预约
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="我的预约" className="border-0 shadow-sm">
            <Table
              columns={columns}
              dataSource={appointments}
              rowKey="id"
              pagination={{ pageSize: 6 }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="预约须知" className="border-0 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <IconMap name="Clock" size={16} className="text-[#3E92CC]" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">提前预约</p>
                  <p className="text-xs text-gray-500">请至少提前2小时进行预约</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                  <IconMap name="AlertTriangle" size={16} className="text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">超时释放</p>
                  <p className="text-xs text-gray-500">超过预约时段30分钟未到场，预约自动释放并扣除违约金</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                  <IconMap name="Star" size={16} className="text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">智能推荐</p>
                  <p className="text-xs text-gray-500">选择系统推荐时段可减少等待时间</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="今日待提箱" className="mt-4 border-0 shadow-sm">
            <div className="space-y-3">
              {appointments
                .filter((a) => a.status === 'confirmed' && dayjs(a.appointmentDate).isSame(dayjs(), 'day'))
                .map((apt) => (
                  <div
                    key={apt.id}
                    className="rounded-lg border border-blue-100 bg-blue-50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge status="processing" text={apt.timeSlot} />
                      <Button type="link" size="small" onClick={() => {
                        setReleaseInfo(apt);
                        setCountdown(1800);
                        setShowReleaseModal(true);
                      }}>
                        模拟超时
                      </Button>
                    </div>
                    <p className="mt-1 font-mono text-sm text-gray-600">{apt.containerNo}</p>
                  </div>
                ))}
              {appointments.filter((a) => a.status === 'confirmed' && dayjs(a.appointmentDate).isSame(dayjs(), 'day')).length === 0 && (
                <p className="text-center text-gray-400">今日暂无预约</p>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title="新建提箱预约"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        width={800}
        okText="确认预约"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item label="选择集装箱" name="containerNo" rules={[{ required: true, message: '请选择集装箱' }]}>
                <Select
                  placeholder="输入或选择箱号"
                  showSearch
                  onChange={handleContainerSelect}
                  filterOption={(input, option) =>
                    (option?.value as string).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {mockContainers
                    .filter((c) => c.status === 'loaded')
                    .map((c) => (
                      <Option key={c.containerNo} value={c.containerNo}>
                        {c.containerNo} - {c.cargoDesc}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="车牌号码" name="plateNo">
                <Input placeholder="请输入车牌号" />
              </Form.Item>
            </Col>
          </Row>

          {selectedContainer && (
            <Descriptions column={2} size="small" bordered className="mb-4">
              <Descriptions.Item label="箱号">{selectedContainer.containerNo}</Descriptions.Item>
              <Descriptions.Item label="尺寸">{selectedContainer.size}</Descriptions.Item>
              <Descriptions.Item label="货物">{selectedContainer.cargoDesc}</Descriptions.Item>
              <Descriptions.Item label="堆场位置">
                {selectedContainer.yardBlock} {selectedContainer.yardSlot}
              </Descriptions.Item>
            </Descriptions>
          )}

          <Form.Item label="选择日期">
            <DatePicker
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="选择时段" required>
            <Alert
              message="系统推荐"
              description="选择带星标的推荐时段可减少堆场等待时间"
              type="info"
              showIcon
              size="small"
              className="mb-3"
            />
            <Row gutter={[12, 12]}>
              {timeSlots.map((slot) => (
                <Col xs={12} sm={8} key={slot.slot}>
                  <div
                    className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                      selectedSlot === slot.slot
                        ? 'border-[#3E92CC] bg-blue-50 ring-2 ring-blue-200'
                        : getSlotColor(slot)
                    } ${slot.available === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                    onClick={() => slot.available > 0 && handleSlotSelect(slot.slot)}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${getSlotTextColor(slot)}`}>{slot.slot}</span>
                      {slot.recommended && (
                        <Tag color="gold" className="!m-0">
                          <IconMap name="Star" size={10} className="mr-0.5" />
                          推荐
                        </Tag>
                      )}
                    </div>
                    <div className="mt-2">
                      <Progress
                        percent={Math.round(((slot.total - slot.available) / slot.total) * 100)}
                        size="small"
                        showInfo={false}
                        strokeColor={
                          slot.busyLevel === 'high'
                            ? '#EF4444'
                            : slot.busyLevel === 'medium'
                            ? '#FF6B35'
                            : '#2EC4B6'
                        }
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      剩余{slot.available}/{slot.total}个名额
                    </p>
                    <p className="text-xs text-gray-400">
                      {slot.busyLevel === 'high' ? '繁忙' : slot.busyLevel === 'medium' ? '适中' : '空闲'}
                    </p>
                  </div>
                </Col>
              ))}
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="预约超时提醒"
        open={showReleaseModal}
        onCancel={() => {
          setShowReleaseModal(false);
          setCountdown(0);
          setReleaseInfo(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setShowReleaseModal(false);
            setCountdown(0);
            setReleaseInfo(null);
          }}>
            我已到场
          </Button>,
        ]}
      >
        <Alert
          message="预约即将超时"
          description={`您的预约 ${releaseInfo?.timeSlot} 时段即将超时，系统将在 ${Math.floor(countdown / 60)}分${countdown % 60}秒 后自动释放并扣除违约金200元`}
          type="warning"
          showIcon
        />
      </Modal>
    </div>
  );
};

export default DriverAppointment;

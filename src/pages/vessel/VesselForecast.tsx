
import React, { useState } from 'react';
import { Table, Tag, Button, Space, Modal, Form, Input, DatePicker, Select, Card, Row, Col, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { mockForecasts, mockVessels, generateMockId } from '@/services/mockData';
import { VesselForecast } from '@/types';
import { formatDateTime, getStatusColor, getStatusText } from '@/utils/format';
import { IconMap } from '@/components/IconMap';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const VesselForecastPage: React.FC = () => {
  const [data, setData] = useState<VesselForecast[]>(mockForecasts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const columns: ColumnsType<VesselForecast> = [
    {
      title: '预报编号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text) => <span className="font-mono text-sm">{text}</span>,
    },
    {
      title: '船舶名称',
      dataIndex: 'vesselName',
      key: 'vesselName',
      width: 150,
      render: (text) => (
        <span className="font-medium">
          <IconMap name="Ship" size={14} className="mr-1 inline text-[#3E92CC]" />
          {text}
        </span>
      ),
    },
    {
      title: '预计到港',
      dataIndex: 'eta',
      key: 'eta',
      width: 170,
      render: (text) => formatDateTime(text),
    },
    {
      title: '预计离港',
      dataIndex: 'etd',
      key: 'etd',
      width: 170,
      render: (text) => formatDateTime(text),
    },
    {
      title: '上一港/下一港',
      key: 'ports',
      width: 180,
      render: (_, record) => (
        <div>
          <div className="text-sm">
            <span className="text-gray-500">起：</span>
            {record.originPort}
          </div>
          <div className="text-sm">
            <span className="text-gray-500">迄：</span>
            {record.nextPort}
          </div>
        </div>
      ),
    },
    {
      title: '装卸箱量',
      key: 'teu',
      width: 140,
      render: (_, record) => (
        <div>
          <div className="text-sm text-emerald-600">卸: {record.teuIn} TEU</div>
          <div className="text-sm text-blue-600">装: {record.teuOut} TEU</div>
        </div>
      ),
    },
    {
      title: '推荐靠泊',
      key: 'recommend',
      width: 200,
      render: (_, record) =>
        record.recommendedBerth ? (
          <div className="text-sm">
            <Tag color="blue">{record.recommendedBerth} 泊位</Tag>
            <div className="mt-1 text-gray-500">{formatDateTime(record.recommendedTime)}</div>
          </div>
        ) : (
          <span className="text-gray-400">待系统推荐</span>
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      render: (text) => formatDateTime(text),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<IconMap name="Eye" size={14} />}>
            详情
          </Button>
          {record.status === 'pending' && (
            <>
              <Button type="link" size="small" icon={<IconMap name="Edit" size={14} />}>
                编辑
              </Button>
              <Button type="link" size="small" danger icon={<IconMap name="Trash2" size={14} />}>
                删除
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleSubmit = (values: any) => {
    const newForecast: VesselForecast = {
      id: generateMockId(),
      vesselId: values.vessel,
      vesselName: mockVessels.find((v) => v.id === values.vessel)?.name || '',
      eta: values.timeRange[0].format('YYYY-MM-DD HH:mm'),
      etd: values.timeRange[1].format('YYYY-MM-DD HH:mm'),
      originPort: values.originPort,
      nextPort: values.nextPort,
      cargoType: values.cargoType || '集装箱',
      teuIn: values.teuIn || 0,
      teuOut: values.teuOut || 0,
      status: 'pending',
      createTime: dayjs().format('YYYY-MM-DD HH:mm'),
    };
    setData([newForecast, ...data]);
    setIsModalOpen(false);
    form.resetFields();
    message.success('到港预报提交成功，等待系统审核');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">到港预报</h1>
          <p className="mt-1 text-gray-500">提交和管理船舶到港预报信息</p>
        </div>
        <Button type="primary" icon={<IconMap name="Plus" size={16} />} onClick={() => setIsModalOpen(true)}>
          提交预报
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={6}>
            <Select placeholder="选择船舶" allowClear className="!w-full" size="middle">
              {mockVessels.map((v) => (
                <Option key={v.id} value={v.id}>
                  {v.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker showTime className="!w-full" size="middle" />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select placeholder="状态筛选" allowClear className="!w-full" size="middle">
              <Option value="pending">待审核</Option>
              <Option value="approved">已批准</Option>
              <Option value="rejected">已拒绝</Option>
              <Option value="arrived">已到港</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button icon={<IconMap name="Search" size={16} />}>搜索</Button>
              <Button icon={<IconMap name="RefreshCw" size={16} />}>重置</Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条记录` }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title="提交到港预报"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="vessel" label="选择船舶" rules={[{ required: true, message: '请选择船舶' }]}>
                <Select placeholder="请选择船舶" size="large">
                  {mockVessels.map((v) => (
                    <Option key={v.id} value={v.id}>
                      {v.name} (IMO: {v.imo})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="timeRange"
                label="预计到港/离港时间"
                rules={[{ required: true, message: '请选择时间范围' }]}
              >
                <RangePicker showTime style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="originPort" label="上一挂港" rules={[{ required: true, message: '请输入上一挂港' }]}>
                <Input placeholder="请输入上一挂港" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nextPort" label="下一挂港" rules={[{ required: true, message: '请输入下一挂港' }]}>
                <Input placeholder="请输入下一挂港" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="teuIn" label="卸箱量 (TEU)" rules={[{ required: true, message: '请输入卸箱量' }]}>
                <Input type="number" placeholder="请输入卸箱量" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="teuOut" label="装箱量 (TEU)" rules={[{ required: true, message: '请输入装箱量' }]}>
                <Input type="number" placeholder="请输入装箱量" size="large" />
              </Form.Item>
            </Col>
          </Row>
          <div className="flex justify-end gap-3">
            <Button size="large" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button type="primary" size="large" htmlType="submit">
              提交预报
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default VesselForecastPage;

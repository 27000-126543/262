import React, { useState } from 'react';
import { Card, Row, Col, Form, Input, Button, Select, Table, Tag, Alert, Steps, Divider, Descriptions, message, Space } from 'antd';
import dayjs from 'dayjs';
import { mockContainers, mockOrders, mockYardBlocks, mockYardInstructions } from '@/services/mockData';
import { formatDateTime, formatNumber } from '@/utils/format';
import { IconMap } from '@/components/IconMap';
import type { Container, ShippingOrder, YardBlock } from '@/types';

const { Option } = Select;
const { Step } = Steps;

interface GateInRecord {
  id: string;
  containerNo: string;
  plateNo: string;
  orderNo: string;
  yardBlock: string;
  yardSlot: string;
  equipment: string;
  operator: string;
  status: string;
  createTime: string;
}

const ContainerGateIn: React.FC = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [identifiedContainer, setidentifiedContainer] = useState<Container | null>(null);
  const [matchedOrder, setMatchedOrder] = useState<ShippingOrder | null>(null);
  const [assignedYard, setAssignedYard] = useState<YardBlock | null>(null);
  const [assignedSlot, setAssignedSlot] = useState<string>('');
  const [gateInRecords, setGateInRecords] = useState<GateInRecord[]>([
    {
      id: 'g1',
      containerNo: 'MSKU1234567',
      plateNo: '粤B12345',
      orderNo: 'SO202401001',
      yardBlock: 'A1',
      yardSlot: '01-02-03',
      equipment: 'RT01',
      operator: '王司机',
      status: 'completed',
      createTime: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm'),
    },
    {
      id: 'g2',
      containerNo: 'COSU7654321',
      plateNo: '粤B67890',
      orderNo: 'SO202401002',
      yardBlock: 'A1',
      yardSlot: '01-03-02',
      equipment: 'RT02',
      operator: '李司机',
      status: 'in-progress',
      createTime: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm'),
    },
  ]);

  const handleIdentify = () => {
    const { containerNo, plateNo } = form.getFieldsValue();
    
    if (!containerNo || !plateNo) {
      message.warning('请输入箱号和车牌号');
      return;
    }

    let container = mockContainers.find((c) => c.containerNo.toUpperCase() === containerNo.toUpperCase());
    
    if (!container) {
      container = {
        id: `c${Date.now()}`,
        containerNo: containerNo.toUpperCase(),
        size: '40HQ',
        type: '干货箱',
        status: 'loaded',
        weight: 15000,
        cargoDesc: '普通货物',
      };
    }

    setidentifiedContainer(container);
    const order = mockOrders.find((o) => o.containerNos.includes(container!.containerNo));
    setMatchedOrder(order || null);

    const availableYard = mockYardBlocks.find((y) => y.usedSlots < y.totalSlots * 0.85);
    if (availableYard) {
      setAssignedYard(availableYard);
      const slot = `${String(Math.floor(Math.random() * availableYard.maxBay)).padStart(2, '0')}-${String(Math.floor(Math.random() * availableYard.maxRow)).padStart(2, '0')}-${String(Math.floor(Math.random() * availableYard.maxTier)).padStart(2, '0')}`;
      setAssignedSlot(slot);
    }

    setCurrentStep(1);
    message.success('箱号和车牌识别成功');
  };

  const handleConfirmAndPush = () => {
    if (!assignedYard || !identifiedContainer) return;

    const newRecord: GateInRecord = {
      id: `g${Date.now()}`,
      containerNo: identifiedContainer.containerNo,
      plateNo: form.getFieldValue('plateNo'),
      orderNo: matchedOrder?.orderNo || '-',
      yardBlock: assignedYard.blockNo,
      yardSlot: assignedSlot,
      equipment: assignedYard.equipmentAssigned[0] || 'RT01',
      operator: '系统分配中',
      status: 'pending',
      createTime: dayjs().format('YYYY-MM-DD HH:mm'),
    };

    setGateInRecords([newRecord, ...gateInRecords]);
    setCurrentStep(2);
    message.success('堆场位置已分配，作业指令已推送到堆场机械');
  };

  const handleReset = () => {
    form.resetFields();
    setCurrentStep(0);
    setidentifiedContainer(null);
    setMatchedOrder(null);
    setAssignedYard(null);
    setAssignedSlot('');
  };

  const columns = [
    {
      title: '箱号',
      dataIndex: 'containerNo',
      key: 'containerNo',
      render: (text: string) => <span className="font-mono font-medium">{text}</span>,
    },
    { title: '车牌号', dataIndex: 'plateNo', key: 'plateNo' },
    { title: '运单号', dataIndex: 'orderNo', key: 'orderNo' },
    {
      title: '堆场位置',
      key: 'location',
      render: (_: any, record: GateInRecord) => (
        <span>
          <Tag color="blue">{record.yardBlock}</Tag>
          <span className="text-sm text-gray-500">{record.yardSlot}</span>
        </span>
      ),
    },
    { title: '作业设备', dataIndex: 'equipment', key: 'equipment' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag
          color={
            status === 'completed'
              ? 'success'
              : status === 'in-progress'
              ? 'processing'
              : 'warning'
          }
        >
          {status === 'completed' ? '已完成' : status === 'in-progress' ? '作业中' : '待作业'}
        </Tag>
      ),
    },
    {
      title: '进闸时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text: string) => formatDateTime(text),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">集装箱进闸</h1>
        <p className="mt-1 text-gray-500">自动识别箱号车牌，智能分配堆场位置</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card title="进闸登记" className="border-0 shadow-sm">
            <Steps current={currentStep} className="mb-6" size="small">
              <Step title="信息录入" icon={<IconMap name="Scan" size={16} />} />
              <Step title="识别匹配" icon={<IconMap name="Search" size={16} />} />
              <Step title="分配完成" icon={<IconMap name="Check" size={16} />} />
            </Steps>

            {currentStep === 0 && (
              <Form form={form} layout="vertical">
                <Form.Item label="集装箱箱号" name="containerNo" rules={[{ required: true, message: '请输入箱号' }]}>
                  <Input
                    placeholder="请输入或扫描箱号"
                    size="large"
                    prefix={<IconMap name="Package" size={18} className="text-gray-400" />}
                  />
                </Form.Item>
                <Form.Item label="车牌号码" name="plateNo" rules={[{ required: true, message: '请输入车牌号' }]}>
                  <Input
                    placeholder="请输入或扫描车牌号"
                    size="large"
                    prefix={<IconMap name="Truck" size={18} className="text-gray-400" />}
                  />
                </Form.Item>
                <Form.Item label="集装箱尺寸" name="containerSize">
                  <Select placeholder="选择集装箱尺寸" size="large">
                    <Option value="20GP">20GP - 20英尺普通箱</Option>
                    <Option value="40GP">40GP - 40英尺普通箱</Option>
                    <Option value="40HQ">40HQ - 40英尺高箱</Option>
                    <Option value="45HQ">45HQ - 45英尺高箱</Option>
                  </Select>
                </Form.Item>
                <Button type="primary" size="large" block onClick={handleIdentify} icon={<IconMap name="Scan" size={16} />}>
                  识别并匹配
                </Button>
              </Form>
            )}

            {currentStep >= 1 && (
              <div className="space-y-4">
                {identifiedContainer && (
                  <Alert
                    message="识别成功"
                    description={`已识别集装箱: ${identifiedContainer.containerNo}`}
                    type="success"
                    showIcon
                  />
                )}

                <Descriptions column={1} size="small" bordered className="mt-4">
                  <Descriptions.Item label="箱号">
                    <span className="font-mono">{identifiedContainer?.containerNo}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="尺寸/类型">
                    {identifiedContainer?.size} / {identifiedContainer?.type}
                  </Descriptions.Item>
                  <Descriptions.Item label="货物描述">{identifiedContainer?.cargoDesc || '-'}</Descriptions.Item>
                  <Descriptions.Item label="重量">
                    {identifiedContainer?.weight ? formatNumber(identifiedContainer.weight) + ' kg' : '-'}
                  </Descriptions.Item>
                </Descriptions>

                {matchedOrder && (
                  <>
                    <Divider orientation="left">匹配运单信息</Divider>
                    <Descriptions column={1} size="small" bordered>
                      <Descriptions.Item label="运单号">{matchedOrder.orderNo}</Descriptions.Item>
                      <Descriptions.Item label="发货人">{matchedOrder.shipper}</Descriptions.Item>
                      <Descriptions.Item label="收货人">{matchedOrder.consignee}</Descriptions.Item>
                      <Descriptions.Item label="目的港">{matchedOrder.pod}</Descriptions.Item>
                    </Descriptions>
                  </>
                )}

                {assignedYard && currentStep >= 1 && (
                  <>
                    <Divider orientation="left">堆场分配结果</Divider>
                    <Alert
                      message="系统已自动分配堆场"
                      description={`推荐堆场: ${assignedYard.area} ${assignedYard.blockNo}区，箱位: ${assignedSlot}`}
                      type="info"
                      showIcon
                      icon={<IconMap name="MapPin" size={16} />}
                    />
                    <div className="rounded-lg bg-blue-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">分配设备</p>
                          <p className="font-bold text-[#0A2463]">{assignedYard.equipmentAssigned.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">当前利用率</p>
                          <p className="font-bold text-[#3E92CC]">
                            {Math.round((assignedYard.usedSlots / assignedYard.totalSlots) * 100)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">可用箱位</p>
                          <p className="font-bold text-emerald-600">
                            {assignedYard.totalSlots - assignedYard.usedSlots}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 1 && (
                  <Space className="w-full">
                    <Button type="primary" size="large" block onClick={handleConfirmAndPush} icon={<IconMap name="Send" size={16} />}>
                      确认并推送作业指令
                    </Button>
                    <Button block onClick={handleReset}>重新录入</Button>
                  </Space>
                )}

                {currentStep === 2 && (
                  <>
                    <Alert
                      message="作业指令已推送"
                      description="作业指令已成功发送至堆场龙门吊司机终端"
                      type="success"
                      showIcon
                    />
                    <Button type="primary" block onClick={handleReset}>
                      继续登记
                    </Button>
                  </>
                )}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card title="今日进闸记录" className="border-0 shadow-sm">
            <Table
              columns={columns}
              dataSource={gateInRecords}
              rowKey="id"
              pagination={{ pageSize: 6 }}
              size="small"
            />
          </Card>

          <Card title="堆场实时状态" className="mt-4 border-0 shadow-sm">
            <Row gutter={[12, 12]}>
              {mockYardBlocks.map((block) => (
                <Col xs={12} sm={8} key={block.id}>
                  <div
                    className="rounded-xl border p-4 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800">{block.blockNo}</span>
                      <Tag
                        color={
                          block.usedSlots / block.totalSlots > 0.8
                            ? 'error'
                            : block.usedSlots / block.totalSlots > 0.6
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {Math.round((block.usedSlots / block.totalSlots) * 100)}%
                      </Tag>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{block.area}</p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full progress-gradient"
                        style={{ width: `${(block.usedSlots / block.totalSlots) * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {block.usedSlots}/{block.totalSlots} 已用
                    </p>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ContainerGateIn;

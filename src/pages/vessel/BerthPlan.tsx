import React, { useState } from 'react';
import { Card, Row, Col, Table, Tag, Select, DatePicker, Space, Button, Modal, Form, Input, InputNumber, Timeline, Alert, Divider, List } from 'antd';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { mockBerthInfos, mockBerthPlans, mockTideData, mockForecasts, mockVessels } from '@/services/mockData';
import { formatDateTime, getStatusColor, getStatusText } from '@/utils/format';
import { IconMap } from '@/components/IconMap';
import type { BerthPlan, VesselForecast } from '@/types';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

interface RecommendOption {
  berthNo: string;
  berthName: string;
  recommendTime: string;
  score: number;
  reason: string;
  tideHeight: number;
}

const BerthPlanPage: React.FC = () => {
  const [berthPlans, setBerthPlans] = useState<BerthPlan[]>(mockBerthPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForecast, setSelectedForecast] = useState<VesselForecast | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendOption[]>([]);
  const [selectedRecommend, setSelectedRecommend] = useState<RecommendOption | null>(null);
  const [form] = Form.useForm();

  const tideOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: mockTideData.map((t) => dayjs(t.time).format('HH:mm')),
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: 'value',
      name: '潮高(m)',
      min: 5,
      max: 15,
    },
    series: [
      {
        name: '潮高',
        type: 'line',
        smooth: true,
        data: mockTideData.map((t) => t.height.toFixed(1)),
        areaStyle: { color: 'rgba(62, 146, 204, 0.3)' },
        lineStyle: { color: '#3E92CC', width: 3 },
        itemStyle: { color: '#3E92CC' },
        markLine: {
          data: [{ yAxis: 12, lineStyle: { color: '#FF6B35', type: 'dashed' }, label: { formatter: '安全水深' } }],
        },
      },
    ],
  };

  const columns = [
    {
      title: '船舶名称',
      dataIndex: 'vesselName',
      key: 'vesselName',
      render: (text: string, record: any) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <IconMap name="Ship" size={16} className="text-[#3E92CC]" />
          </div>
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    { title: '泊位', dataIndex: 'berthNo', key: 'berthNo' },
    {
      title: '靠泊时间',
      dataIndex: 'berthTime',
      key: 'berthTime',
      render: (text: string) => formatDateTime(text),
    },
    {
      title: '离泊时间',
      dataIndex: 'departureTime',
      key: 'departureTime',
      render: (text: string) => formatDateTime(text),
    },
    { title: '作业类型', dataIndex: 'operationType', key: 'operationType' },
    {
      title: '配载桥吊',
      dataIndex: 'craneAssigned',
      key: 'craneAssigned',
      render: (cranes: string[]) => cranes.map((c) => <Tag key={c} color="blue">{c}</Tag>),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
  ];

  const generateRecommendations = (forecast: VesselForecast) => {
    const vessel = mockVessels.find((v) => v.id === forecast.vesselId);
    if (!vessel) return;

    const options: RecommendOption[] = [];
    mockBerthInfos.forEach((berth) => {
      if (berth.status === 'maintenance') return;
      if (berth.length < vessel.length) return;
      if (berth.maxDraft < vessel.draft) return;

      const availableTime = berth.availableFrom ? dayjs(berth.availableFrom) : dayjs();
      const etaTime = dayjs(forecast.eta);

      for (let offset = 0; offset < 48; offset += 6) {
        const checkTime = availableTime.isAfter(etaTime) ? availableTime.add(offset, 'hour') : etaTime.add(offset, 'hour');
        const hourIdx = checkTime.hour();
        const tide = mockTideData[hourIdx];

        if (tide && tide.height >= 12) {
          const score = Math.round((tide.height / vessel.draft) * 50 + (1 - offset / 48) * 50);
          options.push({
            berthNo: berth.berthNo,
            berthName: berth.name,
            recommendTime: checkTime.format('YYYY-MM-DD HH:mm'),
            score,
            reason: `潮高${tide.height.toFixed(1)}m，满足吃水要求，泊位${berth.length}m适配船长${vessel.length}m`,
            tideHeight: tide.height,
          });
        }
      }
    });

    options.sort((a, b) => b.score - a.score);
    setRecommendations(options.slice(0, 5));
  };

  const handleCreatePlan = () => {
    setIsModalOpen(true);
  };

  const handleForecastSelect = (forecastId: string) => {
    const forecast = mockForecasts.find((f) => f.id === forecastId);
    if (forecast) {
      setSelectedForecast(forecast);
      generateRecommendations(forecast);
    }
  };

  const handleRecommendSelect = (rec: RecommendOption) => {
    setSelectedRecommend(rec);
    form.setFieldsValue({
      berthNo: rec.berthNo,
      berthTime: dayjs(rec.recommendTime),
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const newPlan: BerthPlan = {
        id: `bp${Date.now()}`,
        vesselId: selectedForecast?.vesselId || '',
        vesselName: selectedForecast?.vesselName || '',
        berthNo: values.berthNo,
        berthTime: dayjs(values.berthTime).format('YYYY-MM-DD HH:mm'),
        departureTime: dayjs(values.berthTime).add(48, 'hour').format('YYYY-MM-DD HH:mm'),
        status: 'scheduled',
        operationType: '装卸作业',
        craneAssigned: ['QC01', 'QC02'],
      };
      setBerthPlans([newPlan, ...berthPlans]);
      setIsModalOpen(false);
      setSelectedForecast(null);
      setSelectedRecommend(null);
      form.resetFields();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">泊位计划</h1>
          <p className="mt-1 text-gray-500">智能推荐最优靠泊时间，生成泊位计划</p>
        </div>
        <Button type="primary" icon={<IconMap name="Plus" size={16} />} onClick={handleCreatePlan}>
          生成泊位计划
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="24小时潮汐预报" className="border-0 shadow-sm">
            <ReactECharts option={tideOption} style={{ height: 280 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="泊位状态概览" className="border-0 shadow-sm">
            <div className="space-y-3">
              {mockBerthInfos.map((berth) => (
                <div key={berth.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div>
                    <p className="font-medium text-gray-800">{berth.name}</p>
                    <p className="text-xs text-gray-500">长{berth.length}m · 水深{berth.maxDraft}m</p>
                  </div>
                  <Tag
                    color={
                      berth.status === 'available'
                        ? 'success'
                        : berth.status === 'occupied'
                        ? 'warning'
                        : berth.status === 'scheduled'
                        ? 'processing'
                        : 'error'
                    }
                  >
                    {berth.status === 'available'
                      ? '空闲'
                      : berth.status === 'occupied'
                      ? '作业中'
                      : berth.status === 'scheduled'
                      ? '已排程'
                      : '维护中'}
                  </Tag>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="泊位计划列表"
        className="border-0 shadow-sm"
        extra={
          <Space>
            <Select defaultValue="all" className="!w-32">
              <Option value="all">全部状态</Option>
              <Option value="scheduled">计划中</Option>
              <Option value="berthed">已靠泊</Option>
              <Option value="completed">已完成</Option>
            </Select>
            <RangePicker />
          </Space>
        }
      >
        <Table columns={columns} dataSource={berthPlans} rowKey="id" pagination={{ pageSize: 8 }} />
      </Card>

      <Modal
        title="生成泊位计划"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedForecast(null);
          setSelectedRecommend(null);
          setRecommendations([]);
          form.resetFields();
        }}
        onOk={handleSubmit}
        width={900}
        okText="确认生成"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item label="选择到港预报" name="forecastId" rules={[{ required: true, message: '请选择到港预报' }]}>
                <Select placeholder="请选择到港预报" onChange={handleForecastSelect}>
                  {mockForecasts
                    .filter((f) => f.status === 'approved')
                    .map((f) => (
                      <Option key={f.id} value={f.id}>
                        {f.vesselName} - 预计{dayjs(f.eta).format('MM-DD HH:mm')}到港
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="选择泊位" name="berthNo" rules={[{ required: true, message: '请选择泊位' }]}>
                <Select placeholder="请选择泊位">
                  {mockBerthInfos
                    .filter((b) => b.status !== 'maintenance')
                    .map((b) => (
                      <Option key={b.berthNo} value={b.berthNo}>
                        {b.name} - 长{b.length}m/水深{b.maxDraft}m
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="靠泊时间" name="berthTime" rules={[{ required: true, message: '请选择靠泊时间' }]}>
                <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="备注" name="remarks">
                <TextArea rows={1} placeholder="可选填写备注" />
              </Form.Item>
            </Col>
          </Row>

          {recommendations.length > 0 && (
            <>
              <Divider orientation="left">
                <span className="text-base font-medium">
                  <IconMap name="Lightbulb" size={16} className="mr-1 inline text-amber-500" />
                  智能推荐方案
                </span>
              </Divider>
              <Alert
                message="系统根据潮汐数据、泊位空闲情况和船舶参数智能推荐以下靠泊方案"
                type="info"
                showIcon
                className="mb-4"
              />
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
                dataSource={recommendations}
                renderItem={(item) => (
                  <List.Item>
                    <div
                      className={`w-full cursor-pointer rounded-xl border-2 p-4 transition-all ${
                        selectedRecommend?.recommendTime === item.recommendTime
                          ? 'border-[#3E92CC] bg-blue-50'
                          : 'border-gray-100 hover:border-blue-200'
                      }`}
                      onClick={() => handleRecommendSelect(item)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800">{item.berthName}</span>
                        <Tag color={item.score > 80 ? 'success' : item.score > 60 ? 'warning' : 'processing'}>
                          匹配度 {item.score}%
                        </Tag>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        <IconMap name="Clock" size={12} className="mr-1 inline" />
                        {dayjs(item.recommendTime).format('MM月DD日 HH:mm')}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">潮高: {item.tideHeight.toFixed(1)}m</p>
                      <p className="mt-2 text-xs text-gray-400">{item.reason}</p>
                    </div>
                  </List.Item>
                )}
              />
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default BerthPlanPage;

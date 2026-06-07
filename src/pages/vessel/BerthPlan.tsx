
import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Table, Tag, Select, DatePicker, Space, Button, Modal, Form, Input, Alert, Divider, List, Progress, Tooltip, Badge, Statistic } from 'antd';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { mockBerthInfos, mockBerthPlans, mockTideData, mockForecasts, mockVessels } from '@/services/mockData';
import { formatDateTime, getStatusColor, getStatusText } from '@/utils/format';
import { IconMap } from '@/components/IconMap';
import { calculateBerthRecommendation, formatScoreDetail, DEFAULT_PARAMS } from '@/utils/berthRecommendation';
import type { BerthPlan, VesselForecast } from '@/types';
import type { RecommendOption } from '@/utils/berthRecommendation';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const BerthPlanPage: React.FC = () => {
  const [berthPlans, setBerthPlans] = useState<BerthPlan[]>(mockBerthPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForecast, setSelectedForecast] = useState<VesselForecast | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendOption[]>([]);
  const [selectedRecommend, setSelectedRecommend] = useState<RecommendOption | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [form] = Form.useForm();

  const selectedVessel = useMemo(() => {
    if (!selectedForecast) return null;
    return mockVessels.find((v) => v.id === selectedForecast.vesselId) || null;
  }, [selectedForecast]);

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

  const handleCreatePlan = () => {
    setIsModalOpen(true);
    setRecommendations([]);
    setSelectedRecommend(null);
    setSelectedForecast(null);
    form.resetFields();
  };

  const handleForecastSelect = async (forecastId: string) => {
    const forecast = mockForecasts.find((f) => f.id === forecastId);
    if (!forecast) return;

    setSelectedForecast(forecast);
    setIsCalculating(true);
    setRecommendations([]);
    setSelectedRecommend(null);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const vessel = mockVessels.find((v) => v.id === forecast.vesselId);
    if (vessel) {
      const results = calculateBerthRecommendation(
        vessel,
        forecast,
        mockBerthInfos,
        berthPlans,
        mockTideData,
        DEFAULT_PARAMS
      );
      setRecommendations(results);
    }

    setIsCalculating(false);
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
      if (!selectedForecast) return;

      const vessel = mockVessels.find((v) => v.id === selectedForecast.vesselId);
      const totalTEU = selectedForecast.teuIn + selectedForecast.teuOut;
      const craneCount = vessel && vessel.teu > 15000 ? 4 : vessel && vessel.teu > 10000 ? 3 : 2;
      const cranes = Array.from({ length: craneCount }, (_, i) => `QC${String(i + 1).padStart(2, '0')}`);

      const newPlan: BerthPlan = {
        id: `bp${Date.now()}`,
        vesselId: selectedForecast.vesselId,
        vesselName: selectedForecast.vesselName,
        berthNo: values.berthNo,
        berthTime: dayjs(values.berthTime).format('YYYY-MM-DD HH:mm'),
        departureTime: dayjs(values.berthTime).add(totalTEU > 5000 ? 48 : 36, 'hour').format('YYYY-MM-DD HH:mm'),
        status: 'scheduled',
        operationType: '装卸作业',
        craneAssigned: cranes,
      };

      setBerthPlans([newPlan, ...berthPlans]);
      setIsModalOpen(false);
      setSelectedForecast(null);
      setSelectedRecommend(null);
      form.resetFields();
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#2EC4B6';
    if (score >= 60) return '#3E92CC';
    if (score >= 40) return '#FF6B35';
    return '#EF4444';
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
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm">
            <Statistic
              title="泊位利用率"
              value={76.5}
              suffix="%"
              valueStyle={{ color: '#0A2463' }}
              prefix={<IconMap name="Anchor" size={20} />}
            />
            <Progress percent={76.5} strokeColor="#3E92CC" showInfo={false} className="mt-3" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm">
            <Statistic
              title="在港船舶"
              value={2}
              suffix="艘"
              valueStyle={{ color: '#2EC4B6' }}
              prefix={<IconMap name="Ship" size={20} />}
            />
            <p className="mt-2 text-sm text-gray-500">计划内: {berthPlans.filter((p) => p.status === 'scheduled').length} 艘</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm">
            <Statistic
              title="今日作业量"
              value={3280}
              suffix="TEU"
              valueStyle={{ color: '#FF6B35' }}
              prefix={<IconMap name="Package" size={20} />}
            />
            <p className="mt-2 text-sm text-emerald-600">
              <IconMap name="TrendingUp" size={14} className="mr-1 inline" />
              较昨日 +8.2%
            </p>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm">
            <Statistic
              title="待排预报"
              value={mockForecasts.filter((f) => f.status === 'approved' && !f.recommendedBerth).length}
              suffix="条"
              valueStyle={{ color: '#8B5CF6' }}
              prefix={<IconMap name="Clock" size={20} />}
            />
            <p className="mt-2 text-sm text-gray-500">等待生成泊位计划</p>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="24小时潮汐预报" className="border-0 shadow-sm" extra={<Tag color="blue">实时数据</Tag>}>
            <ReactECharts option={tideOption} style={{ height: 280 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="泊位状态概览" className="border-0 shadow-sm">
            <div className="space-y-3">
              {mockBerthInfos.map((berth) => (
                <div key={berth.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-800">{berth.name}</p>
                    <p className="text-xs text-gray-500">长{berth.length}m · 水深{berth.maxDraft}m</p>
                    {berth.currentVessel && berth.status !== 'available' && (
                      <p className="text-xs text-[#3E92CC]">{berth.currentVessel}</p>
                    )}
                  </div>
                  <Badge
                    status={
                      berth.status === 'available'
                        ? 'success'
                        : berth.status === 'occupied'
                        ? 'warning'
                        : berth.status === 'scheduled'
                        ? 'processing'
                        : 'error'
                    }
                    text={
                      berth.status === 'available'
                        ? '空闲'
                        : berth.status === 'occupied'
                        ? '作业中'
                        : berth.status === 'scheduled'
                        ? '已排程'
                        : '维护中'
                    }
                  />
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
        width={1000}
        okText="确认生成"
        cancelText="取消"
        confirmLoading={isCalculating}
      >
        <Form form={form} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item label="选择到港预报" name="forecastId" rules={[{ required: true, message: '请选择到港预报' }]}>
                <Select placeholder="请选择到港预报" onChange={handleForecastSelect} loading={isCalculating}>
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

          {selectedForecast && selectedVessel && (
            <Card size="small" className="mb-4 border-0 bg-blue-50">
              <Row gutter={[16, 8]}>
                <Col xs={12} sm={6}>
                  <p className="text-xs text-gray-500">船舶名称</p>
                  <p className="font-bold text-[#0A2463]">{selectedVessel.name}</p>
                </Col>
                <Col xs={12} sm={6}>
                  <p className="text-xs text-gray-500">船长 / 吃水</p>
                  <p className="font-medium">{selectedVessel.length}m / {selectedVessel.draft}m</p>
                </Col>
                <Col xs={12} sm={6}>
                  <p className="text-xs text-gray-500">装卸箱量</p>
                  <p className="font-medium">
                    {selectedForecast.teuIn} / {selectedForecast.teuOut} TEU
                  </p>
                </Col>
                <Col xs={12} sm={6}>
                  <p className="text-xs text-gray-500">预计到港</p>
                  <p className="font-medium">{dayjs(selectedForecast.eta).format('MM-DD HH:mm')}</p>
                </Col>
              </Row>
            </Card>
          )}

          {isCalculating && (
            <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-center">
                <div className="mx-auto mb-3 animate-spin">
                  <IconMap name="Loader" size={32} className="text-[#3E92CC]" />
                </div>
                <p className="text-gray-600">正在智能计算最优靠泊方案...</p>
                <p className="mt-1 text-xs text-gray-400">综合潮汐、泊位、船舶参数进行匹配</p>
              </div>
            </div>
          )}

          {!isCalculating && recommendations.length > 0 && (
            <>
              <Divider orientation="left">
                <span className="text-base font-medium">
                  <IconMap name="Lightbulb" size={16} className="mr-1 inline text-amber-500" />
                  智能推荐方案
                  <Tag color="success" className="ml-2">TOP {recommendations.length}</Tag>
                </span>
              </Divider>
              <Alert
                message={`系统为"${selectedForecast?.vesselName}"匹配到${recommendations.length}个最优靠泊方案，点击方案可快速填充`}
                type="info"
                showIcon
                className="mb-4"
              />
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
                dataSource={recommendations}
                renderItem={(item, index) => (
                  <List.Item>
                    <div
                      className={`w-full cursor-pointer rounded-xl border-2 p-4 transition-all ${
                        selectedRecommend?.recommendTime === item.recommendTime
                          ? 'border-[#3E92CC] bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-100 hover:border-blue-200 hover:shadow-md'
                      }`}
                      onClick={() => handleRecommendSelect(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <Badge count="TOP1" className="!rounded-full !bg-amber-500 !text-white" />
                          )}
                          <span className="font-bold text-gray-800">{item.berthName}</span>
                        </div>
                        <Tooltip title={formatScoreDetail(item.scoreDetail)}>
                          <span
                            className="rounded-full px-3 py-1 text-sm font-bold"
                            style={{
                              backgroundColor: `${getScoreColor(item.score)}15`,
                              color: getScoreColor(item.score),
                            }}
                          >
                            {item.score}分
                          </span>
                        </Tooltip>
                      </div>

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">潮高匹配</span>
                          <Progress
                            percent={item.scoreDetail.tideScore}
                            size="small"
                            strokeColor="#3E92CC"
                            showInfo={false}
                            className="w-24"
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">船长适配</span>
                          <Progress
                            percent={item.scoreDetail.lengthScore}
                            size="small"
                            strokeColor="#2EC4B6"
                            showInfo={false}
                            className="w-24"
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">吃水适配</span>
                          <Progress
                            percent={item.scoreDetail.draftScore}
                            size="small"
                            strokeColor="#FF6B35"
                            showInfo={false}
                            className="w-24"
                          />
                        </div>
                      </div>

                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <p className="text-sm text-gray-600">
                          <IconMap name="Clock" size={12} className="mr-1 inline" />
                          {dayjs(item.recommendTime).format('MM月DD日 HH:mm')}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          潮高: {item.tideHeight.toFixed(1)}m
                        </p>
                        <p className="mt-2 text-xs text-gray-400 line-clamp-2">{item.reason}</p>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </>
          )}

          {!isCalculating && selectedForecast && recommendations.length === 0 && (
            <Alert
              message="未找到合适的靠泊方案"
              description="可能由于潮汐条件不满足或泊位全部占用，请调整参数后重试"
              type="warning"
              showIcon
            />
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default BerthPlanPage;

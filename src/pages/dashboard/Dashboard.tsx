
import React from 'react';
import { Card, Row, Col, Progress, Tag, List, Avatar, Button } from 'antd';
import ReactECharts from 'echarts-for-react';
import { mockDashboardStats, mockForecasts, mockClaims } from '@/services/mockData';
import { formatNumber, formatCurrency, formatPercent, formatTEU, getStatusColor, getStatusText, formatDateTime } from '@/utils/format';
import { IconMap } from '@/components/IconMap';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const stats = mockDashboardStats;

  const statCards = [
    {
      title: '本月到港船舶',
      value: stats.vesselCalls,
      unit: '艘次',
      icon: 'Ship',
      color: 'from-blue-500 to-blue-600',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: '本月集装箱吞吐量',
      value: formatNumber(stats.containerHandled),
      unit: 'TEU',
      icon: 'Package',
      color: 'from-emerald-500 to-emerald-600',
      trend: '+8.3%',
      trendUp: true,
    },
    {
      title: '本月营业收入',
      value: formatCurrency(stats.revenue),
      unit: '',
      icon: 'DollarSign',
      color: 'from-amber-500 to-amber-600',
      trend: '+15.2%',
      trendUp: true,
    },
    {
      title: '客户满意度',
      value: formatPercent(1 - stats.complaintRate),
      unit: '',
      icon: 'Star',
      color: 'from-purple-500 to-purple-600',
      trend: '+2.1%',
      trendUp: true,
    },
  ];

  const throughputOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['进港', '出港', '合计'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: stats.dailyThroughput.map((d) => d.date) },
    yAxis: { type: 'value', name: 'TEU' },
    series: [
      {
        name: '进港',
        type: 'line',
        smooth: true,
        data: stats.dailyThroughput.map((d) => d.teuIn),
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#3E92CC' },
      },
      {
        name: '出港',
        type: 'line',
        smooth: true,
        data: stats.dailyThroughput.map((d) => d.teuOut),
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#2EC4B6' },
      },
      {
        name: '合计',
        type: 'line',
        smooth: true,
        data: stats.dailyThroughput.map((d) => d.total),
        lineStyle: { type: 'dashed' },
        itemStyle: { color: '#FF6B35' },
      },
    ],
  };

  const berthUtilizationOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    series: [
      {
        type: 'bar',
        data: stats.berthUtilization,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#3E92CC' },
              { offset: 1, color: '#0A2463' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  const efficiencyGaugeOption = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 50,
        splitNumber: 5,
        radius: '100%',
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [0.3, '#FF6B6B'],
              [0.7, '#FFD93D'],
              [1, '#6BCB77'],
            ],
          },
        },
        pointer: { itemStyle: { color: '#0A2463' } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          formatter: '{value} 箱/小时',
          fontSize: 16,
          color: '#0A2463',
          offsetCenter: [0, '20%'],
        },
        data: [{ value: stats.operationEfficiency }],
      },
    ],
  };

  const quickActions = [
    { label: '到港预报', icon: 'Ship', path: '/vessel/forecast', color: 'bg-blue-100 text-blue-600' },
    { label: '提箱预约', icon: 'Truck', path: '/driver/appointment', color: 'bg-emerald-100 text-emerald-600' },
    { label: '费用账单', icon: 'Receipt', path: '/finance/bill', color: 'bg-amber-100 text-amber-600' },
    { label: '理赔申请', icon: 'AlertTriangle', path: '/claim/apply', color: 'bg-red-100 text-red-600' },
    { label: '报关管理', icon: 'FileCheck', path: '/customs/declaration', color: 'bg-purple-100 text-purple-600' },
    { label: '货物跟踪', icon: 'MapPin', path: '/container/tracking', color: 'bg-cyan-100 text-cyan-600' },
    { label: '运营看板', icon: 'BarChart3', path: '/dashboard/operation', color: 'bg-indigo-100 text-indigo-600' },
    { label: '会员中心', icon: 'Crown', path: '/member/center', color: 'bg-yellow-100 text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">首页驾驶舱</h1>
          <p className="mt-1 text-gray-500">欢迎回来，这是港口运营的最新数据概览</p>
        </div>
        <Button type="primary" icon={<IconMap name="RefreshCw" size={16} />}>
          刷新数据
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {statCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-800">
                    {card.value}
                    <span className="ml-1 text-sm font-normal text-gray-500">{card.unit}</span>
                  </p>
                  <p className={`mt-2 flex items-center text-sm ${card.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                    <IconMap name={card.trendUp ? 'TrendingUp' : 'TrendingDown'} size={14} className="mr-1" />
                    {card.trend}
                    <span className="ml-1 text-gray-400">较上月</span>
                  </p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.color}`}>
                  <IconMap name={card.icon} size={24} className="text-white" />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="近7天吞吐量趋势" className="border-0 shadow-sm" extra={<IconMap name="BarChart3" size={18} className="text-gray-400" />}>
            <ReactECharts option={throughputOption} style={{ height: 320 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="作业效率" className="border-0 shadow-sm" extra={<IconMap name="Gauge" size={18} className="text-gray-400" />}>
            <ReactECharts option={efficiencyGaugeOption} style={{ height: 280 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="泊位利用率" className="border-0 shadow-sm" extra={<IconMap name="Ship" size={18} className="text-gray-400" />}>
            <ReactECharts option={berthUtilizationOption} style={{ height: 280 }} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="堆场饱和度" className="border-0 shadow-sm" extra={<IconMap name="Boxes" size={18} className="text-gray-400" />}>
            <div className="space-y-6 px-4 py-2">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">A区堆场</span>
                  <span className="text-sm text-gray-500">72.5%</span>
                </div>
                <Progress percent={72.5} strokeColor="#3E92CC" showInfo={false} />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">B区堆场</span>
                  <span className="text-sm text-gray-500">59.7%</span>
                </div>
                <Progress percent={59.7} strokeColor="#2EC4B6" showInfo={false} />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">C区堆场</span>
                  <span className="text-sm text-gray-500">41.7%</span>
                </div>
                <Progress percent={41.7} strokeColor="#FF6B35" showInfo={false} />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">整体饱和度</span>
                  <span className="text-sm font-medium text-[#0A2463]">{formatPercent(stats.yardSaturation)}</span>
                </div>
                <Progress percent={stats.yardSaturation * 100} strokeColor={{ from: '#3E92CC', to: '#0A2463' }} showInfo={false} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="快捷操作"
            className="border-0 shadow-sm"
            extra={<IconMap name="Zap" size={18} className="text-gray-400" />}
          >
            <div className="grid grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2 rounded-xl p-4 transition-all hover:bg-gray-50"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color}`}>
                    <IconMap name={action.icon} size={24} />
                  </div>
                  <span className="text-sm text-gray-700">{action.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="待办事项"
            className="border-0 shadow-sm"
            extra={
              <Tag color="red" className="!rounded-full">
                {mockForecasts.filter((f) => f.status === 'pending').length + mockClaims.filter((c) => c.status === 'pending').length} 项待办
              </Tag>
            }
          >
            <List
              size="small"
              dataSource={[
                ...mockForecasts.filter((f) => f.status === 'pending').map((f) => ({
                  id: f.id,
                  title: `到港预报待审核：${f.vesselName}`,
                  time: f.createTime,
                  type: 'forecast',
                })),
                ...mockClaims.filter((c) => c.status === 'pending').map((c) => ({
                  id: c.id,
                  title: `理赔工单待处理：${c.claimNo}`,
                  time: c.createTime,
                  type: 'claim',
                })),
              ]}
              renderItem={(item) => (
                <List.Item className="!border-0 !px-0">
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        className={item.type === 'forecast' ? '!bg-blue-100' : '!bg-amber-100'}
                        icon={<IconMap name={item.type === 'forecast' ? 'Ship' : 'AlertTriangle'} size={16} className={item.type === 'forecast' ? 'text-blue-600' : 'text-amber-600'} />}
                      />
                    }
                    title={<span className="text-sm text-gray-800">{item.title}</span>}
                    description={<span className="text-xs text-gray-400">{formatDateTime(item.time)}</span>}
                  />
                  <Button type="link" size="small" className="!h-auto !p-0">
                    处理
                  </Button>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

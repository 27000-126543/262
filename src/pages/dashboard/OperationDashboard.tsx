import React from 'react';
import { Card, Row, Col, Progress, Table, Tag, Select, DatePicker, Space } from 'antd';
import ReactECharts from 'echarts-for-react';
import { mockDashboardStats, mockYardBlocks, mockBerthPlans } from '@/services/mockData';
import { formatPercent, formatNumber, formatDateTime, getStatusText, getStatusColor } from '@/utils/format';
import { IconMap } from '@/components/IconMap';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OperationDashboard: React.FC = () => {
  const stats = mockDashboardStats;

  const throughputTrendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['进港TEU', '出港TEU', '合计'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: stats.dailyThroughput.map((d: any) => d.date) },
    yAxis: { type: 'value', name: 'TEU' },
    series: [
      {
        name: '进港TEU',
        type: 'bar',
        stack: 'total',
        data: stats.dailyThroughput.map((d: any) => d.teuIn),
        itemStyle: { color: '#3E92CC' },
      },
      {
        name: '出港TEU',
        type: 'bar',
        stack: 'total',
        data: stats.dailyThroughput.map((d: any) => d.teuOut),
        itemStyle: { color: '#2EC4B6' },
      },
      {
        name: '合计',
        type: 'line',
        data: stats.dailyThroughput.map((d: any) => d.total),
        itemStyle: { color: '#FF6B35' },
        lineStyle: { width: 3 },
      },
    ],
  };

  const radarOption = {
    tooltip: {},
    radar: {
      indicator: [
        { name: '泊位利用率', max: 100 },
        { name: '闸口通过率', max: 100 },
        { name: '堆场利用率', max: 100 },
        { name: '作业效率', max: 100 },
        { name: '客户满意度', max: 100 },
      ],
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [78, 95, 72, 57, 97.7],
            name: '当前指标',
            areaStyle: { color: 'rgba(62, 146, 204, 0.3)' },
            lineStyle: { color: '#3E92CC' },
            itemStyle: { color: '#3E92CC' },
          },
          {
            value: [70, 90, 65, 50, 95],
            name: '目标值',
            areaStyle: { color: 'rgba(46, 196, 182, 0.2)' },
            lineStyle: { type: 'dashed', color: '#2EC4B6' },
            itemStyle: { color: '#2EC4B6' },
          },
        ],
      },
    ],
  };

  const yardColumns = [
    {
      title: '堆场区块',
      dataIndex: 'blockNo',
      key: 'blockNo',
      render: (text: string, record: any) => (
        <div>
          <span className="font-medium">{text}</span>
          <div className="text-xs text-gray-500">{record.area}</div>
        </div>
      ),
    },
    {
      title: '总箱位',
      dataIndex: 'totalSlots',
      key: 'totalSlots',
      render: (num: number) => formatNumber(num),
    },
    {
      title: '已用箱位',
      dataIndex: 'usedSlots',
      key: 'usedSlots',
      render: (num: number) => formatNumber(num),
    },
    {
      title: '利用率',
      key: 'utilization',
      render: (_: any, record: any) => (
        <div>
          <Progress
            percent={Math.round((record.usedSlots / record.totalSlots) * 100)}
            size="small"
            strokeColor={
              record.usedSlots / record.totalSlots > 0.8
                ? '#FF6B35'
                : record.usedSlots / record.totalSlots > 0.6
                ? '#3E92CC'
                : '#2EC4B6'
            }
          />
        </div>
      ),
    },
    {
      title: '分配设备',
      dataIndex: 'equipmentAssigned',
      key: 'equipmentAssigned',
      render: (equip: string[]) => equip.map((e) => <Tag key={e} color="blue">{e}</Tag>),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">运营看板</h1>
          <p className="mt-1 text-gray-500">实时监控港口各环节运营数据</p>
        </div>
        <Space>
          <Select defaultValue="all" className="!w-32">
            <Option value="all">全部码头</Option>
            <Option value="A">A码头</Option>
            <Option value="B">B码头</Option>
          </Select>
          <RangePicker />
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">泊位利用率</p>
                <p className="mt-2 text-2xl font-bold text-[#0A2463]">
                  {formatPercent(stats.berthUtilization.reduce((a: number, b: number) => a + b, 0) / stats.berthUtilization.length / 100)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <IconMap name="Ship" size={24} className="text-[#3E92CC]" />
              </div>
            </div>
            <div className="mt-4">
              <Progress
                percent={Math.round(stats.berthUtilization.reduce((a: number, b: number) => a + b, 0) / stats.berthUtilization.length)}
                strokeColor="#3E92CC"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">闸口通过率</p>
                <p className="mt-2 text-2xl font-bold text-[#0A2463]">
                  {formatPercent(stats.gatePassRate.reduce((a: number, b: number) => a + b, 0) / stats.gatePassRate.length / 100)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <IconMap name="Truck" size={24} className="text-[#2EC4B6]" />
              </div>
            </div>
            <div className="mt-4">
              <Progress
                percent={Math.round(stats.gatePassRate.reduce((a: number, b: number) => a + b, 0) / stats.gatePassRate.length)}
                strokeColor="#2EC4B6"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">堆场饱和度</p>
                <p className="mt-2 text-2xl font-bold text-[#0A2463]">{formatPercent(stats.yardSaturation)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <IconMap name="Package" size={24} className="text-[#FF6B35]" />
              </div>
            </div>
            <div className="mt-4">
              <Progress
                percent={Math.round(stats.yardSaturation * 100)}
                strokeColor="#FF6B35"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">客户投诉率</p>
                <p className="mt-2 text-2xl font-bold text-[#0A2463]">{formatPercent(stats.complaintRate)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <IconMap name="AlertCircle" size={24} className="text-purple-500" />
              </div>
            </div>
            <div className="mt-4">
              <Progress
                percent={Math.round(stats.complaintRate * 100 * 10)}
                strokeColor="#8B5CF6"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="吞吐量趋势" className="border-0 shadow-sm">
            <ReactECharts option={throughputTrendOption} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="综合运营指标" className="border-0 shadow-sm">
            <ReactECharts option={radarOption} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="堆场利用情况" className="border-0 shadow-sm">
            <Table
              columns={yardColumns}
              dataSource={mockYardBlocks}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="泊位计划" className="border-0 shadow-sm">
            <div className="space-y-3">
              {mockBerthPlans.map((plan: any) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <IconMap name="Ship" size={20} className="text-[#3E92CC]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{plan.vesselName}</p>
                      <p className="text-xs text-gray-500">
                        {plan.berthNo} 泊位 · {plan.operationType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Tag color={getStatusColor(plan.status)}>{getStatusText(plan.status)}</Tag>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDateTime(plan.berthTime)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OperationDashboard;

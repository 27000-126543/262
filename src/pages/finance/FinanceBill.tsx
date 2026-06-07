
import React, { useState } from 'react';
import { Table, Tag, Button, Space, Card, Row, Col, Statistic, Progress, Modal, List, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ReactECharts from 'echarts-for-react';
import { mockBills } from '@/services/mockData';
import { Bill } from '@/types';
import { formatCurrency, formatDate, formatDateTime, getStatusColor, getStatusText } from '@/utils/format';
import { IconMap } from '@/components/IconMap';

const FinanceBillPage: React.FC = () => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const columns: ColumnsType<Bill> = [
    {
      title: '账单编号',
      dataIndex: 'billNo',
      key: 'billNo',
      width: 160,
      render: (text) => <span className="font-mono font-medium text-[#0A2463]">{text}</span>,
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 200,
    },
    {
      title: '账期',
      dataIndex: 'period',
      key: 'period',
      width: 120,
    },
    {
      title: '费用明细',
      key: 'items',
      width: 180,
      render: (_, record) => (
        <div className="text-sm">
          <div>共 {record.items.length} 项费用</div>
          <div className="text-gray-500">点击查看详情</div>
        </div>
      ),
    },
    {
      title: '账单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      render: (amount) => <span className="font-bold text-gray-800">{formatCurrency(amount)}</span>,
    },
    {
      title: '已付金额',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 140,
      render: (amount) => <span className="text-emerald-600">{formatCurrency(amount)}</span>,
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 130,
      render: (date) => formatDate(date),
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
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<IconMap name="Eye" size={14} />}
            onClick={() => {
              setSelectedBill(record);
              setDetailModalOpen(true);
            }}
          >
            详情
          </Button>
          {record.status !== 'paid' && (
            <Button type="primary" size="small" icon={<IconMap name="CreditCard" size={14} />}>
              立即支付
            </Button>
          )}
          {record.status === 'paid' && (
            <Button type="link" size="small" icon={<IconMap name="Receipt" size={14} />}>
              开票
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const feeBreakdownOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
        data: [
          { value: 35, name: '装卸费', itemStyle: { color: '#3E92CC' } },
          { value: 25, name: '堆存费', itemStyle: { color: '#2EC4B6' } },
          { value: 20, name: '港务费', itemStyle: { color: '#FF6B35' } },
          { value: 15, name: '报关费', itemStyle: { color: '#8B5CF6' } },
          { value: 5, name: '其他', itemStyle: { color: '#F59E0B' } },
        ],
      },
    ],
  };

  const totalUnpaid = mockBills.filter((b) => b.status === 'unpaid' || b.status === 'overdue').reduce((sum, b) => sum + b.totalAmount - b.paidAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">费用账单</h1>
          <p className="mt-1 text-gray-500">查看和管理您的费用账单</p>
        </div>
        <Space>
          <Button icon={<IconMap name="Download" size={16} />}>导出对账单</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm">
            <Statistic
              title="本月账单金额"
              value={mockBills.reduce((sum, b) => sum + b.totalAmount, 0)}
              prefix={<IconMap name="DollarSign" size={20} className="text-[#0A2463]" />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#0A2463' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm">
            <Statistic
              title="待支付金额"
              value={totalUnpaid}
              prefix={<IconMap name="AlertTriangle" size={20} className="text-[#FF6B35]" />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#FF6B35' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm">
            <Statistic
              title="已支付金额"
              value={mockBills.filter((b) => b.status === 'paid').reduce((sum, b) => sum + b.paidAmount, 0)}
              prefix={<IconMap name="CheckCircle" size={20} className="text-[#2EC4B6]" />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#2EC4B6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">支付进度</span>
              <span className="text-sm font-medium text-gray-800">75.4%</span>
            </div>
            <Progress percent={75.4} strokeColor={{ from: '#3E92CC', to: '#0A2463' }} showInfo={false} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="账单列表" className="border-0 shadow-sm">
            <Table
              columns={columns}
              dataSource={mockBills}
              rowKey="id"
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: 1300 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="费用构成" className="border-0 shadow-sm">
            <ReactECharts option={feeBreakdownOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Modal
        title={`账单详情 - ${selectedBill?.billNo || ''}`}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setDetailModalOpen(false)}>关闭</Button>
            {selectedBill?.status !== 'paid' && (
              <Button
                type="primary"
                onClick={() => {
                  message.success('支付功能演示');
                  setDetailModalOpen(false);
                }}
              >
                立即支付
              </Button>
            )}
          </Space>
        }
        width={700}
      >
        {selectedBill && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-sm text-gray-500">客户名称</p>
              <p className="font-medium text-gray-800">{selectedBill.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">账期</p>
              <p className="font-medium text-gray-800">{selectedBill.period}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">账单状态</p>
              <Tag color={getStatusColor(selectedBill.status)}>{getStatusText(selectedBill.status)}</Tag>
            </div>
            <div>
              <p className="text-sm text-gray-500">截止日期</p>
              <p className="font-medium text-gray-800">{formatDate(selectedBill.dueDate)}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-medium text-gray-800">费用明细</h3>
            <List
              bordered
              dataSource={selectedBill.items}
              renderItem={(item) => (
                <List.Item className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{item.itemName}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                      {item.relatedContainer && <span className="ml-2">箱号: {item.relatedContainer}</span>}
                    </p>
                  </div>
                  <span className="font-bold text-gray-800">{formatCurrency(item.amount)}</span>
                </List.Item>
              )}
            />
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-gray-600">账单总金额</span>
              <span className="text-xl font-bold text-[#0A2463]">{formatCurrency(selectedBill.totalAmount)}</span>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-gray-600">已支付金额</span>
              <span className="text-emerald-600">{formatCurrency(selectedBill.paidAmount)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">待支付金额</span>
                <span className="text-lg font-bold text-[#FF6B35]">
                  {formatCurrency(selectedBill.totalAmount - selectedBill.paidAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
        )}
      </Modal>
    </div>
  );
};

export default FinanceBillPage;

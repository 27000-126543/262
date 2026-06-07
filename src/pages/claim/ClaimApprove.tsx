import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Select,
  Input,
  message,
  Space,
  Descriptions,
  Timeline,
  Image,
  Divider,
  InputNumber,
  Alert,
  Steps,
  Badge,
  Avatar,
} from 'antd';
import dayjs from 'dayjs';
import { mockClaims } from '@/services/mockData';
import { formatDateTime, formatCurrency, getStatusColor, getStatusText } from '@/utils/format';
import { IconMap } from '@/components/IconMap';
import type { Claim, ApprovalRecord } from '@/types';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const ClaimApprove: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>(mockClaims);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [approveForm] = Form.useForm();
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'transfer'>('approve');

  const columns = [
    {
      title: '理赔单号',
      dataIndex: 'claimNo',
      key: 'claimNo',
      render: (text: string) => <span className="font-mono text-sm">{text}</span>,
    },
    {
      title: '申请人',
      dataIndex: 'applicantName',
      key: 'applicantName',
      render: (name: string, record: Claim) => (
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-gray-500">
            {record.applicantType === 'owner'
              ? '货主'
              : record.applicantType === 'shipping'
              ? '船公司'
              : '司机'}
          </p>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'claimType',
      key: 'claimType',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          damage: '货损',
          loss: '货差',
          delay: '延误',
          other: '其他',
        };
        const colorMap: Record<string, string> = {
          damage: 'red',
          loss: 'orange',
          delay: 'blue',
          other: 'default',
        };
        return <Tag color={colorMap[type]}>{typeMap[type]}</Tag>;
      },
    },
    {
      title: '索赔金额',
      dataIndex: 'claimAmount',
      key: 'claimAmount',
      render: (amount: number) => <span className="font-bold text-[#0A2463]">{formatCurrency(amount)}</span>,
    },
    {
      title: '当前审批节点',
      dataIndex: 'currentApprover',
      key: 'currentApprover',
      render: (role?: string) => {
        if (!role) return '-';
        const roleMap: Record<string, string> = {
          operation: '运营审核',
          legal: '法务审核',
          finance: '财务赔付',
        };
        return <Tag color="processing">{roleMap[role] || role}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text: string) => formatDateTime(text),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Claim) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {(record.status === 'pending' || record.status === 'reviewing') && (
            <Button type="primary" size="small" onClick={() => handleApprove(record)}>
              审批
            </Button>
          )}
          {record.status === 'approved' && (
            <Button type="primary" size="small" onClick={() => handlePay(record)}>
              赔付
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleViewDetail = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
    setActionType('approve');
    approveForm.resetFields();
  };

  const handleApprove = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
    setActionType('approve');
    approveForm.resetFields();
  };

  const handlePay = (claim: Claim) => {
    Modal.confirm({
      title: '确认赔付',
      content: `确认向 ${claim.applicantName} 赔付 ${formatCurrency(claim.paidAmount || claim.claimAmount)} 吗？`,
      okText: '确认赔付',
      cancelText: '取消',
      onOk: () => {
        setClaims(
          claims.map((c) =>
            c.id === claim.id
              ? {
                  ...c,
                  status: 'paid' as const,
                  paidAmount: claim.paidAmount || claim.claimAmount,
                  paidTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                  approvalHistory: [
                    ...c.approvalHistory,
                    {
                      id: `ah${Date.now()}`,
                      approverId: '7',
                      approverName: '赵财务',
                      approverRole: 'finance',
                      action: 'approve' as const,
                      comments: '已完成赔付',
                      approveTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    },
                  ],
                }
              : c
          )
        );
        message.success('赔付已完成，款项将在1-3个工作日内到账');
      },
    });
  };

  const handleSubmitApproval = () => {
    approveForm.validateFields().then((values) => {
      if (!selectedClaim) return;

      const newApproval: ApprovalRecord = {
        id: `ah${Date.now()}`,
        approverId: '5',
        approverName: '李运营',
        approverRole: 'operation',
        action: actionType,
        comments: values.comments || '',
        approveTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      let newStatus = selectedClaim.status;
      let newApprover = selectedClaim.currentApprover;
      let paidAmount = selectedClaim.paidAmount;

      if (actionType === 'approve') {
        if (selectedClaim.currentApprover === 'operation') {
          newStatus = 'reviewing';
          newApprover = 'legal';
        } else if (selectedClaim.currentApprover === 'legal') {
          newStatus = 'approved';
          newApprover = 'finance';
          paidAmount = values.payAmount || selectedClaim.claimAmount;
        }
      } else if (actionType === 'reject') {
        newStatus = 'rejected';
        newApprover = undefined;
      }

      setClaims(
        claims.map((c) =>
          c.id === selectedClaim.id
            ? {
                ...c,
                status: newStatus as any,
                currentApprover: newApprover,
                paidAmount,
                approvalHistory: [...c.approvalHistory, newApproval],
              }
            : c
        )
      );

      setIsModalOpen(false);
      message.success(`审批${actionType === 'approve' ? '通过' : actionType === 'reject' ? '拒绝' : '转交'}成功`);
    });
  };

  const getStepStatus = (status: string) => {
    if (status === 'rejected') return 'error';
    return 'process';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">理赔审批</h1>
          <p className="mt-1 text-gray-500">审核理赔工单，流转审批，处理赔付</p>
        </div>
        <Space>
          <Select defaultValue="all" className="!w-32">
            <Option value="all">全部状态</Option>
            <Option value="pending">待运营审核</Option>
            <Option value="reviewing">待法务审核</Option>
            <Option value="approved">待赔付</Option>
            <Option value="paid">已完成</Option>
          </Select>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card className="border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待审核</p>
                <p className="mt-1 text-2xl font-bold text-amber-500">
                  {claims.filter((c) => c.status === 'pending' || c.status === 'reviewing').length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <IconMap name="Clock" size={24} className="text-amber-500" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待赔付</p>
                <p className="mt-1 text-2xl font-bold text-blue-500">
                  {claims.filter((c) => c.status === 'approved').length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <IconMap name="DollarSign" size={24} className="text-blue-500" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">本月已赔付</p>
                <p className="mt-1 text-2xl font-bold text-emerald-500">
                  {claims.filter((c) => c.status === 'paid').length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <IconMap name="CheckCircle" size={24} className="text-emerald-500" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">赔付总金额</p>
                <p className="mt-1 text-2xl font-bold text-[#0A2463]">
                  {formatCurrency(
                    claims.filter((c) => c.status === 'paid').reduce((sum, c) => sum + (c.paidAmount || 0), 0)
                  )}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                <IconMap name="TrendingUp" size={24} className="text-indigo-500" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="理赔工单列表" className="border-0 shadow-sm">
        <Table columns={columns} dataSource={claims} rowKey="id" pagination={{ pageSize: 8 }} />
      </Card>

      <Modal
        title="理赔工单审批"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmitApproval}
        width={800}
        okText="提交审批"
        cancelText="取消"
      >
        {selectedClaim && (
          <div className="space-y-4">
            <Steps current={selectedClaim.status === 'paid' ? 4 : selectedClaim.status === 'approved' ? 3 : selectedClaim.status === 'reviewing' ? 2 : selectedClaim.status === 'pending' ? 1 : 0} size="small" status={getStepStatus(selectedClaim.status)}>
              <Step title="提交申请" icon={<IconMap name="FileText" size={14} />} />
              <Step title="运营审核" icon={<IconMap name="Users" size={14} />} />
              <Step title="法务审核" icon={<IconMap name="Scale" size={14} />} />
              <Step title="财务赔付" icon={<IconMap name="DollarSign" size={14} />} />
              <Step title="完成" icon={<IconMap name="Check" size={14} />} />
            </Steps>

            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="理赔单号">
                <span className="font-mono">{selectedClaim.claimNo}</span>
              </Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedClaim.applicantName}</Descriptions.Item>
              <Descriptions.Item label="类型">
                {selectedClaim.claimType === 'damage'
                  ? '货损'
                  : selectedClaim.claimType === 'loss'
                  ? '货差'
                  : selectedClaim.claimType === 'delay'
                  ? '延误'
                  : '其他'}
              </Descriptions.Item>
              <Descriptions.Item label="索赔金额">{formatCurrency(selectedClaim.claimAmount)}</Descriptions.Item>
              <Descriptions.Item label="箱号">{selectedClaim.containerNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="运单号">{selectedClaim.orderNo || '-'}</Descriptions.Item>
            </Descriptions>

            <Card size="small" title="问题描述" className="border-0 bg-gray-50">
              <p className="text-gray-700">{selectedClaim.description}</p>
            </Card>

            {selectedClaim.evidenceUrls.length > 0 && (
              <Card size="small" title="证据材料" className="border-0">
                <Row gutter={[8, 8]}>
                  {selectedClaim.evidenceUrls.map((_, index) => (
                    <Col xs={6} key={index}>
                      <Image
                        width="100%"
                        height={80}
                        src={`https://picsum.photos/200/150?random=${index + 10}`}
                        style={{ borderRadius: 4, objectFit: 'cover' }}
                      />
                    </Col>
                  ))}
                </Row>
              </Card>
            )}

            {selectedClaim.approvalHistory.length > 0 && (
              <Card size="small" title="审批历史" className="border-0">
                <Timeline size="small">
                  {selectedClaim.approvalHistory.map((h) => (
                    <Timeline.Item key={h.id} color={h.action === 'approve' ? 'green' : h.action === 'reject' ? 'red' : 'blue'}>
                      <p className="font-medium">
                        {h.approverName}（{h.approverRole === 'operation' ? '运营' : h.approverRole === 'legal' ? '法务' : '财务'}）
                        {h.action === 'approve' ? ' 通过' : h.action === 'reject' ? ' 拒绝' : ' 转交'}
                      </p>
                      <p className="text-sm text-gray-600">{h.comments}</p>
                      <p className="text-xs text-gray-400">{formatDateTime(h.approveTime)}</p>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}

            {(selectedClaim.status === 'pending' || selectedClaim.status === 'reviewing') && (
              <>
                <Divider />
                <Form form={approveForm} layout="vertical">
                  <Form.Item label="审批操作">
                    <Space>
                      <Button
                        type={actionType === 'approve' ? 'primary' : 'default'}
                        icon={<IconMap name="Check" size={14} />}
                        onClick={() => setActionType('approve')}
                      >
                        通过
                      </Button>
                      <Button
                        danger
                        type={actionType === 'reject' ? 'primary' : 'default'}
                        icon={<IconMap name="X" size={14} />}
                        onClick={() => setActionType('reject')}
                      >
                        拒绝
                      </Button>
                    </Space>
                  </Form.Item>

                  {selectedClaim.currentApprover === 'legal' && actionType === 'approve' && (
                    <Form.Item label="建议赔付金额" name="payAmount">
                      <InputNumber
                        min={0}
                        max={selectedClaim.claimAmount}
                        defaultValue={selectedClaim.claimAmount}
                        style={{ width: '100%' }}
                        placeholder="输入建议赔付金额"
                      />
                    </Form.Item>
                  )}

                  <Form.Item label="审批意见" name="comments">
                    <TextArea rows={3} placeholder="请输入审批意见" />
                  </Form.Item>
                </Form>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClaimApprove;

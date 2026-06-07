import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Select,
  Upload,
  Table,
  Tag,
  Modal,
  message,
  Space,
  Descriptions,
  Timeline,
  Image,
  Divider,
  InputNumber,
} from 'antd';
import dayjs from 'dayjs';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { mockClaims, mockContainers, mockOrders } from '@/services/mockData';
import { formatDateTime, formatCurrency, getStatusColor, getStatusText } from '@/utils/format';
import { IconMap } from '@/components/IconMap';
import type { Claim } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

const ClaimApply: React.FC = () => {
  const [form] = Form.useForm();
  const [claims, setClaims] = useState<Claim[]>(mockClaims.filter((c) => c.applicantId === '3'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);

  const columns = [
    {
      title: '理赔单号',
      dataIndex: 'claimNo',
      key: 'claimNo',
      render: (text: string) => <span className="font-mono text-sm">{text}</span>,
    },
    { title: '箱号', dataIndex: 'containerNo', key: 'containerNo', render: (t?: string) => t || '-' },
    { title: '运单号', dataIndex: 'orderNo', key: 'orderNo', render: (t?: string) => t || '-' },
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
      render: (amount: number) => <span className="font-medium">{formatCurrency(amount)}</span>,
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
        <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
          查看详情
        </Button>
      ),
    },
  ];

  const handleNewClaim = () => {
    setIsModalOpen(true);
    setFileList([]);
    form.resetFields();
  };

  const handleViewDetail = (claim: Claim) => {
    setSelectedClaim(claim);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const newClaim: Claim = {
        id: `cl${Date.now()}`,
        claimNo: `CLM${dayjs().format('YYYYMMDDHHmmss')}`,
        applicantId: '3',
        applicantName: '阿里巴巴国际贸易',
        applicantType: 'owner',
        containerNo: values.containerNo,
        orderNo: values.orderNo,
        claimType: values.claimType,
        description: values.description,
        evidenceUrls: fileList.map((f) => f.url || '#'),
        claimAmount: values.claimAmount,
        status: 'pending',
        currentApprover: 'operation',
        approvalHistory: [],
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      setClaims([newClaim, ...claims]);
      setIsModalOpen(false);
      message.success('理赔申请已提交，我们将尽快处理');
    });
  };

  const uploadProps = {
    fileList,
    onChange: ({ fileList: newFileList }: any) => {
      setFileList(
        newFileList.map((f: any, index: number) => ({
          ...f,
          url: f.url || `https://picsum.photos/200/150?random=${Date.now() + index}`,
          thumbUrl: f.thumbUrl || `https://picsum.photos/200/150?random=${Date.now() + index}`,
        }))
      );
    },
    beforeUpload: () => false,
    listType: 'picture-card' as const,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">理赔申请</h1>
          <p className="mt-1 text-gray-500">提交货损货差理赔申请，上传证据并跟踪处理进度</p>
        </div>
        <Button type="primary" icon={<IconMap name="FilePlus" size={16} />} onClick={handleNewClaim}>
          新建理赔
        </Button>
      </div>

      <Card title="我的理赔记录" className="border-0 shadow-sm">
        <Table columns={columns} dataSource={claims} rowKey="id" pagination={{ pageSize: 6 }} />
      </Card>

      <Modal
        title="新建理赔申请"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        width={700}
        okText="提交申请"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item label="理赔类型" name="claimType" rules={[{ required: true, message: '请选择理赔类型' }]}>
                <Select placeholder="请选择">
                  <Option value="damage">货损 - 货物损坏</Option>
                  <Option value="loss">货差 - 货物缺失</Option>
                  <Option value="delay">延误 - 作业延误</Option>
                  <Option value="other">其他 - 其他问题</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="索赔金额 (元)" name="claimAmount" rules={[{ required: true, message: '请输入索赔金额' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入索赔金额" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="集装箱号" name="containerNo">
                <Select placeholder="请选择或输入" showSearch allowClear>
                  {mockContainers.map((c) => (
                    <Option key={c.containerNo} value={c.containerNo}>
                      {c.containerNo}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="运单号" name="orderNo">
                <Select placeholder="请选择或输入" showSearch allowClear>
                  {mockOrders.map((o) => (
                    <Option key={o.orderNo} value={o.orderNo}>
                      {o.orderNo}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="问题描述" name="description" rules={[{ required: true, message: '请描述问题' }]}>
            <TextArea rows={4} placeholder="请详细描述货损货差情况，包括发现时间、地点、损失情况等" />
          </Form.Item>

          <Form.Item label="上传证据" name="evidence">
            <Upload {...uploadProps}>
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            </Upload>
            <p className="mt-1 text-xs text-gray-500">支持上传货物破损照片、装箱单、提单等证据材料</p>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="理赔详情"
        open={!!selectedClaim}
        onCancel={() => setSelectedClaim(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedClaim(null)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedClaim && (
          <div className="space-y-4">
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="理赔单号">
                <span className="font-mono">{selectedClaim.claimNo}</span>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedClaim.status)}>{getStatusText(selectedClaim.status)}</Tag>
              </Descriptions.Item>
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
              <Descriptions.Item label="实际赔付">
                {selectedClaim.paidAmount ? formatCurrency(selectedClaim.paidAmount) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="申请时间">{formatDateTime(selectedClaim.createTime)}</Descriptions.Item>
            </Descriptions>

            <Card size="small" title="问题描述" className="border-0 bg-gray-50">
              <p className="text-gray-700">{selectedClaim.description}</p>
            </Card>

            {selectedClaim.evidenceUrls.length > 0 && (
              <Card size="small" title="证据材料" className="border-0">
                <Row gutter={[8, 8]}>
                  {selectedClaim.evidenceUrls.map((url, index) => (
                    <Col xs={8} key={index}>
                      <Image
                        width="100%"
                        height={100}
                        src={`https://picsum.photos/200/150?random=${index}`}
                        style={{ borderRadius: 4, objectFit: 'cover' }}
                      />
                    </Col>
                  ))}
                </Row>
              </Card>
            )}

            <Divider orientation="left">审批进度</Divider>
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <p className="font-medium">提交申请</p>
                      <p className="text-xs text-gray-500">{formatDateTime(selectedClaim.createTime)}</p>
                    </div>
                  ),
                },
                ...selectedClaim.approvalHistory.map((h) => ({
                  color: h.action === 'approve' ? 'green' : h.action === 'reject' ? 'red' : 'blue',
                  children: (
                    <div>
                      <p className="font-medium">
                        {h.approverName} ({h.approverRole === 'operation' ? '运营' : h.approverRole === 'legal' ? '法务' : '财务'})
                        {h.action === 'approve' ? ' 审批通过' : h.action === 'reject' ? ' 审批拒绝' : ' 转交'}
                      </p>
                      <p className="text-sm text-gray-600">{h.comments}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(h.approveTime)}</p>
                    </div>
                  ),
                })),
                selectedClaim.status === 'pending'
                  ? {
                      color: 'blue',
                      children: (
                        <div>
                          <p className="font-medium">等待运营审核</p>
                          <p className="text-xs text-gray-500">处理中...</p>
                        </div>
                      ),
                    }
                  : selectedClaim.status === 'reviewing'
                  ? {
                      color: 'blue',
                      children: (
                        <div>
                          <p className="font-medium">等待法务审核</p>
                          <p className="text-xs text-gray-500">处理中...</p>
                        </div>
                      ),
                    }
                  : selectedClaim.status === 'approved'
                  ? {
                      color: 'blue',
                      children: (
                        <div>
                          <p className="font-medium">等待财务赔付</p>
                          <p className="text-xs text-gray-500">处理中...</p>
                        </div>
                      ),
                    }
                  : selectedClaim.status === 'paid'
                  ? {
                      color: 'green',
                      children: (
                        <div>
                          <p className="font-medium">赔付完成</p>
                          <p className="text-xs text-gray-500">{selectedClaim.paidTime ? formatDateTime(selectedClaim.paidTime) : ''}</p>
                        </div>
                      ),
                    }
                  : {
                      color: 'red',
                      children: (
                        <div>
                          <p className="font-medium">申请被拒绝</p>
                        </div>
                      ),
                    },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClaimApply;

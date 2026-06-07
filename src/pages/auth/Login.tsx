
import React, { useState } from 'react';
import { Form, Input, Button, Tabs, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authenticate } from '@/services/mockData';
import { useUserStore } from '@/store/useUserStore';
import { IconMap } from '@/components/IconMap';
import { UserRole } from '@/types';
import { ROLE_NAMES } from '@/constants';

const { Item } = Form;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>('admin');

  const roleOptions: { key: UserRole; label: string }[] = [
    { key: 'admin', label: ROLE_NAMES.admin },
    { key: 'shipping', label: ROLE_NAMES.shipping },
    { key: 'owner', label: ROLE_NAMES.owner },
    { key: 'driver', label: ROLE_NAMES.driver },
    { key: 'operation', label: ROLE_NAMES.operation },
    { key: 'finance', label: ROLE_NAMES.finance },
    { key: 'legal', label: ROLE_NAMES.legal },
  ];

  const handleSubmit = (values: { username: string; password: string }) => {
    setLoading(true);
    setTimeout(() => {
      const user = authenticate(values.username, values.password);
      if (user) {
        setUser(user);
        message.success('登录成功');
        navigate('/');
      } else {
        message.error('用户名或密码错误');
      }
      setLoading(false);
    }, 500);
  };

  const getDefaultUsername = (role: UserRole): string => {
    const usernameMap: Record<UserRole, string> = {
      admin: 'admin',
      shipping: 'shipping01',
      owner: 'owner01',
      driver: 'driver01',
      operation: 'operation01',
      finance: 'finance01',
      legal: 'legal01',
      yard: 'driver01',
    };
    return usernameMap[role] || 'admin';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0A2463] via-[#1E3A8A] to-[#3E92CC]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[#3E92CC]/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#FF6B35]/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-2xl bg-white/95 shadow-2xl backdrop-blur-xl">
        <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-[#0A2463] to-[#1E3A8A] p-12 md:flex">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <IconMap name="Ship" size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">智慧港口管理系统</h1>
            </div>
            <p className="mb-6 text-lg text-white/80">
              集成船舶调度、集装箱管理、智能运营的一站式智慧港口解决方案
            </p>
            <div className="space-y-4">
              {[
                { icon: 'CheckCircle', text: '智能泊位调度，提升港口效率' },
                { icon: 'CheckCircle', text: '实时箱态跟踪，全程可视化' },
                { icon: 'CheckCircle', text: '智能费用核算，自动生成账单' },
                { icon: 'CheckCircle', text: '大数据分析，辅助决策支持' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-white/90">
                  <IconMap name={item.icon} size={20} className="text-[#2EC4B6]" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-white/60">© 2024 智慧港口运营有限公司 版权所有</p>
        </div>

        <div className="w-full p-8 md:w-1/2 md:p-12">
          <div className="mb-8">
            <h2 className="mb-2 text-2xl font-bold text-gray-800">欢迎登录</h2>
            <p className="text-gray-500">请选择角色并输入账号密码</p>
          </div>

          <Tabs
            activeKey={activeRole}
            onChange={(key) => setActiveRole(key as UserRole)}
            items={roleOptions.map((role) => ({
              key: role.key,
              label: <span className="text-sm">{role.label}</span>,
            }))}
            className="mb-6"
          />

          <Form
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              username: getDefaultUsername(activeRole),
              password: '123456',
            }}
          >
            <Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                size="large"
                prefix={<IconMap name="User" size={18} className="text-gray-400" />}
                placeholder="请输入用户名"
                className="!rounded-lg"
              />
            </Item>

            <Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                size="large"
                prefix={<IconMap name="Lock" size={18} className="text-gray-400" />}
                placeholder="请输入密码"
                className="!rounded-lg"
              />
            </Item>

            <div className="mb-6 flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-gray-600">
                <input type="checkbox" className="rounded" defaultChecked />
                记住登录
              </label>
              <a href="#" className="text-[#3E92CC] hover:underline">
                忘记密码？
              </a>
            </div>

            <Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="!h-12 !rounded-lg !bg-gradient-to-r !from-[#0A2463] !to-[#3E92CC] !text-base font-medium !shadow-lg hover:!shadow-xl"
              >
                登 录
              </Button>
            </Item>
          </Form>

          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <p className="mb-1 text-sm font-medium text-[#0A2463]">
              <IconMap name="Info" size={14} className="mr-1 inline" />
              演示账号说明
            </p>
            <p className="text-xs text-gray-600">
              所有账号密码均为：<code className="rounded bg-gray-200 px-1">123456</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


import React, { useMemo, useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Badge, Input, Breadcrumb } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { useUserStore } from '@/store/useUserStore';
import { MENU_ITEMS, ROLE_NAMES } from '@/constants';
import { IconMap } from '@/components/IconMap';
import { MenuItem, UserRole } from '@/types';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Search } = Input;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, toggleCollapsed } = useAppStore();
  const { user, clearUser } = useUserStore();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([location.pathname]);

  const filterMenuByRole = (items: MenuItem[], role: UserRole): MenuItem[] => {
    return items
      .filter((item) => {
        if (item.roles && item.roles.length > 0) {
          return item.roles.includes(role);
        }
        return true;
      })
      .map((item) => ({
        ...item,
        children: item.children ? filterMenuByRole(item.children, role) : undefined,
      }))
      .filter((item) => !item.children || item.children.length > 0);
  };

  const menuItems = useMemo(() => {
    if (!user) return [];
    const filtered = filterMenuByRole(MENU_ITEMS, user.role);

    const convertToAntMenuItem = (items: MenuItem[]): MenuProps['items'] => {
      return items.map((item) => ({
        key: item.path || item.key,
        icon: item.icon ? <IconMap name={item.icon} size={18} /> : undefined,
        label: item.label,
        children: item.children ? convertToAntMenuItem(item.children) : undefined,
      }));
    };

    return convertToAntMenuItem(filtered);
  }, [user]);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    setSelectedKeys([key]);
    navigate(key);
  };

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: '个人中心',
      icon: <IconMap name="User" size={16} />,
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <IconMap name="LogOut" size={16} />,
      onClick: handleLogout,
    },
  ];

  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items: { title: string }[] = [{ title: '首页' }];

    const findLabelByPath = (items: MenuItem[], path: string): string | null => {
      for (const item of items) {
        if (item.path === path) return item.label;
        if (item.children) {
          const found = findLabelByPath(item.children, path);
          if (found) return found;
        }
      }
      return null;
    };

    let currentPath = '';
    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += '/' + pathSegments[i];
      const label = findLabelByPath(MENU_ITEMS, currentPath);
      if (label) {
        items.push({ title: label });
      }
    }

    return items;
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        className="!bg-gradient-to-b !from-[#0A2463] !to-[#051A3D]"
        width={240}
      >
        <div className="flex h-16 items-center justify-center border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3E92CC]">
              <IconMap name="Ship" size={20} className="text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-white">智慧港口管理</span>
            )}
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
          className="!border-r-0 bg-transparent pt-4"
          style={{ background: 'transparent' }}
        />
      </Sider>
      <Layout>
        <Header className="flex items-center justify-between !bg-white !px-6 !py-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleCollapsed}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100"
            >
              <IconMap name={collapsed ? 'Menu' : 'ChevronLeft'} size={20} />
            </button>
            <Breadcrumb items={getBreadcrumbItems()} className="!text-sm" />
          </div>
          <div className="flex items-center gap-4">
            <Search
              placeholder="搜索..."
              size="middle"
              className="!w-64"
              prefix={<IconMap name="Search" size={16} className="text-gray-400" />}
            />
            <Badge count={3} size="small">
              <button className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100">
                <IconMap name="Bell" size={20} />
              </button>
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-gray-100">
                <Avatar
                  size={32}
                  className="!bg-[#3E92CC]"
                  icon={<IconMap name="User" size={18} />}
                />
                <div className="hidden text-left md:block">
                  <div className="text-sm font-medium text-gray-800">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user && ROLE_NAMES[user.role]}</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="m-6 overflow-auto">
          <div className="min-h-full rounded-xl bg-white p-6 shadow-sm">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

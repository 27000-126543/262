
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import MainLayout from '@/components/layout/MainLayout';
import Login from '@/pages/auth/Login';
import Dashboard from '@/pages/dashboard/Dashboard';
import VesselForecast from '@/pages/vessel/VesselForecast';
import BerthPlan from '@/pages/vessel/BerthPlan';
import FinanceBill from '@/pages/finance/FinanceBill';
import OperationDashboard from '@/pages/dashboard/OperationDashboard';
import MemberCenter from '@/pages/member/MemberCenter';
import ContainerGateIn from '@/pages/container/GateIn';
import DriverAppointment from '@/pages/driver/Appointment';
import ClaimApply from '@/pages/claim/ClaimApply';
import ClaimApprove from '@/pages/claim/ClaimApprove';

const GenericPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <p className="mt-1 text-gray-500">该模块正在开发中，敬请期待...</p>
    </div>
    <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <span className="text-3xl">🚧</span>
        </div>
        <p className="text-gray-500">{title} 功能开发中</p>
      </div>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, initUser } = useUserStore();

  useEffect(() => {
    initUser();
  }, [initUser]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        <Route path="/vessel/list" element={<ProtectedRoute><GenericPage title="船舶列表" /></ProtectedRoute>} />
        <Route path="/vessel/forecast" element={<ProtectedRoute><VesselForecast /></ProtectedRoute>} />
        <Route path="/vessel/berth" element={<ProtectedRoute><BerthPlan /></ProtectedRoute>} />
        
        <Route path="/container/gate-in" element={<ProtectedRoute><ContainerGateIn /></ProtectedRoute>} />
        <Route path="/container/yard" element={<ProtectedRoute><GenericPage title="堆场管理" /></ProtectedRoute>} />
        <Route path="/container/tracking" element={<ProtectedRoute><GenericPage title="货物跟踪" /></ProtectedRoute>} />
        
        <Route path="/customs/declaration" element={<ProtectedRoute><GenericPage title="报关管理" /></ProtectedRoute>} />
        
        <Route path="/driver/appointment" element={<ProtectedRoute><DriverAppointment /></ProtectedRoute>} />
        
        <Route path="/finance/bill" element={<ProtectedRoute><FinanceBill /></ProtectedRoute>} />
        <Route path="/finance/invoice" element={<ProtectedRoute><GenericPage title="发票管理" /></ProtectedRoute>} />
        
        <Route path="/claim/apply" element={<ProtectedRoute><ClaimApply /></ProtectedRoute>} />
        <Route path="/claim/approve" element={<ProtectedRoute><ClaimApprove /></ProtectedRoute>} />
        
        <Route path="/member/center" element={<ProtectedRoute><MemberCenter /></ProtectedRoute>} />
        
        <Route path="/dashboard/operation" element={<ProtectedRoute><OperationDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/prediction" element={<ProtectedRoute><GenericPage title="预测分析" /></ProtectedRoute>} />
        
        <Route path="/report/center" element={<ProtectedRoute><GenericPage title="报表中心" /></ProtectedRoute>} />
        
        <Route path="/system/user" element={<ProtectedRoute><GenericPage title="用户管理" /></ProtectedRoute>} />
        <Route path="/system/config" element={<ProtectedRoute><GenericPage title="基础数据" /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

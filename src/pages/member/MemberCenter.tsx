
import React from 'react';
import { Card, Row, Col, Progress, Tag, List, Button, Divider, Statistic } from 'antd';
import { useUserStore } from '@/store/useUserStore';
import { MEMBER_LEVEL_CONFIG } from '@/constants';
import { formatTEU, formatPercent } from '@/utils/format';
import { IconMap } from '@/components/IconMap';

const MemberCenter: React.FC = () => {
  const { user } = useUserStore();

  const currentLevel = user?.memberLevel || 'normal';
  const annualThroughput = user?.annualThroughput || 0;
  const levelConfig = MEMBER_LEVEL_CONFIG.find((l) => l.level === currentLevel);
  const nextLevel = MEMBER_LEVEL_CONFIG.find((l) => l.minThroughput > (levelConfig?.minThroughput || 0));
  const progressToNext = nextLevel
    ? Math.min(((annualThroughput - (levelConfig?.minThroughput || 0)) / (nextLevel.minThroughput - (levelConfig?.minThroughput || 0))) * 100, 100)
    : 100;

  const levelColors: Record<string, string> = {
    normal: 'from-gray-400 to-gray-500',
    silver: 'from-slate-300 to-slate-500',
    gold: 'from-amber-400 to-amber-600',
  };

  const levelBgColors: Record<string, string> = {
    normal: 'bg-gray-100 text-gray-600',
    silver: 'bg-slate-100 text-slate-600',
    gold: 'bg-amber-100 text-amber-600',
  };

  const benefitIcons: Record<string, string> = {
    priority: 'Zap',
    discount: 'DollarSign',
    extended: 'Calendar',
    service: 'Users',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">会员中心</h1>
        <p className="mt-1 text-gray-500">查看您的会员等级和专属权益</p>
      </div>

      <Card className={`overflow-hidden border-0 shadow-sm bg-gradient-to-r ${levelColors[currentLevel]}`}>
        <div className="relative">
          <div className="absolute right-0 top-0 opacity-10">
            <IconMap name="Crown" size={120} className="text-white" />
          </div>
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 p-4 text-white md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                <IconMap name="Crown" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-white/80">{user?.company}</p>
              </div>
            </div>
            <div className="text-right">
              <Tag className={`!rounded-full !px-4 !py-1 ${levelBgColors[currentLevel]}`}>
                <IconMap name="Star" size={14} className="mr-1 inline" />
                {levelConfig?.name}
              </Tag>
              <p className="mt-2 text-sm text-white/80">
                年吞吐量: {formatTEU(annualThroughput)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="会员等级进度" className="border-0 shadow-sm" extra={<Button type="link">等级规则</Button>}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">
                    当前等级: <span className="text-[#0A2463]">{levelConfig?.name}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {nextLevel
                      ? `距离 ${nextLevel.name} 还需 ${formatTEU(Math.max(0, nextLevel.minThroughput - annualThroughput))}`
                      : '已达最高等级'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#0A2463]">{formatTEU(annualThroughput)}</p>
                  <p className="text-xs text-gray-500">本年度已完成</p>
                </div>
              </div>

              {nextLevel && (
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{levelConfig?.name}</span>
                    <span className="text-[#0A2463]">{formatPercent(progressToNext / 100)}</span>
                    <span>{nextLevel.name}</span>
                  </div>
                  <Progress
                    percent={progressToNext}
                    strokeColor={{ from: '#3E92CC', to: '#0A2463' }}
                    showInfo={false}
                    size="large"
                  />
                  <div className="mt-2 flex justify-between text-xs text-gray-400">
                    <span>{formatTEU(levelConfig?.minThroughput || 0)}</span>
                    <span>{formatTEU(nextLevel.minThroughput)}</span>
                  </div>
                </div>
              )}

              <Divider />

              <div className="grid grid-cols-3 gap-4">
                {MEMBER_LEVEL_CONFIG.map((level) => (
                  <div
                    key={level.level}
                    className={`rounded-xl p-4 text-center transition-all ${
                      level.level === currentLevel
                        ? 'bg-blue-50 ring-2 ring-[#3E92CC]'
                        : level.level === 'normal'
                        ? 'bg-gray-50'
                        : level.level === 'silver'
                        ? 'bg-slate-50'
                        : 'bg-amber-50'
                    }`}
                  >
                    <IconMap
                      name="Crown"
                      size={28}
                      className={`mx-auto mb-2 ${
                        level.level === currentLevel
                          ? 'text-[#3E92CC]'
                          : level.level === 'normal'
                          ? 'text-gray-400'
                          : level.level === 'silver'
                          ? 'text-slate-400'
                          : 'text-amber-400'
                      }`}
                    />
                    <p className={`font-medium ${
                      level.level === currentLevel ? 'text-[#0A2463]' : 'text-gray-600'
                    }`}>
                      {level.name}
                    </p>
                    <p className="text-xs text-gray-500">{formatTEU(level.minThroughput)} 起</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="专属权益" className="border-0 shadow-sm">
            <List
              dataSource={levelConfig?.benefits || []}
              renderItem={(benefit) => (
                <List.Item className="!border-0 !px-0">
                  <div className="flex w-full items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                      <IconMap name={benefitIcons[benefit.type] || 'Star'} size={20} className="text-[#3E92CC]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{benefit.name}</p>
                      <p className="text-xs text-gray-500">{benefit.description}</p>
                    </div>
                    <Tag color="blue" className="!rounded-full">
                      {benefit.value}
                      {benefit.unit}
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="border-0 shadow-sm">
            <Statistic
              title="本月吞吐量"
              value={3280}
              suffix="TEU"
              valueStyle={{ color: '#0A2463' }}
              prefix={<IconMap name="Package" size={20} />}
            />
            <p className="mt-2 text-sm text-emerald-600">
              <IconMap name="TrendingUp" size={14} className="mr-1 inline" />
              较上月增长 12.5%
            </p>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="border-0 shadow-sm">
            <Statistic
              title="累计节省费用"
              value={12580}
              prefix="¥"
              valueStyle={{ color: '#2EC4B6' }}
            />
            <p className="mt-2 text-sm text-gray-500">会员专属折扣累计节省</p>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="border-0 shadow-sm">
            <Statistic
              title="优先靠泊次数"
              value={12}
              valueStyle={{ color: '#FF6B35' }}
              prefix={<IconMap name="Zap" size={20} />}
            />
            <p className="mt-2 text-sm text-gray-500">本年度已使用权益</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MemberCenter;

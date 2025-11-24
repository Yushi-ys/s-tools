import React, { useState, useEffect } from 'react';
import styles from './index.module.less';
import { Input } from 'antd';

interface SalaryConfig {
  monthlySalary: number;
  workDaysPerMonth: number;
  workHoursPerDay: number;
}

const TodayEarnings: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<SalaryConfig>({
    monthlySalary: 0,
    workDaysPerMonth: 0,
    workHoursPerDay: 0
  });
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 从本地存储加载配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('salaryConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  // 每秒更新时间和收入
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      calculateTodayEarnings();
    }, 1000);

    return () => clearInterval(timer);
  }, [config]);

  // 计算今日收入
  const calculateTodayEarnings = () => {
    const { monthlySalary, workDaysPerMonth, workHoursPerDay } = config;
    
    if (monthlySalary > 0 && workDaysPerMonth > 0 && workHoursPerDay > 0) {
      const hourlyRate = monthlySalary / (workDaysPerMonth * workHoursPerDay);
      const now = new Date();
      const startOfWork = new Date(now);
      startOfWork.setHours(9, 0, 0, 0); // 假设9点上班
      
      const endOfWork = new Date(now);
      endOfWork.setHours(9 + workHoursPerDay, 0, 0, 0); // 计算下班时间
      
      let workedMs = 0;
      
      if (now >= startOfWork && now <= endOfWork) {
        workedMs = now.getTime() - startOfWork.getTime();
      } else if (now > endOfWork) {
        workedMs = endOfWork.getTime() - startOfWork.getTime();
      }
      
      const workedHours = workedMs / (1000 * 60 * 60);
      const earnings = workedHours * hourlyRate;
      
      setTodayEarnings(earnings > 0 ? earnings : 0);
    }
  };

  // 保存配置
  const handleSaveConfig = (newConfig: SalaryConfig) => {
    setConfig(newConfig);
    localStorage.setItem('salaryConfig', JSON.stringify(newConfig));
    setShowSettings(false);
  };

  // 格式化金额显示
  const formatCurrency = (amount: number): string => {
    return `¥${amount.toFixed(2)}`;
  };

  // 获取翻页数字的样式
  const getDigitStyle = (digit: string, index: number) => {
    return {
      animationDelay: `${index * 0.1}s`
    };
  };

  return (
    <div className={styles.container}>
      {/* 设置按钮 */}
      <div 
        className={styles.settingsButton}
        onClick={() => setShowSettings(true)}
      >
        ⚙️
      </div>

      {/* 主内容 */}
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>今日已赚</h1>
          <p className={styles.date}>
            {currentTime.toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
          <p className={styles.time}>
            {currentTime.toLocaleTimeString('zh-CN')}
          </p>
        </div>

        <div className={styles.earningsDisplay}>
          <div className={styles.amount}>
            {formatCurrency(todayEarnings).split('').map((digit, index) => (
              <span
                key={index}
                className={styles.digit}
                style={getDigitStyle(digit, index)}
              >
                {digit}
              </span>
            ))}
          </div>
          <p className={styles.subtitle}>努力工作，创造价值</p>
        </div>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>时薪</span>
            <span className={styles.statValue}>
              {config.monthlySalary && config.workDaysPerMonth && config.workHoursPerDay
                ? formatCurrency(config.monthlySalary / (config.workDaysPerMonth * config.workHoursPerDay))
                : '¥0.00'
              }
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>今日目标</span>
            <span className={styles.statValue}>
              {config.monthlySalary && config.workDaysPerMonth
                ? formatCurrency(config.monthlySalary / config.workDaysPerMonth)
                : '¥0.00'
              }
            </span>
          </div>
        </div>
      </div>

      {/* 设置弹窗 */}
      {showSettings && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>工资设置</h2>
            <div className={styles.formGroup}>
              <label>月薪（元）</label>
              <Input
                type="number"
                value={config.monthlySalary || ''}
                onChange={(e) => setConfig({
                  ...config,
                  monthlySalary: Number(e.target.value)
                })}
                placeholder="请输入月薪"
              />
            </div>
            <div className={styles.formGroup}>
              <label>每月工作天数</label>
              <Input
                type="number"
                value={config.workDaysPerMonth || ''}
                onChange={(e) => setConfig({
                  ...config,
                  workDaysPerMonth: Number(e.target.value)
                })}
                placeholder="每月工作天数"
                min="1"
                max="31"
              />
            </div>
            <div className={styles.formGroup}>
              <label>每天工作小时</label>
              <Input
                type="number"
                value={config.workHoursPerDay || ''}
                onChange={(e) => setConfig({
                  ...config,
                  workHoursPerDay: Number(e.target.value)
                })}
                placeholder="每天工作小时"
                min="1"
                max="24"
              />
            </div>
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowSettings(false)}
              >
                取消
              </button>
              <button 
                className={styles.saveButton}
                onClick={() => handleSaveConfig(config)}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayEarnings;
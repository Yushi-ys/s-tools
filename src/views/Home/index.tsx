import React, { useState } from "react";
import styles from "./index.module.less";
import { Input } from "antd";
import useStore from "@/store/store";
import { useInterval, useMemoizedFn } from "ahooks";
import type { IHomeData } from "@/store/type";

const TodayEarnings: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { homeData, setHomeData } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  const updateHomeData = useMemoizedFn((val: IHomeData) => {
    setHomeData(val);
  });

  // 保存配置
  const handleSaveConfig = useMemoizedFn((newConfig: IHomeData) => {
    updateHomeData(newConfig);
    setShowSettings(false);
  });

  // 格式化金额显示
  const formatCurrency = useMemoizedFn((amount: number): string => {
    return `¥${amount.toFixed(2)}`;
  });

  // 获取翻页数字的样式
  const getDigitStyle = useMemoizedFn((_: string, index: number) => {
    return {
      animationDelay: `${index * 0.1}s`,
    };
  });

  // 每秒更新一次时间
  useInterval(() => {
    setCurrentTime(new Date());
  }, 1000);

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
            {currentTime.toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
          <p className={styles.time}>
            {currentTime.toLocaleTimeString("zh-CN")}
          </p>
        </div>

        <div className={styles.earningsDisplay}>
          <div className={styles.amount}>
            {formatCurrency(homeData.todayEarnings)
              .split("")
              .map((digit, index) => (
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
              {homeData.monthlySalary && homeData.workDaysPerMonth
                ? (() => {
                    // 自动计算每日工作小时
                    const [startHour, startMinute] = homeData.workStartTime
                      .split(":")
                      .map(Number);
                    const [endHour, endMinute] = homeData.workEndTime
                      .split(":")
                      .map(Number);
                    const [lunchStartHour, lunchStartMinute] =
                      homeData.lunchBreakStart.split(":").map(Number);
                    const [lunchEndHour, lunchEndMinute] =
                      homeData.lunchBreakEnd.split(":").map(Number);

                    const totalWorkHours =
                      endHour + endMinute / 60 - (startHour + startMinute / 60);
                    const lunchBreakHours =
                      lunchEndHour +
                      lunchEndMinute / 60 -
                      (lunchStartHour + lunchStartMinute / 60);
                    const actualWorkHours = totalWorkHours - lunchBreakHours;

                    const hourlyRate =
                      homeData.monthlySalary /
                      (homeData.workDaysPerMonth * actualWorkHours);
                    return formatCurrency(hourlyRate);
                  })()
                : "¥0.00"}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>今日目标</span>
            <span className={styles.statValue}>
              {homeData.monthlySalary && homeData.workDaysPerMonth
                ? formatCurrency(
                    homeData.monthlySalary / homeData.workDaysPerMonth
                  )
                : "¥0.00"}
            </span>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>工资设置</h2>
            <div className={styles.formGroup}>
              <label>月薪（元）</label>
              <Input
                type="number"
                value={homeData.monthlySalary || ""}
                onChange={(e) =>
                  updateHomeData({
                    ...homeData,
                    monthlySalary: Number(e.target.value),
                  })
                }
                placeholder="请输入月薪"
              />
            </div>
            <div className={styles.formGroup}>
              <label>每月工作天数</label>
              <Input
                type="number"
                value={homeData.workDaysPerMonth || ""}
                onChange={(e) =>
                  updateHomeData({
                    ...homeData,
                    workDaysPerMonth: Number(e.target.value),
                  })
                }
                placeholder="每月工作天数"
                min="1"
                max="31"
              />
            </div>

            {/* 工作时间设置 */}
            <div className={styles.formGroup}>
              <label>上班时间</label>
              <Input
                type="time"
                value={homeData.workStartTime}
                onChange={(e) =>
                  updateHomeData({
                    ...homeData,
                    workStartTime: e.target.value,
                  })
                }
              />
            </div>
            <div className={styles.formGroup}>
              <label>下班时间</label>
              <Input
                type="time"
                value={homeData.workEndTime}
                onChange={(e) =>
                  updateHomeData({
                    ...homeData,
                    workEndTime: e.target.value,
                  })
                }
              />
            </div>
            <div className={styles.formGroup}>
              <label>午休开始</label>
              <Input
                type="time"
                value={homeData.lunchBreakStart}
                onChange={(e) =>
                  updateHomeData({
                    ...homeData,
                    lunchBreakStart: e.target.value,
                  })
                }
              />
            </div>
            <div className={styles.formGroup}>
              <label>午休结束</label>
              <Input
                type="time"
                value={homeData.lunchBreakEnd}
                onChange={(e) =>
                  updateHomeData({
                    ...homeData,
                    lunchBreakEnd: e.target.value,
                  })
                }
              />
            </div>

            {/* 可以添加一个显示每日工作小时的只读字段 */}
            <div className={styles.formGroup}>
              <label>每日工作小时（自动计算）</label>
              <Input
                value={(() => {
                  const [startHour, startMinute] = homeData.workStartTime
                    .split(":")
                    .map(Number);
                  const [endHour, endMinute] = homeData.workEndTime
                    .split(":")
                    .map(Number);
                  const [lunchStartHour, lunchStartMinute] =
                    homeData.lunchBreakStart.split(":").map(Number);
                  const [lunchEndHour, lunchEndMinute] = homeData.lunchBreakEnd
                    .split(":")
                    .map(Number);

                  const totalWorkHours =
                    endHour + endMinute / 60 - (startHour + startMinute / 60);
                  const lunchBreakHours =
                    lunchEndHour +
                    lunchEndMinute / 60 -
                    (lunchStartHour + lunchStartMinute / 60);
                  const actualWorkHours = totalWorkHours - lunchBreakHours;

                  return `${actualWorkHours.toFixed(2)} 小时`;
                })()}
                disabled
                placeholder="自动计算"
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
                onClick={() => handleSaveConfig(homeData)}
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

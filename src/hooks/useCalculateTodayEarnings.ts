// hooks/useCalculateTodayEarnings.ts
import { useEffect } from "react";
import useStore from "@/store/store";
import { useMemoizedFn } from "ahooks";

export const useCalculateTodayEarnings = () => {
  const calculateFn = useMemoizedFn(() => {
    const { homeData, setHomeData } = useStore.getState();
    const { 
      monthlySalary, 
      workDaysPerMonth,
      workStartTime,
      workEndTime,
      lunchBreakStart,
      lunchBreakEnd
    } = homeData;

    if (monthlySalary > 0 && workDaysPerMonth > 0) {
      // 计算每日实际工作小时（自动从时间设置计算）
      const [startHour, startMinute] = workStartTime.split(':').map(Number);
      const [endHour, endMinute] = workEndTime.split(':').map(Number);
      const [lunchStartHour, lunchStartMinute] = lunchBreakStart.split(':').map(Number);
      const [lunchEndHour, lunchEndMinute] = lunchBreakEnd.split(':').map(Number);
      
      // 计算总工作时间和午休时间（小时）
      const totalWorkHours = (endHour + endMinute/60) - (startHour + startMinute/60);
      const lunchBreakHours = (lunchEndHour + lunchEndMinute/60) - (lunchStartHour + lunchStartMinute/60);
      const actualWorkHours = totalWorkHours - lunchBreakHours;
      
      const hourlyRate = monthlySalary / (workDaysPerMonth * actualWorkHours);
      const now = new Date();
      
      // 设置今天的上班、下班和午休时间
      const startOfWork = new Date(now);
      startOfWork.setHours(startHour, startMinute, 0, 0);
      
      const endOfWork = new Date(now);
      endOfWork.setHours(endHour, endMinute, 0, 0);
      
      const lunchStart = new Date(now);
      lunchStart.setHours(lunchStartHour, lunchStartMinute, 0, 0);
      
      const lunchEnd = new Date(now);
      lunchEnd.setHours(lunchEndHour, lunchEndMinute, 0, 0);

      let workedMs = 0;

      if (now < startOfWork) {
        // 还没到上班时间
        workedMs = 0;
      } else if (now >= startOfWork && now <= endOfWork) {
        // 在工作时间内
        workedMs = now.getTime() - startOfWork.getTime();
        
        // 扣除午休时间（如果当前时间在午休之后）
        if (now > lunchEnd) {
          workedMs -= (lunchEnd.getTime() - lunchStart.getTime());
        } 
        // 如果当前时间在午休期间，只计算午休前的工作时间
        else if (now > lunchStart) {
          workedMs -= (now.getTime() - lunchStart.getTime());
        }
      } else {
        // 超过下班时间，计算全天工资（扣除午休）
        const totalWorkMs = endOfWork.getTime() - startOfWork.getTime();
        const lunchBreakMs = lunchEnd.getTime() - lunchStart.getTime();
        workedMs = totalWorkMs - lunchBreakMs;
      }

      const workedHours = workedMs / (1000 * 60 * 60);
      const earnings = workedHours * hourlyRate;
      const finalEarnings = earnings > 0 ? earnings : 0;

      console.log("在计算摸鱼时薪", finalEarnings, "工作时间:", workedHours.toFixed(2), "小时", "每日工作:", actualWorkHours.toFixed(2), "小时");

      setHomeData({
        ...homeData,
        todayEarnings: finalEarnings,
      });
    }
  });

  useEffect(() => {
    calculateFn(); // 立即执行一次
    
    const timer = setInterval(() => {
      calculateFn();
    }, 1000);

    return () => clearInterval(timer);
  }, []);
};
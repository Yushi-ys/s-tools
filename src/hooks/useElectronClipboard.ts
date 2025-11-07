// hooks/useElectronClipboard.ts
import { useState, useEffect, useCallback } from 'react'
import useStore from '@/store/store'
import type { IClipboardItem } from '@/hooks/useAdvancedClipboard'

export const useElectronClipboard = () => {
  const { setclipBoradData, clipBoradData } = useStore()
  const [isMonitoring, setIsMonitoring] = useState(false)

  // 检查是否在 Electron 环境中
  const isElectron = useCallback(() => {
    return !!(window && (window as any).electronAPI)
  }, [])

  // 处理从 Electron 主进程传来的剪贴板数据
  const handleClipboardChange = useCallback((data: IClipboardItem) => {

    if (data.type === 'text' && data.text && data.text.trim().length !== 0) {
      const newItem = {
        type: data.type,
        data: data.text,
        blob: new Blob([data.text], { type: 'text/plain' }),
        timestamp: data.timestamp
      }


      // 添加到 store，避免重复数据
      const isDuplicate = clipBoradData.some(item =>
        item.data === data.text &&
        item.timestamp &&
        Date.now() - item.timestamp < 1000 // 1秒内的重复数据
      )

      if (!isDuplicate) {
        setclipBoradData([newItem, ...clipBoradData])
      }
    } else if (data.type === 'image' && data.image) {
      // 处理图片数据
      const newItem = {
        type: data.type,
        data: data.image, // base64 数据
        preview: data.image, // 用于直接显示
        width: data.width,
        height: data.height,
        blob: null, // 可以稍后转换为 blob
        timestamp: data.timestamp
      } as IClipboardItem

      // 检查重复数据 - 对于图片，我们比较时间戳和尺寸
      const isDuplicate = clipBoradData.some(item =>
        item.type === 'image' &&
        item.width === data.width &&
        item.height === data.height &&
        item.timestamp &&
        Date.now() - item.timestamp < 1000
      )

      if (!isDuplicate) {
        // 可选：将 base64 转换为 blob 以便更好的存储和处理
        if (data.image.startsWith('data:image')) {
          setclipBoradData([newItem, ...clipBoradData])
        }
      }
    } else {
    }
  }, [setclipBoradData, clipBoradData]);

  // 开始监控
  const startMonitoring = useCallback(() => {
    if (!isElectron()) {
      return false
    }

    try {
      const { electronAPI } = window as any

      // 设置监听器
      electronAPI.onClipboardChange(handleClipboardChange)

      // 开始监控
      electronAPI.startClipboardMonitoring()

      setIsMonitoring(true)
      return true
    } catch (error) {
      return false
    }
  }, [isElectron, handleClipboardChange])

  // 停止监控
  const stopMonitoring = useCallback(() => {
    if (!isElectron()) return

    try {
      const { electronAPI } = window as any
      electronAPI.stopClipboardMonitoring()
      electronAPI.removeClipboardListeners()
      setIsMonitoring(false)
    } catch (error) {
      return
    }
  }, [isElectron])

  // 获取当前剪贴板内容
  const getCurrentClipboard = useCallback(async (): Promise<string> => {
    if (!isElectron()) return ''

    try {
      const { electronAPI } = window as any
      return await electronAPI.getClipboardText()
    } catch (error) {
      return ''
    }
  }, [isElectron])

  // 组件卸载时停止监控
  useEffect(() => {
    return () => {
      if (isElectron()) {
        stopMonitoring()
      }
    }
  }, [isElectron, stopMonitoring])

  return {
    isElectron: isElectron(),
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getCurrentClipboard
  }
}
"use client"

import React, { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, AlertTriangle, CheckCircle, X } from "lucide-react"

interface PerformanceMetrics {
  renderCount: number
  lastRenderTime: number
  averageRenderTime: number
  slowRenders: number
  memoryUsage?: number
}

interface PerformanceMonitorProps {
  componentName: string
  threshold?: number // ms
  showInProduction?: boolean
}

export const PerformanceMonitor = React.memo(function PerformanceMonitor({
  componentName,
  threshold = 16, // 60fps = 16ms per frame
  showInProduction = false
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    slowRenders: 0
  })
  const [isVisible, setIsVisible] = useState(false)
  
  const renderStartTime = useRef<number>(0)
  const renderTimes = useRef<number[]>([])
  const isProduction = process.env.NODE_ENV === "production"

  // Don't show in production unless explicitly enabled
  if (isProduction && !showInProduction) {
    return null
  }

  // Track render start
  renderStartTime.current = performance.now()

  useEffect(() => {
    // Track render end
    const renderEndTime = performance.now()
    const renderTime = renderEndTime - renderStartTime.current

    // Update metrics
    setMetrics(prev => {
      const newRenderTimes = [...renderTimes.current, renderTime].slice(-50) // Keep last 50 renders
      renderTimes.current = newRenderTimes
      
      const averageRenderTime = newRenderTimes.reduce((sum, time) => sum + time, 0) / newRenderTimes.length
      const slowRenders = prev.slowRenders + (renderTime > threshold ? 1 : 0)

      return {
        renderCount: prev.renderCount + 1,
        lastRenderTime: renderTime,
        averageRenderTime,
        slowRenders,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || undefined
      }
    })
  })

  const resetMetrics = () => {
    setMetrics({
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      slowRenders: 0
    })
    renderTimes.current = []
  }

  const getPerformanceStatus = () => {
    if (metrics.averageRenderTime > threshold * 2) return "poor"
    if (metrics.averageRenderTime > threshold) return "warning"
    return "good"
  }

  const formatMemory = (bytes?: number) => {
    if (!bytes) return "N/A"
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-white shadow-lg"
        >
          <Activity className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  const status = getPerformanceStatus()

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {componentName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={
                status === "good" ? "default" : 
                status === "warning" ? "secondary" : 
                "destructive"
              }>
                {status === "good" && <CheckCircle className="w-3 h-3 mr-1" />}
                {status === "warning" && <AlertTriangle className="w-3 h-3 mr-1" />}
                {status === "poor" && <AlertTriangle className="w-3 h-3 mr-1" />}
                {status.toUpperCase()}
              </Badge>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-500">Renders:</span>
              <span className="ml-1 font-mono">{metrics.renderCount}</span>
            </div>
            <div>
              <span className="text-gray-500">Slow:</span>
              <span className="ml-1 font-mono text-red-600">{metrics.slowRenders}</span>
            </div>
            <div>
              <span className="text-gray-500">Last:</span>
              <span className={`ml-1 font-mono ${
                metrics.lastRenderTime > threshold ? "text-red-600" : "text-green-600"
              }`}>
                {metrics.lastRenderTime.toFixed(1)}ms
              </span>
            </div>
            <div>
              <span className="text-gray-500">Avg:</span>
              <span className={`ml-1 font-mono ${
                metrics.averageRenderTime > threshold ? "text-red-600" : "text-green-600"
              }`}>
                {metrics.averageRenderTime.toFixed(1)}ms
              </span>
            </div>
          </div>
          
          {metrics.memoryUsage && (
            <div>
              <span className="text-gray-500">Memory:</span>
              <span className="ml-1 font-mono">{formatMemory(metrics.memoryUsage)}</span>
            </div>
          )}
          
          <Button
            onClick={resetMetrics}
            size="sm"
            variant="outline"
            className="w-full h-6 text-xs"
          >
            Reset
          </Button>
          
          {metrics.slowRenders > 5 && (
            <div className="text-red-600 text-xs">
              ⚠️ High render count detected. Check for infinite loops or unnecessary re-renders.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
})

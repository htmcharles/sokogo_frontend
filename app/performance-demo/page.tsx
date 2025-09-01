"use client"

import React, { useState, useCallback, useMemo, Suspense, lazy } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { PerformanceMonitor } from "@/components/PerformanceMonitor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Activity, Zap, AlertTriangle, CheckCircle } from "lucide-react"

// Lazy load heavy components
const LazyCarPhotoUpload = lazy(() => 
  import("@/components/LazyCarPhotoUpload").then(module => ({ default: module.LazyCarPhotoUpload }))
)

// Memoized heavy computation component
const HeavyComputationComponent = React.memo(function HeavyComputationComponent({ 
  data 
}: { 
  data: number[] 
}) {
  // Expensive calculation - memoized to prevent recalculation on every render
  const expensiveResult = useMemo(() => {
    console.log("🔄 Performing expensive calculation...")
    return data.reduce((acc, num) => acc + Math.sqrt(num * num), 0)
  }, [data])

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <p className="text-sm text-blue-800">
        Heavy computation result: <span className="font-mono">{expensiveResult.toFixed(2)}</span>
      </p>
    </div>
  )
})

export default function PerformanceDemoPage() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  
  // State management
  const [counter, setCounter] = useState(0)
  const [heavyData, setHeavyData] = useState<number[]>([1, 2, 3, 4, 5])
  const [showLazyComponent, setShowLazyComponent] = useState(false)
  const [performanceIssues, setPerformanceIssues] = useState<string[]>([])

  // Memoized expensive data generation
  const generateHeavyData = useCallback(() => {
    console.log("🔄 Generating heavy data...")
    const newData = Array.from({ length: 1000 }, (_, i) => Math.random() * i)
    setHeavyData(newData)
    toast({
      title: "Heavy Data Generated",
      description: `Generated ${newData.length} data points`
    })
  }, [toast])

  // Memoized counter increment to prevent recreation
  const incrementCounter = useCallback(() => {
    setCounter(prev => prev + 1)
  }, [])

  // Memoized performance status
  const performanceStatus = useMemo(() => {
    const issues = []
    
    if (heavyData.length > 500) {
      issues.push("Large dataset detected")
    }
    
    if (counter > 50) {
      issues.push("High counter value")
    }
    
    return {
      issues,
      status: issues.length === 0 ? "good" : issues.length < 2 ? "warning" : "poor"
    }
  }, [heavyData.length, counter])

  // Simulate performance issue detection
  const simulatePerformanceIssue = useCallback(() => {
    setPerformanceIssues(prev => [
      ...prev,
      `Performance issue detected at ${new Date().toLocaleTimeString()}`
    ])
    
    toast({
      title: "Performance Issue Simulated",
      description: "Check the performance monitor for details",
      variant: "destructive"
    })
  }, [toast])

  const clearPerformanceIssues = useCallback(() => {
    setPerformanceIssues([])
    toast({
      title: "Issues Cleared",
      description: "Performance issues list has been cleared"
    })
  }, [toast])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">Performance Optimization Demo</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Demonstrates React performance optimizations: memoization, lazy loading, and performance monitoring.
          </p>
        </div>

        {/* Performance Status */}
        <Card className={`mb-6 ${
          performanceStatus.status === "good" ? "border-green-200 bg-green-50" :
          performanceStatus.status === "warning" ? "border-yellow-200 bg-yellow-50" :
          "border-red-200 bg-red-50"
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {performanceStatus.status === "good" && <CheckCircle className="w-5 h-5 text-green-600" />}
                {performanceStatus.status === "warning" && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                {performanceStatus.status === "poor" && <AlertTriangle className="w-5 h-5 text-red-600" />}
                <span className={`font-medium ${
                  performanceStatus.status === "good" ? "text-green-800" :
                  performanceStatus.status === "warning" ? "text-yellow-800" :
                  "text-red-800"
                }`}>
                  Performance Status: {performanceStatus.status.toUpperCase()}
                </span>
              </div>
              <Badge variant="outline">
                {performanceStatus.issues.length} issue{performanceStatus.issues.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            {performanceStatus.issues.length > 0 && (
              <div className="mt-2 text-sm">
                <strong>Issues:</strong> {performanceStatus.issues.join(", ")}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Optimized State Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Optimized State Management</CardTitle>
              <CardDescription>
                Using useCallback and useMemo to prevent unnecessary re-renders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Counter: {counter}</span>
                <Button onClick={incrementCounter} size="sm">
                  Increment
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Heavy Data Points: {heavyData.length}</span>
                  <Button onClick={generateHeavyData} size="sm" variant="outline">
                    Generate Data
                  </Button>
                </div>
                <HeavyComputationComponent data={heavyData} />
              </div>
            </CardContent>
          </Card>

          {/* Lazy Loading Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lazy Loading</CardTitle>
              <CardDescription>
                Components are loaded only when needed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setShowLazyComponent(!showLazyComponent)}
                className="w-full"
              >
                {showLazyComponent ? "Hide" : "Show"} Lazy Component
              </Button>
              
              {showLazyComponent && (
                <Suspense fallback={
                  <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                    <span className="ml-2 text-gray-600">Loading component...</span>
                  </div>
                }>
                  <LazyCarPhotoUpload 
                    productId="demo-lazy-upload"
                    onPhotosUploaded={(urls) => console.log("Lazy upload:", urls)}
                  />
                </Suspense>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Issues Log */}
        {performanceIssues.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Performance Issues Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {performanceIssues.map((issue, index) => (
                  <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {issue}
                  </div>
                ))}
              </div>
              <Button 
                onClick={clearPerformanceIssues}
                size="sm"
                variant="outline"
                className="mt-4"
              >
                Clear Issues
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Performance Testing */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Performance Testing</CardTitle>
            <CardDescription>
              Test different scenarios to see performance impact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                onClick={simulatePerformanceIssue}
                variant="destructive"
                size="sm"
              >
                Simulate Issue
              </Button>
              <Button 
                onClick={() => {
                  // Force multiple re-renders to test performance
                  for (let i = 0; i < 10; i++) {
                    setTimeout(() => setCounter(prev => prev + 1), i * 10)
                  }
                }}
                variant="outline"
                size="sm"
              >
                Stress Test Renders
              </Button>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <h4 className="font-medium">Optimizations Applied:</h4>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>React.memo for component memoization</li>
                <li>useCallback for function memoization</li>
                <li>useMemo for expensive calculations</li>
                <li>Lazy loading for heavy components</li>
                <li>Proper useEffect dependency arrays</li>
                <li>Cleanup functions to prevent memory leaks</li>
                <li>Mounted ref checks to prevent state updates after unmount</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Monitor */}
      <PerformanceMonitor 
        componentName="PerformanceDemoPage"
        threshold={16}
      />
    </div>
  )
}

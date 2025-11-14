# Cost Monitoring Dashboard - Frontend Integration Guide

## Overview

This guide provides complete instructions for implementing the Cost Monitoring Dashboard in the frontend. The backend APIs are already implemented and ready to use.

## Backend APIs Available

### 1. Cost Overview
**Endpoint:** `GET /api/admin/costs/overview?period=day|week|month`

**Response:**
```json
{
  "success": true,
  "period": "day",
  "startDate": "2024-11-13T00:00:00.000Z",
  "endDate": "2024-11-14T00:00:00.000Z",
  "overview": {
    "totalCost": "$12.5432",
    "totalTokens": 125000,
    "totalRequests": 450,
    "uniqueUsers": 23,
    "avgCostPerRequest": "$0.027873"
  },
  "byAction": [
    {
      "action": "TAILOR_FULL",
      "cost": "$8.2100",
      "tokens": 82000,
      "requests": 120,
      "avgCost": "$0.068417"
    }
  ],
  "byModel": [
    {
      "model": "gpt-4o",
      "cost": "$10.1200",
      "tokens": 101000,
      "requests": 200,
      "avgCost": "$0.050600"
    }
  ]
}
```

### 2. Costs by User
**Endpoint:** `GET /api/admin/costs/by-user?period=day|week|month&limit=50`

**Response:**
```json
{
  "success": true,
  "period": "day",
  "users": [
    {
      "userId": "user-123",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "subscriptionTier": "PRO",
      "cost": "$2.5432",
      "tokens": 25000,
      "requests": 45,
      "avgCostPerRequest": "$0.056516"
    }
  ]
}
```

### 3. Cost Trends
**Endpoint:** `GET /api/admin/costs/trends?days=7`

**Response:**
```json
{
  "success": true,
  "trends": [
    {
      "date": "2024-11-07",
      "cost": 8.5432,
      "tokens": 85000,
      "requests": 320
    },
    {
      "date": "2024-11-08",
      "cost": 9.2100,
      "tokens": 92000,
      "requests": 350
    }
  ],
  "projections": {
    "avgDailyCost": "$8.8766",
    "projectedMonthlyCost": "$266.30",
    "projectedYearlyCost": "$3239.95"
  }
}
```

### 4. Cost Alerts
**Endpoint:** `GET /api/admin/costs/alerts`

**Response:**
```json
{
  "success": true,
  "alertCount": 2,
  "alerts": [
    {
      "type": "spike",
      "severity": "high",
      "message": "Today's costs ($15.23) are 75% higher than yesterday ($8.70)",
      "timestamp": "2024-11-14T06:00:00.000Z"
    },
    {
      "type": "user_near_cap",
      "severity": "medium",
      "message": "User John Doe (john@example.com) has used 92% of their PRO tier cap ($9.20/$10.00)",
      "userId": "user-123",
      "timestamp": "2024-11-14T06:00:00.000Z"
    }
  ]
}
```

### 5. Export Costs
**Endpoint:** `GET /api/admin/costs/export?period=week|month|year`

**Response:** CSV file download

## Frontend Implementation

### Step 1: Create Admin Cost Dashboard Page

**File:** `apps/web/src/app/admin/costs/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, TrendingUp, DollarSign, Users, Activity, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CostOverview {
  totalCost: string;
  totalTokens: number;
  totalRequests: number;
  uniqueUsers: number;
  avgCostPerRequest: string;
}

interface CostByAction {
  action: string;
  cost: string;
  tokens: number;
  requests: number;
  avgCost: string;
}

interface CostTrend {
  date: string;
  cost: number;
  tokens: number;
  requests: number;
}

interface CostAlert {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  userId?: string;
  timestamp: string;
}

export default function CostMonitoringDashboard() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [overview, setOverview] = useState<CostOverview | null>(null);
  const [byAction, setByAction] = useState<CostByAction[]>([]);
  const [trends, setTrends] = useState<CostTrend[]>([]);
  const [alerts, setAlerts] = useState<CostAlert[]>([]);
  const [projections, setProjections] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCostData();
  }, [period]);

  const fetchCostData = async () => {
    setLoading(true);
    try {
      // Fetch overview
      const overviewRes = await fetch(`/api/admin/costs/overview?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const overviewData = await overviewRes.json();
      
      if (overviewData.success) {
        setOverview(overviewData.overview);
        setByAction(overviewData.byAction);
      }

      // Fetch trends
      const trendsRes = await fetch(`/api/admin/costs/trends?days=7`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const trendsData = await trendsRes.json();
      
      if (trendsData.success) {
        setTrends(trendsData.trends);
        setProjections(trendsData.projections);
      }

      // Fetch alerts
      const alertsRes = await fetch(`/api/admin/costs/alerts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const alertsData = await alertsRes.json();
      
      if (alertsData.success) {
        setAlerts(alertsData.alerts);
      }
    } catch (error) {
      console.error('Failed to fetch cost data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/costs/export?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `costs-${period}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export costs:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cost Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-1">Track and analyze AI service costs</p>
        </div>
        <div className="flex gap-4">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="capitalize">{alert.severity} Alert</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalCost}</div>
            <p className="text-xs text-muted-foreground">
              {overview?.totalRequests} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Tokens used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost/Request</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.avgCostPerRequest}</div>
            <p className="text-xs text-muted-foreground">
              Per request
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Cost Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>

        {/* Cost Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Trends (Last 7 Days)</CardTitle>
              <CardDescription>Daily cost and usage trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#8884d8" name="Cost ($)" />
                  <Line yAxisId="right" type="monotone" dataKey="requests" stroke="#82ca9d" name="Requests" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Costs by Action</CardTitle>
                <CardDescription>Breakdown by AI action type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={byAction}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="action" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cost" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requests by Action</CardTitle>
                <CardDescription>Request distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={byAction}
                      dataKey="requests"
                      nameKey="action"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {byAction.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projections Tab */}
        <TabsContent value="projections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{projections?.avgDailyCost}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on last 7 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Projection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{projections?.projectedMonthlyCost}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Estimated for 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Yearly Projection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{projections?.projectedYearlyCost}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Estimated for 365 days
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Step 2: Add Admin Route

**File:** `apps/web/src/app/admin/layout.tsx`

```typescript
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  
  // Check if user is admin
  const adminUsers = (process.env.ADMIN_USERS || '').split(',');
  if (!session || !adminUsers.includes(session.user?.id)) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <h2 className="text-xl font-semibold">Admin Dashboard</h2>
        </div>
      </nav>
      {children}
    </div>
  );
}
```

### Step 3: Install Required Dependencies

```bash
npm install recharts lucide-react
```

### Step 4: Add Navigation Link

Add a link to the admin dashboard in your main navigation (for admin users only):

```typescript
{isAdmin && (
  <Link href="/admin/costs">
    <Button variant="ghost">
      <DollarSign className="mr-2 h-4 w-4" />
      Cost Monitoring
    </Button>
  </Link>
)}
```

## Environment Variables

Add to `.env`:

```env
# Admin Users (comma-separated user IDs)
ADMIN_USERS=user-id-1,user-id-2,user-id-3
```

## Features Implemented

### ✅ Cost Overview
- Total costs for selected period
- Total tokens used
- Total requests
- Unique users
- Average cost per request

### ✅ Cost Breakdown
- Costs by AI action (TAILOR_FULL, ATS_SCORE, etc.)
- Costs by model (gpt-4o, gpt-4o-mini, etc.)
- Visual charts (bar, pie, line)

### ✅ Cost Trends
- 7-day cost trends
- Daily request counts
- Token usage over time

### ✅ Projections
- Average daily cost
- Projected monthly cost
- Projected yearly cost

### ✅ Alerts
- Cost spikes (>50% increase)
- Users approaching spending caps
- Severity levels (critical, high, medium, low)

### ✅ Export
- CSV export for any period
- Includes all cost details

## Testing

1. **Access Control:**
   ```bash
   # Test without admin access
   curl -H "Authorization: Bearer <user-token>" http://localhost:3001/api/admin/costs/overview
   # Should return 403 Forbidden
   
   # Test with admin access
   curl -H "Authorization: Bearer <admin-token>" http://localhost:3001/api/admin/costs/overview
   # Should return cost data
   ```

2. **Data Accuracy:**
   - Verify costs match AIRequestLog table
   - Check projections are calculated correctly
   - Ensure alerts trigger at correct thresholds

3. **Performance:**
   - Test with large datasets (1000+ records)
   - Verify queries are optimized
   - Check response times < 2 seconds

## Production Recommendations

1. **Caching:**
   - Cache cost overview for 5 minutes
   - Cache trends for 15 minutes
   - Invalidate on new AI requests

2. **Pagination:**
   - Limit user lists to 50 by default
   - Add pagination for large datasets

3. **Real-time Updates:**
   - Consider WebSocket for live cost updates
   - Update dashboard every 5 minutes

4. **Access Control:**
   - Implement role-based access (ADMIN role in database)
   - Add audit logging for admin actions

5. **Alerts:**
   - Send email notifications for critical alerts
   - Integrate with Slack/Discord for team notifications

## Summary

**Backend:** ✅ Complete
- 5 API endpoints implemented
- Cost tracking, trends, alerts, export
- Admin authentication required

**Frontend:** 📋 Ready to Implement
- Complete React component provided
- Charts and visualizations included
- Responsive design

**Next Steps:**
1. Create the frontend page using the provided code
2. Test with real cost data
3. Configure admin users in environment variables
4. Set up alerts and notifications

---

**Last Updated**: November 14, 2024  
**Version**: 1.0.0


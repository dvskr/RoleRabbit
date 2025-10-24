import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, Clock, DollarSign, Zap, Brain, Target, CheckCircle } from 'lucide-react';

interface AIAnalytics {
  totalRequests: number;
  tokensUsed: number;
  totalCost: number;
  averageResponseTime: number;
  successRate: number;
  modelUsage: Array<{
    model: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
  dailyUsage: Array<{
    date: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
  featureUsage: Array<{
    feature: string;
    usage: number;
    successRate: number;
  }>;
}

interface AIAnalyticsDashboardProps {
  userId: string;
  className?: string;
}

export const AIAnalyticsDashboard: React.FC<AIAnalyticsDashboardProps> = ({
  userId,
  className = ''
}) => {
  const [analytics, setAnalytics] = useState<AIAnalytics>({
    totalRequests: 0,
    tokensUsed: 0,
    totalCost: 0,
    averageResponseTime: 0,
    successRate: 0,
    modelUsage: [],
    dailyUsage: [],
    featureUsage: []
  });
  
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in production, fetch from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAnalytics: AIAnalytics = {
        totalRequests: 1247,
        tokensUsed: 156789,
        totalCost: 12.45,
        averageResponseTime: 2.3,
        successRate: 98.5,
        modelUsage: [
          { model: 'GPT-5', requests: 234, tokens: 45678, cost: 12.45 },
          { model: 'Sonnet 4.5', requests: 189, tokens: 32121, cost: 8.23 },
          { model: 'GPT-4', requests: 456, tokens: 67890, cost: 6.78 },
          { model: 'GPT-3.5 Turbo', requests: 623, tokens: 45678, cost: 2.89 },
          { model: 'Claude 3 Opus', requests: 123, tokens: 32121, cost: 1.33 },
          { model: 'Gemini Pro', requests: 45, tokens: 11100, cost: 0.00 }
        ],
        dailyUsage: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          requests: Math.floor(Math.random() * 50) + 10,
          tokens: Math.floor(Math.random() * 5000) + 1000,
          cost: Math.random() * 2 + 0.1
        })),
        featureUsage: [
          { feature: 'Resume Analysis', usage: 234, successRate: 99.1 },
          { feature: 'Job Optimization', usage: 189, successRate: 97.9 },
          { feature: 'Cover Letter Generation', usage: 156, successRate: 98.7 },
          { feature: 'Skill Suggestions', usage: 123, successRate: 96.8 },
          { feature: 'Content Improvement', usage: 98, successRate: 97.5 }
        ]
      };
      
      setAnalytics(mockAnalytics);
      setIsLoading(false);
    };

    fetchAnalytics();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      default: return 'Last 30 days';
    }
  };

  if (isLoading) {
    return (
      <div className={`ai-analytics-dashboard ${className}`}>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`ai-analytics-dashboard bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Analytics</h3>
              <p className="text-sm text-gray-600">{getTimeRangeLabel()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {formatNumber(analytics.totalRequests)}
                </div>
                <div className="text-sm text-blue-700">Total Requests</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-900">
                  {formatNumber(analytics.tokensUsed)}
                </div>
                <div className="text-sm text-green-700">Tokens Used</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-900">
                  {formatCurrency(analytics.totalCost)}
                </div>
                <div className="text-sm text-purple-700">Total Cost</div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-900">
                  {analytics.averageResponseTime}s
                </div>
                <div className="text-sm text-orange-700">Avg Response Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Model Usage Chart */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Model Usage</h4>
          <div className="space-y-3">
            {analytics.modelUsage.map((model, index) => (
              <div key={model.model} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">{model.model}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(model.requests / Math.max(...analytics.modelUsage.map(m => m.requests))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {model.requests} requests
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatNumber(model.tokens)} tokens • {formatCurrency(model.cost)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Usage */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Feature Usage</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.featureUsage.map((feature) => (
              <div key={feature.feature} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{feature.feature}</h5>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{feature.successRate}%</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatNumber(feature.usage)}
                </div>
                <div className="text-sm text-gray-600">uses</div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Usage Chart */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Daily Usage Trend</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-7 gap-2">
              {analytics.dailyUsage.slice(-7).map((day, index) => (
                <div key={day.date} className="text-center">
                  <div className="text-xs text-gray-600 mb-1">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="bg-blue-600 rounded-sm mb-1" style={{ height: `${(day.requests / Math.max(...analytics.dailyUsage.map(d => d.requests))) * 40}px` }} />
                  <div className="text-xs text-gray-900">{day.requests}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalyticsDashboard;

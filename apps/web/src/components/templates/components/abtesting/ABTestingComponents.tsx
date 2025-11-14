/**
 * A/B Testing Components
 * Complete A/B testing system with dashboard, create form, and results visualization
 */

import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Plus,
  Play,
  Pause,
  StopCircle,
  Trash2,
  TrendingUp,
  BarChart3,
  Eye,
  MousePointerClick,
  Target,
  Award,
  X,
} from 'lucide-react';
import { useABTesting, type ABTest, type TestVariant, type TestResults } from '../../hooks/useABTesting';

// ============================================================================
// AB Test Dashboard Component
// ============================================================================

interface ABTestDashboardProps {
  className?: string;
}

export const ABTestDashboard: React.FC<ABTestDashboardProps> = ({ className = '' }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [showResults, setShowResults] = useState(false);

  const {
    tests,
    loading,
    fetchTests,
    startTest,
    pauseTest,
    stopTest,
    deleteTest,
  } = useABTesting();

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Handle test control
  const handleStart = async (testId: string) => {
    await startTest(testId);
    fetchTests();
  };

  const handlePause = async (testId: string) => {
    await pauseTest(testId);
    fetchTests();
  };

  const handleStop = async (testId: string) => {
    if (confirm('Stop this test?')) {
      await stopTest(testId);
      fetchTests();
    }
  };

  const handleDelete = async (testId: string) => {
    if (confirm('Delete this test?')) {
      await deleteTest(testId);
    }
  };

  const handleViewResults = (test: ABTest) => {
    setSelectedTest(test);
    setShowResults(true);
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FlaskConical className="text-blue-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">A/B Testing Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage and analyze experiments</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Create Test
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Tests</div>
          <div className="text-3xl font-bold text-gray-900">{tests.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Running</div>
          <div className="text-3xl font-bold text-green-600">
            {tests.filter((t) => t.status === 'running').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Paused</div>
          <div className="text-3xl font-bold text-yellow-600">
            {tests.filter((t) => t.status === 'paused').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-3xl font-bold text-blue-600">
            {tests.filter((t) => t.status === 'completed').length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Tests</h2>
        </div>

        {loading && tests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : tests.length === 0 ? (
          <div className="p-12 text-center">
            <FlaskConical className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tests yet</h3>
            <p className="text-gray-600 mb-6">Create your first test</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              <Plus size={20} />
              Create Test
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tests.map((test) => (
              <div key={test.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {test.status === 'draft' && (
                      <button
                        onClick={() => handleStart(test.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Play size={18} />
                      </button>
                    )}
                    {test.status === 'running' && (
                      <>
                        <button
                          onClick={() => handlePause(test.id)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                        >
                          <Pause size={18} />
                        </button>
                        <button
                          onClick={() => handleStop(test.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <StopCircle size={18} />
                        </button>
                      </>
                    )}
                    {test.status === 'completed' && (
                      <button
                        onClick={() => handleViewResults(test)}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                      >
                        View Results
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(test.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateForm && (
        <CreateTestForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            fetchTests();
          }}
        />
      )}

      {showResults && selectedTest && (
        <TestResultsVisualization
          testId={selectedTest.id}
          onClose={() => {
            setShowResults(false);
            setSelectedTest(null);
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// Create Test Form Component
// ============================================================================

interface CreateTestFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTestForm: React.FC<CreateTestFormProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [variants, setVariants] = useState<Omit<TestVariant, 'id'>[]>([
    { name: 'Control', description: 'Original', config: {}, traffic: 50 },
    { name: 'Variant A', description: 'Test', config: {}, traffic: 50 },
  ]);

  const { createTest, loading } = useABTesting({ autoFetch: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const test = await createTest({
      name,
      description,
      status: 'draft',
      variants: variants.map((v, i) => ({ ...v, id: `variant-${i}` })),
    });

    if (test) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Create A/B Test</h2>
            <button type="button" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 text-gray-700">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// Test Results Visualization Component
// ============================================================================

interface TestResultsVisualizationProps {
  testId: string;
  onClose: () => void;
}

export const TestResultsVisualization: React.FC<TestResultsVisualizationProps> = ({
  testId,
  onClose,
}) => {
  const [results, setResults] = useState<TestResults | null>(null);
  const { getTestResults, loading } = useABTesting({ autoFetch: false });

  useEffect(() => {
    const loadResults = async () => {
      const data = await getTestResults(testId);
      setResults(data);
    };
    loadResults();
  }, [testId, getTestResults]);

  if (loading || !results) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-12">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const { test, analysis, variantComparison } = results;
  const winner = variantComparison.find((v) => v.isWinner);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">{test.name}</h2>
            <p className="text-gray-600 mt-1">Test Results</p>
          </div>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <BarChart3 className="text-blue-600" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Analysis</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Sample Size</div>
                    <div className="text-xl font-bold">{analysis.sampleSize.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Confidence</div>
                    <div className="text-xl font-bold">{analysis.confidence}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Significant?</div>
                    <div className="text-xl font-bold">
                      {analysis.significantDifference ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {winner && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Award className="text-green-600" size={24} />
                <div>
                  <h3 className="font-semibold">Winner: {winner.variantName}</h3>
                  <p className="text-sm text-gray-700">
                    {winner.metrics.conversionRate.toFixed(2)}% conversion
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-4">Variant Performance</h3>
            <div className="space-y-4">
              {variantComparison.map((variant) => (
                <div
                  key={variant.variantId}
                  className={`border rounded-lg p-6 ${
                    variant.isWinner ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between mb-4">
                    <h4 className="font-semibold">{variant.variantName}</h4>
                    <div className="text-2xl font-bold">{variant.performance}/100</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                        <Eye size={14} />
                        Impressions
                      </div>
                      <div className="font-semibold">
                        {variant.metrics.impressions.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                        <MousePointerClick size={14} />
                        Clicks
                      </div>
                      <div className="font-semibold">
                        {variant.metrics.clicks.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                        <Target size={14} />
                        CTR
                      </div>
                      <div className="font-semibold">{variant.metrics.ctr.toFixed(2)}%</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                        <TrendingUp size={14} />
                        Conv. Rate
                      </div>
                      <div className="font-semibold">
                        {variant.metrics.conversionRate.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

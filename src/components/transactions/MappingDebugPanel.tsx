import React, { useState, useEffect } from 'react';
import { mappingLogger } from '../../services/mappingLogger';
import { AlertCircle, ChevronDown, ChevronUp, CheckCircle, Clock } from 'lucide-react';

export const MappingDebugPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [summary, setSummary] = useState(mappingLogger.getAttemptSummary());
  const [logs, setLogs] = useState(mappingLogger.getLogs());
  const [metrics, setMetrics] = useState(mappingLogger.getPerformanceMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setSummary(mappingLogger.getAttemptSummary());
      setLogs(mappingLogger.getLogs());
      setMetrics(mappingLogger.getPerformanceMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hasErrors = logs.some(log => log.level === 'error');
  const successRate = metrics.successRate;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div 
        className="px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-gray-900">RAG Mapping Debug</h3>
          {hasErrors ? (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Errors Found
            </span>
          ) : metrics.successfulAttempts > 0 ? (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              {Math.round(successRate)}% Success Rate
            </span>
          ) : null}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </div>

      {isExpanded && (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Total Attempts</p>
              <p className="text-lg font-semibold">{metrics.totalAttempts}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Successful</p>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <p className="text-lg font-semibold text-green-600">
                  {metrics.successfulAttempts}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Failed</p>
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                <p className="text-lg font-semibold text-red-600">
                  {metrics.failedAttempts}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Average Time</p>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-1" />
                <p className="text-lg font-semibold">
                  {metrics.averageDuration.toFixed(1)}ms
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">RAG Mapping Logs</h4>
            <div className="bg-gray-50 p-3 rounded-lg space-y-2 max-h-60 overflow-y-auto font-mono">
              {logs.map((log, index) => (
                <div 
                  key={index}
                  className={`text-xs ${
                    log.level === 'error' 
                      ? 'text-red-600' 
                      : log.level === 'warning'
                      ? 'text-yellow-600'
                      : 'text-gray-600'
                  }`}
                >
                  <span className="font-medium">[{log.level.toUpperCase()}]</span>{' '}
                  {new Date(log.timestamp).toLocaleTimeString()}: {log.message}
                  {log.duration && (
                    <span className="text-gray-500 ml-1">
                      ({log.duration.toFixed(2)}ms)
                    </span>
                  )}
                  {log.data && (
                    <pre className="mt-1 text-xs text-gray-500 overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
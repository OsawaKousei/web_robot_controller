'use client';

import React, { useState } from 'react';
import { useRosContext } from '../../../contexts/RosProvider';
import { BaseComponentProps } from '../../../types';

interface ConnectionManagerProps extends BaseComponentProps {
  defaultUrl?: string;
}

export const ConnectionManager: React.FC<ConnectionManagerProps> = ({
  className = '',
  defaultUrl = 'ws://localhost:9090'
}) => {
  const { connectionStatus, connect, disconnect, error } = useRosContext();
  const [url, setUrl] = useState(defaultUrl);
  const [isUrlEditing, setIsUrlEditing] = useState(false);

  const handleConnect = async () => {
    if (connectionStatus === 'connected') {
      disconnect();
    } else {
      await connect(url);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-400 border-green-500/50';
      case 'connecting':
        return 'text-yellow-400 border-yellow-500/50';
      case 'error':
        return 'text-red-400 border-red-500/50';
      default:
        return 'text-gray-400 border-gray-500/50';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        );
      case 'connecting':
        return (
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-spin border-2 border-yellow-400 border-t-transparent"></div>
        );
      case 'error':
        return (
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
        );
      default:
        return (
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
        );
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'ROS接続済み';
      case 'connecting':
        return 'ROS接続中...';
      case 'error':
        return 'ROS接続エラー';
      case 'disconnected':
      default:
        return 'ROS未接続';
    }
  };

  const getButtonText = () => {
    switch (connectionStatus) {
      case 'connected':
        return '切断';
      case 'connecting':
        return '接続中...';
      default:
        return '接続';
    }
  };

  const isConnectDisabled = connectionStatus === 'connecting';

  return (
    <div className={`bg-gray-900/50 rounded-lg border border-green-500/30 backdrop-blur-sm p-4 ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
          <span className="text-green-300 font-mono text-sm font-semibold">ROS2接続</span>
        </div>
        <div className={`flex items-center space-x-2 px-2 py-1 rounded border ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-xs font-mono">{getStatusText()}</span>
        </div>
      </div>

      {/* URL設定 */}
      <div className="mb-4">
        <label className="block text-green-300 text-xs font-mono mb-2">
          WebSocket URL
        </label>
        <div className="flex space-x-2">
          {isUrlEditing ? (
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => setIsUrlEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsUrlEditing(false);
                if (e.key === 'Escape') {
                  setUrl(defaultUrl);
                  setIsUrlEditing(false);
                }
              }}
              className="flex-1 px-3 py-2 bg-gray-800/50 border border-green-500/30 rounded text-green-300 text-sm font-mono focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
              placeholder="ws://localhost:9090"
              autoFocus
            />
          ) : (
            <div
              onClick={() => setIsUrlEditing(true)}
              className="flex-1 px-3 py-2 bg-gray-800/50 border border-green-500/30 rounded text-green-300 text-sm font-mono cursor-pointer hover:border-green-400 transition-colors"
            >
              {url || 'ws://localhost:9090'}
            </div>
          )}
          <button
            onClick={() => setIsUrlEditing(!isUrlEditing)}
            className="px-3 py-2 bg-green-600/30 hover:bg-green-600/50 border border-green-500/50 rounded text-green-300 text-sm transition-all"
          >
            編集
          </button>
        </div>
      </div>

      {/* 接続ボタン */}
      <div className="flex space-x-2">
        <button
          onClick={handleConnect}
          disabled={isConnectDisabled}
          className={`flex-1 px-4 py-2 rounded font-mono text-sm transition-all ${
            connectionStatus === 'connected'
              ? 'bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-300'
              : 'bg-green-600/30 hover:bg-green-600/50 border border-green-500/50 text-green-300'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {getButtonText()}
        </button>
        {connectionStatus === 'error' && (
          <button
            onClick={() => connect(url)}
            className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 rounded text-blue-300 text-sm font-mono transition-all"
          >
            再試行
          </button>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-300 text-sm font-medium">接続エラー</p>
              <p className="text-red-400 text-xs mt-1 font-mono">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 接続情報 */}
      {connectionStatus === 'connected' && (
        <div className="mt-4 p-3 bg-green-900/50 border border-green-500/50 rounded">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-300 text-sm">
              <span className="font-medium">ROS2 Web Bridgeに接続しました</span>
            </p>
          </div>
          <p className="text-green-400 text-xs mt-1 font-mono">{url}</p>
        </div>
      )}
    </div>
  );
};
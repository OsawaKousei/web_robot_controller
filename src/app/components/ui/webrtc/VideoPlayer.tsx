'use client';

import React, { useEffect, useRef } from 'react';
import { useWebRTC } from '../../../hooks/useWebRTC';
import { BaseComponentProps } from '../../../types';

interface VideoPlayerProps extends BaseComponentProps {
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  width?: number;
  height?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  className = '',
  autoplay = true,
  muted = true,
  controls = false,
  width,
  height
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { mediaStream, peerConnectionStatus, error, startConnection, stopConnection } = useWebRTC();

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  const handleStartStream = () => {
    startConnection();
  };

  const handleStopStream = () => {
    stopConnection();
  };

  const getStatusColor = () => {
    switch (peerConnectionStatus) {
      case 'connected':
        return 'text-green-400';
      case 'connecting':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (peerConnectionStatus) {
      case 'connected':
        return '接続済み';
      case 'connecting':
        return '接続中...';
      case 'disconnected':
        return '切断済み';
      case 'error':
        return 'エラー';
      case 'idle':
      default:
        return '待機中';
    }
  };

  return (
    <div className={`relative bg-gray-900/50 rounded-lg border border-green-500/30 backdrop-blur-sm ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-green-500/30">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-green-300 font-mono text-sm">ライブ映像</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-mono ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          <div className="flex space-x-1">
            <button
              onClick={handleStartStream}
              disabled={peerConnectionStatus === 'connected' || peerConnectionStatus === 'connecting'}
              className="px-3 py-1 text-xs bg-green-600/30 hover:bg-green-600/50 text-green-300 rounded border border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              開始
            </button>
            <button
              onClick={handleStopStream}
              disabled={peerConnectionStatus === 'idle'}
              className="px-3 py-1 text-xs bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded border border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              停止
            </button>
          </div>
        </div>
      </div>

      {/* ビデオエリア */}
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay={autoplay}
          muted={muted}
          controls={controls}
          width={width}
          height={height}
          className="w-full h-auto rounded-b-lg bg-black"
          style={{ minHeight: '240px' }}
        />
        
        {/* オーバーレイ - 映像がない場合 */}
        {!mediaStream && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-b-lg">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-2 border-green-500/50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-green-300 mb-2">映像待機中</p>
              {peerConnectionStatus === 'idle' && (
                <p className="text-gray-400 text-sm">「開始」ボタンを押して接続してください</p>
              )}
              {peerConnectionStatus === 'connecting' && (
                <p className="text-yellow-400 text-sm">接続中...</p>
              )}
            </div>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="absolute top-2 left-2 right-2 bg-red-900/80 border border-red-500/50 rounded p-2">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* 接続状態インジケーター */}
        <div className="absolute top-2 right-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
            peerConnectionStatus === 'connected' 
              ? 'bg-green-900/80 text-green-300 border border-green-500/50' 
              : 'bg-gray-900/80 text-gray-400 border border-gray-500/50'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              peerConnectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className="font-mono">{getStatusText()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
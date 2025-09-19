'use client';

import React from 'react';
import { ConnectionManager } from './components/ui/ros/ConnectionManager';
import { Joystick } from './components/ui/ros/Joystick';
import { VideoPlayer } from './components/ui/webrtc/VideoPlayer';

export default function Home() {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* ヘッダー */}
      <header className="mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Robot Controller
                </h1>
                <p className="text-gray-400 text-sm font-mono">次世代ロボット制御システム v2.0</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-900/50 rounded-full border border-green-500/30 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm font-mono">SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* 左カラム: 制御パネル */}
          <div className="xl:col-span-1 space-y-6">
            {/* ROS接続管理 */}
            <ConnectionManager />
            
            {/* ジョイスティック */}
            <Joystick />
            
            {/* システム情報 */}
            <div className="bg-gray-900/50 rounded-lg border border-green-500/30 backdrop-blur-sm p-4">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-green-300 font-mono text-sm font-semibold">システム状態</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">CPU使用率</span>
                  <span className="text-green-400 font-mono text-sm">23%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">メモリ使用量</span>
                  <span className="text-green-400 font-mono text-sm">156MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">接続遅延</span>
                  <span className="text-green-400 font-mono text-sm">12ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">アップタイム</span>
                  <span className="text-green-400 font-mono text-sm">2:34:12</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右カラム: 映像・情報表示 */}
          <div className="xl:col-span-2 space-y-6">
            {/* ライブ映像 */}
            <VideoPlayer className="h-fit" />
            
            {/* ロボット情報パネル */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* バッテリー・センサー情報 */}
              <div className="bg-gray-900/50 rounded-lg border border-green-500/30 backdrop-blur-sm p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-green-300 font-mono text-sm font-semibold">ロボット状態</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-400 text-sm">バッテリー</span>
                      <span className="text-green-400 font-mono text-sm">87%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full" style={{width: '87%'}}></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">温度</span>
                    <span className="text-green-400 font-mono text-sm">42°C</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">距離センサー</span>
                    <span className="text-green-400 font-mono text-sm">1.2m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Wi-Fi信号強度</span>
                    <span className="text-green-400 font-mono text-sm">-45dBm</span>
                  </div>
                </div>
              </div>

              {/* コマンドログ */}
              <div className="bg-gray-900/50 rounded-lg border border-green-500/30 backdrop-blur-sm p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-green-300 font-mono text-sm font-semibold">コマンドログ</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  <div className="text-xs font-mono text-gray-400">
                    <span className="text-green-500">[12:34:56]</span> cmd_vel: linear=0.5, angular=0.0
                  </div>
                  <div className="text-xs font-mono text-gray-400">
                    <span className="text-green-500">[12:34:55]</span> cmd_vel: linear=0.3, angular=0.2
                  </div>
                  <div className="text-xs font-mono text-gray-400">
                    <span className="text-green-500">[12:34:54]</span> cmd_vel: linear=0.0, angular=0.0
                  </div>
                  <div className="text-xs font-mono text-gray-400">
                    <span className="text-green-500">[12:34:53]</span> Connection established
                  </div>
                  <div className="text-xs font-mono text-gray-400">
                    <span className="text-blue-500">[12:34:52]</span> ROS bridge connected
                  </div>
                </div>
              </div>
            </div>

            {/* 緊急停止ボタン */}
            <div className="flex justify-center">
              <button className="px-8 py-4 bg-red-600/30 hover:bg-red-600/50 border-2 border-red-500 rounded-full text-red-300 font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-red-500/25">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>緊急停止</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="mt-12 text-center">
        <div className="max-w-7xl mx-auto py-8 border-t border-green-500/30">
          <p className="text-gray-400 text-sm font-mono">
            Robot Controller © 2024 - Powered by ROS2 & WebRTC
          </p>
          <div className="flex justify-center items-center space-x-4 mt-4">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>WebSocket</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>WebRTC</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>ROS2</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

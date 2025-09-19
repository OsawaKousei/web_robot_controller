'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRosContext } from '../../../contexts/RosProvider';
import { BaseComponentProps, JoystickData } from '../../../types';

interface JoystickProps extends BaseComponentProps {
  size?: number;
  maxLinearSpeed?: number;
  maxAngularSpeed?: number;
  throttleRate?: number;
}

export const Joystick: React.FC<JoystickProps> = ({
  className = '',
  size = 200,
  maxLinearSpeed = 1.0,
  maxAngularSpeed = 2.0,
  throttleRate = 100
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { connectionStatus, publishCmdVel } = useRosContext();
  const [isDragging, setIsDragging] = useState(false);
  const [joystickData, setJoystickData] = useState<JoystickData>({ x: 0, y: 0 });
  const [lastPublishTime, setLastPublishTime] = useState(0);

  const centerX = size / 2;
  const centerY = size / 2;
  const baseRadius = size * 0.4;
  const knobRadius = size * 0.08;
  const maxDistance = baseRadius - knobRadius;

  // ジョイスティックの描画
  const drawJoystick = useCallback((ctx: CanvasRenderingContext2D, knobX: number, knobY: number) => {
    // キャンバスをクリア
    ctx.clearRect(0, 0, size, size);

    // 背景の円
    ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // 中央のクロスヘア
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY);
    ctx.lineTo(centerX + 10, centerY);
    ctx.moveTo(centerX, centerY - 10);
    ctx.lineTo(centerX, centerY + 10);
    ctx.stroke();

    // 方向指示
    ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
    ctx.font = `${size * 0.06}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('前進', centerX, centerY - baseRadius + 15);
    ctx.fillText('後退', centerX, centerY + baseRadius - 5);
    ctx.save();
    ctx.translate(centerX - baseRadius + 15, centerY);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('左回転', 0, 0);
    ctx.restore();
    ctx.save();
    ctx.translate(centerX + baseRadius - 15, centerY);
    ctx.rotate(Math.PI / 2);
    ctx.fillText('右回転', 0, 0);
    ctx.restore();

    // ノブ
    const gradient = ctx.createRadialGradient(knobX, knobY, 0, knobX, knobY, knobRadius);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.4)');
    
    ctx.fillStyle = gradient;
    ctx.strokeStyle = 'rgba(34, 197, 94, 1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(knobX, knobY, knobRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // ノブの中央点
    ctx.fillStyle = 'rgba(34, 197, 94, 1)';
    ctx.beginPath();
    ctx.arc(knobX, knobY, 2, 0, 2 * Math.PI);
    ctx.fill();
  }, [size, centerX, centerY, baseRadius, knobRadius]);

  // 座標をジョイスティックデータに変換
  const coordsToJoystickData = useCallback((x: number, y: number): JoystickData => {
    const deltaX = x - centerX;
    const deltaY = y - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > maxDistance) {
      const angle = Math.atan2(deltaY, deltaX);
      return {
        x: Math.cos(angle) * (maxDistance / maxDistance),
        y: Math.sin(angle) * (maxDistance / maxDistance)
      };
    }
    
    return {
      x: deltaX / maxDistance,
      y: deltaY / maxDistance
    };
  }, [centerX, centerY, maxDistance]);

  // ジョイスティックデータをROS速度に変換
  const joystickToVelocity = useCallback((data: JoystickData) => {
    const linear = -data.y * maxLinearSpeed; // Y軸を反転（上が正の方向）
    const angular = -data.x * maxAngularSpeed; // X軸を反転（左が正の方向）
    return { linear, angular };
  }, [maxLinearSpeed, maxAngularSpeed]);

  // ROS cmd_vel送信（スロットリング付き）
  const sendVelocity = useCallback((data: JoystickData) => {
    const now = Date.now();
    if (now - lastPublishTime < throttleRate) {
      return;
    }

    if (connectionStatus === 'connected') {
      const { linear, angular } = joystickToVelocity(data);
      publishCmdVel(linear, angular);
      setLastPublishTime(now);
    }
  }, [connectionStatus, publishCmdVel, joystickToVelocity, lastPublishTime, throttleRate]);

  // マウス/タッチイベントハンドラー
  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (connectionStatus !== 'connected') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setIsDragging(true);
    const data = coordsToJoystickData(x, y);
    setJoystickData(data);
    sendVelocity(data);
  }, [connectionStatus, coordsToJoystickData, sendVelocity]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || connectionStatus !== 'connected') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const data = coordsToJoystickData(x, y);
    setJoystickData(data);
    sendVelocity(data);
  }, [isDragging, connectionStatus, coordsToJoystickData, sendVelocity]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setJoystickData({ x: 0, y: 0 });
    if (connectionStatus === 'connected') {
      publishCmdVel(0, 0); // 停止コマンド
    }
  }, [connectionStatus, publishCmdVel]);

  // マウスイベント
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // タッチイベント
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    }
  }, [handleMove]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  // イベントリスナーの設定
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // ジョイスティックの描画更新
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const knobX = centerX + joystickData.x * maxDistance;
    const knobY = centerY + joystickData.y * maxDistance;
    
    drawJoystick(ctx, knobX, knobY);
  }, [joystickData, drawJoystick, centerX, centerY, maxDistance]);

  const { linear, angular } = joystickToVelocity(joystickData);

  return (
    <div className={`bg-gray-900/50 rounded-lg border border-green-500/30 backdrop-blur-sm p-4 ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span className="text-green-300 font-mono text-sm font-semibold">ロボット操縦</span>
        </div>
        <div className={`px-2 py-1 rounded border text-xs font-mono ${
          connectionStatus === 'connected' 
            ? 'text-green-400 border-green-500/50 bg-green-900/30' 
            : 'text-gray-400 border-gray-500/50 bg-gray-900/30'
        }`}>
          {connectionStatus === 'connected' ? '操縦可能' : '接続待ち'}
        </div>
      </div>

      {/* ジョイスティック */}
      <div className="flex flex-col items-center space-y-4">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className={`rounded-lg border border-green-500/30 ${
            connectionStatus === 'connected' 
              ? 'cursor-grab active:cursor-grabbing' 
              : 'cursor-not-allowed opacity-50'
          }`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{ touchAction: 'none' }}
        />

        {/* 速度表示 */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <div className="bg-gray-800/50 rounded border border-green-500/30 p-2">
            <div className="text-green-300 text-xs font-mono mb-1">直進速度</div>
            <div className="text-green-400 font-mono text-sm">
              {linear.toFixed(2)} m/s
            </div>
          </div>
          <div className="bg-gray-800/50 rounded border border-green-500/30 p-2">
            <div className="text-green-300 text-xs font-mono mb-1">回転速度</div>
            <div className="text-green-400 font-mono text-sm">
              {angular.toFixed(2)} rad/s
            </div>
          </div>
        </div>

        {/* 操作説明 */}
        {connectionStatus !== 'connected' && (
          <div className="text-center text-gray-400 text-xs">
            <p>ROSに接続してから操縦してください</p>
          </div>
        )}
        {connectionStatus === 'connected' && (
          <div className="text-center text-green-400 text-xs">
            <p>ドラッグしてロボットを操縦</p>
          </div>
        )}
      </div>
    </div>
  );
};
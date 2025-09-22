"use client";

import { useState, useEffect } from "react";
import { Joystick } from "react-joystick-component";
import { IJoystickUpdateEvent } from "react-joystick-component/build/lib/Joystick";
import { ROSConnection } from "@/lib/ROSConnection";

interface VirtualJoystickProps {
  onJoystickMove: (data: { x: number; y: number }) => void;
  isConnected: boolean;
  rosConnection: ROSConnection | null;
}

export default function VirtualJoystick({ onJoystickMove, isConnected, rosConnection }: VirtualJoystickProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMove = (event: IJoystickUpdateEvent) => {
    if (event.x !== undefined && event.y !== undefined && event.x !== null && event.y !== null) {

      const normalizedX = event.x / 50; // react-joystick-componentは-50から50の値を返す
      const normalizedY = event.y / 50;
      
      setPosition({ x: normalizedX, y: normalizedY });
      onJoystickMove({ x: normalizedX, y: normalizedY });

      // ROSにcmd_velメッセージを配信
      if (isConnected && rosConnection) {
        rosConnection.publishJoystickMovement(normalizedX, normalizedY);
      }
    }
  };

  const handleStop = () => {
    setPosition({ x: 0, y: 0 });
    onJoystickMove({ x: 0, y: 0 });

    // ロボットを停止
    if (isConnected && rosConnection) {
      rosConnection.publishJoystickMovement(0, 0);
    }
  };

  return (
    <div className="col-span-3 row-span-4 panel-gradient border border-panel-border rounded-lg p-3 cyber-glow">
      <h2 className="text-sm font-semibold mb-2 text-cyber-blue neon-text">
        MOVEMENT CONTROL
      </h2>
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <Joystick
            size={112}
            sticky={false}
            baseColor="rgba(0, 0, 0, 0.5)"
            stickColor="#4FACFE"
            move={handleMove}
            stop={handleStop}
            disabled={!isConnected}
          />
          <div className="absolute inset-0 rounded-full border-2 border-cyber-blue/50 pointer-events-none"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyber-blue/20 to-transparent pointer-events-none"></div>
        </div>
        <div className="text-center text-xs space-y-1">
          <div className="text-cyber-blue">X: {position.x.toFixed(4)}</div>
          <div className="text-cyber-blue">Y: {position.y.toFixed(4)}</div>
        </div>
        {!isConnected && (
          <div className="text-xs text-destructive text-center">
            Connect to robot to enable controls
          </div>
        )}
      </div>
    </div>
  );
}

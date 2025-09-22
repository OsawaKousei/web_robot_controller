"use client";

import { useState, useRef } from "react";
import VirtualJoystick from "@/components/VirtualJoystick";
import { ROSConnection } from "@/lib/ROSConnection";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [consoleOutput, setConsoleOutput] = useState([
    "SYSTEM: RoboCyber Control Station v2.1.0",
    "SYSTEM: Initializing neural network interface...",
    "SYSTEM: Awaiting robot connection...",
  ]);
  const rosConnectionRef = useRef<ROSConnection | null>(null);

  const addConsoleMessage = (message: string) => {
    setConsoleOutput((prev) => [...prev.slice(-20), message]);
  };

  const toggleConnection = async () => {
    if (isConnected) {
      // 切断処理
      if (rosConnectionRef.current) {
        rosConnectionRef.current.disconnect();
        rosConnectionRef.current = null;
      }
      setIsConnected(false);
      addConsoleMessage("CONNECTION: Robot disconnected");
    } else {
      // 接続処理
      try {
        const rosUrl = process.env.NEXT_PUBLIC_ROS_WEBSOCKET_URL || 'ws://localhost:9090';
        rosConnectionRef.current = new ROSConnection(addConsoleMessage);
        await rosConnectionRef.current.connect(rosUrl);
        setIsConnected(true);
        addConsoleMessage("CONNECTION: Robot connected successfully");
      } catch (error) {
        addConsoleMessage(`CONNECTION: Failed to connect - ${error}`);
        rosConnectionRef.current = null;
      }
    }
  };

  const handleJoystickMove = (data: { x: number; y: number }) => {
    setJoystickPosition(data);
    if (isConnected) {
      addConsoleMessage(`MOVE: X=${data.x.toFixed(4)}, Y=${data.y.toFixed(4)}`);
    }
  };

  return (
    <div className="h-screen bg-background text-foreground p-2 grid grid-cols-12 grid-rows-8 gap-2 overflow-hidden">
      {/* Header */}
      <header className="col-span-12 row-span-1 panel-gradient border border-panel-border rounded-lg p-3 cyber-glow">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 bg-cyber-blue rounded-full neon-text flex items-center justify-center">
              <span className="text-sm font-bold">R</span>
            </div>
            <h1 className="text-lg font-bold neon-text text-cyber-blue">
              RoboCyber Control Station
            </h1>
          </div>
          <div className="text-xs text-muted-foreground">
            SYSTEM TIME: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </header>

      {/* Connection Panel */}
      <div className="col-span-3 row-span-3 panel-gradient border border-panel-border rounded-lg p-3 cyber-glow">
        <h2 className="text-sm font-semibold mb-3 text-cyber-green neon-text">
          CONNECTION STATUS
        </h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "status-online" : "status-offline"
              }`}
            ></div>
            <span
              className={`font-medium text-xs ${
                isConnected ? "text-cyber-green" : "text-destructive"
              }`}
            >
              {isConnected ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div>IP: 192.168.1.100</div>
            <div>PORT: 8080</div>
            <div>LATENCY: {isConnected ? "12ms" : "N/A"}</div>
          </div>
          <button
            onClick={toggleConnection}
            className={`w-full py-1.5 px-3 rounded border transition-all duration-300 text-xs ${
              isConnected
                ? "bg-destructive/20 border-destructive text-destructive hover:bg-destructive/30"
                : "bg-cyber-blue/20 border-cyber-blue text-cyber-blue hover:bg-cyber-blue/30 cyber-glow"
            }`}
          >
            {isConnected ? "DISCONNECT" : "CONNECT"}
          </button>
        </div>
      </div>

      {/* Camera Monitor */}
      <div className="col-span-6 row-span-3 panel-gradient border border-panel-border rounded-lg p-3 cyber-glow">
        <h2 className="text-sm font-semibold mb-2 text-cyber-purple neon-text">
          CAMERA FEED
        </h2>
        <div className="w-full h-5/6 bg-black/50 border border-cyber-purple/50 rounded relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/10 to-transparent"></div>
          <div className="absolute top-2 left-2 text-cyber-purple text-xs">
            CAM_01 | RES: 1920x1080 | FPS: 30
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl text-cyber-purple/30">📹</div>
          </div>
          {isConnected && (
            <div className="absolute bottom-2 right-2">
              <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Robot Stats */}
      <div className="col-span-3 row-span-3 panel-gradient border border-panel-border rounded-lg p-3 cyber-glow">
        <h2 className="text-sm font-semibold mb-3 text-cyber-pink neon-text">
          ROBOT TELEMETRY
        </h2>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>BATTERY:</span>
            <span className="text-cyber-green">87%</span>
          </div>
          <div className="w-full bg-black/50 rounded-full h-1.5">
            <div
              className="bg-cyber-green h-1.5 rounded-full"
              style={{ width: "87%" }}
            ></div>
          </div>
          <div className="flex justify-between">
            <span>CPU TEMP:</span>
            <span className="text-cyber-blue">42°C</span>
          </div>
          <div className="flex justify-between">
            <span>MEMORY:</span>
            <span className="text-cyber-purple">2.1/4.0GB</span>
          </div>
          <div className="flex justify-between">
            <span>SPEED:</span>
            <span className="text-cyber-pink">1.2 m/s</span>
          </div>
          <div className="flex justify-between">
            <span>JOY X:</span>
            <span className="text-cyber-blue">
              {joystickPosition.x.toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>JOY Y:</span>
            <span className="text-cyber-blue">
              {joystickPosition.y.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Virtual Joystick */}
      <VirtualJoystick
        onJoystickMove={handleJoystickMove}
        isConnected={isConnected}
        rosConnection={rosConnectionRef.current}
      />

      {/* Console */}
      <div className="col-span-9 row-span-4 panel-gradient border border-panel-border rounded-lg p-3 cyber-glow flex flex-col">
        <h2 className="text-sm font-semibold mb-2 text-cyber-green neon-text">
          SYSTEM CONSOLE
        </h2>
        <div className="flex-1 bg-black/70 border border-cyber-green/30 rounded p-2 overflow-y-auto font-mono text-xs">
          {consoleOutput.map((line, index) => (
            <div key={index} className="text-cyber-green mb-0.5">
              <span className="text-muted-foreground text-xs">
                [{new Date().toLocaleTimeString()}]
              </span>{" "}
              {line}
            </div>
          ))}
        </div>
        <div className="mt-2 flex">
          <input
            type="text"
            placeholder="Enter command..."
            className="flex-1 bg-black/50 border border-cyber-green/30 rounded-l px-2 py-1 text-xs focus:outline-none focus:border-cyber-green"
            onKeyPress={(e) => {
              if (e.key === "Enter" && e.currentTarget.value) {
                addConsoleMessage(`USER: ${e.currentTarget.value}`);
                e.currentTarget.value = "";
              }
            }}
          />
          <button className="px-3 py-1 bg-cyber-green/20 border border-cyber-green text-cyber-green rounded-r hover:bg-cyber-green/30 transition-colors text-xs">
            SEND
          </button>
        </div>
      </div>
    </div>
  );
}

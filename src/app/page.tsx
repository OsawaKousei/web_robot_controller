"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [consoleOutput, setConsoleOutput] = useState([
    "SYSTEM: RoboCyber Control Station v2.1.0",
    "SYSTEM: Initializing neural network interface...",
    "SYSTEM: Awaiting robot connection...",
  ]);
  const joystickRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleJoystickMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = Math.max(
      -centerX,
      Math.min(centerX, clientX - rect.left - centerX)
    );
    const y = Math.max(
      -centerY,
      Math.min(centerY, clientY - rect.top - centerY)
    );

    setJoystickPosition({ x: x / centerX, y: -y / centerY });
  };

  const handleJoystickEnd = () => {
    isDragging.current = false;
    setJoystickPosition({ x: 0, y: 0 });
  };

  const toggleConnection = () => {
    setIsConnected(!isConnected);
    const newMessage = isConnected
      ? "CONNECTION: Robot disconnected"
      : "CONNECTION: Robot connected successfully";
    setConsoleOutput((prev) => [...prev, newMessage]);
  };

  const addConsoleMessage = (message: string) => {
    setConsoleOutput((prev) => [...prev.slice(-20), `USER: ${message}`]);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleJoystickMove(e as any);
    const handleMouseUp = handleJoystickEnd;

    if (isDragging.current) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 grid grid-cols-12 grid-rows-12 gap-4">
      {/* Header */}
      <header className="col-span-12 row-span-1 panel-gradient border border-panel-border rounded-lg p-4 cyber-glow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-cyber-blue rounded-full neon-text flex items-center justify-center">
              <span className="text-lg font-bold">R</span>
            </div>
            <h1 className="text-xl font-bold neon-text text-cyber-blue">
              RoboCyber Control Station
            </h1>
          </div>
          <div className="text-sm text-muted-foreground">
            SYSTEM TIME: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </header>

      {/* Connection Panel */}
      <div className="col-span-3 row-span-3 panel-gradient border border-panel-border rounded-lg p-4 cyber-glow">
        <h2 className="text-lg font-semibold mb-4 text-cyber-green neon-text">
          CONNECTION STATUS
        </h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-4 h-4 rounded-full ${
                isConnected ? "status-online" : "status-offline"
              }`}
            ></div>
            <span
              className={`font-medium ${
                isConnected ? "text-cyber-green" : "text-destructive"
              }`}
            >
              {isConnected ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div>IP: 192.168.1.100</div>
            <div>PORT: 8080</div>
            <div>LATENCY: {isConnected ? "12ms" : "N/A"}</div>
          </div>
          <button
            onClick={toggleConnection}
            className={`w-full py-2 px-4 rounded border transition-all duration-300 ${
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
      <div className="col-span-6 row-span-6 panel-gradient border border-panel-border rounded-lg p-4 cyber-glow">
        <h2 className="text-lg font-semibold mb-4 text-cyber-purple neon-text">
          CAMERA FEED
        </h2>
        <div className="w-full h-full bg-black/50 border border-cyber-purple/50 rounded relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/10 to-transparent"></div>
          <div className="absolute top-4 left-4 text-cyber-purple text-sm">
            CAM_01 | RES: 1920x1080 | FPS: 30
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl text-cyber-purple/30">📹</div>
          </div>
          {isConnected && (
            <div className="absolute bottom-4 right-4">
              <div className="w-3 h-3 bg-cyber-green rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Robot Stats */}
      <div className="col-span-3 row-span-3 panel-gradient border border-panel-border rounded-lg p-4 cyber-glow">
        <h2 className="text-lg font-semibold mb-4 text-cyber-pink neon-text">
          ROBOT TELEMETRY
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>BATTERY:</span>
            <span className="text-cyber-green">87%</span>
          </div>
          <div className="w-full bg-black/50 rounded-full h-2">
            <div
              className="bg-cyber-green h-2 rounded-full"
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
        </div>
      </div>

      {/* Virtual Joystick */}
      <div className="col-span-3 row-span-5 panel-gradient border border-panel-border rounded-lg p-4 cyber-glow">
        <h2 className="text-lg font-semibold mb-4 text-cyber-blue neon-text">
          MOVEMENT CONTROL
        </h2>
        <div className="flex flex-col items-center space-y-4">
          <div
            ref={joystickRef}
            className="relative w-40 h-40 bg-black/50 rounded-full border-2 border-cyber-blue/50 cursor-pointer"
            onMouseDown={() => {
              isDragging.current = true;
            }}
            onTouchStart={() => {
              isDragging.current = true;
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyber-blue/20 to-transparent"></div>
            <div
              className="absolute w-8 h-8 bg-cyber-blue rounded-full cyber-glow transition-all duration-100"
              style={{
                left: `calc(50% + ${joystickPosition.x * 60}px - 16px)`,
                top: `calc(50% + ${-joystickPosition.y * 60}px - 16px)`,
              }}
            ></div>
          </div>
          <div className="text-center text-sm space-y-1">
            <div>X: {joystickPosition.x.toFixed(2)}</div>
            <div>Y: {joystickPosition.y.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Console */}
      <div className="col-span-9 row-span-5 panel-gradient border border-panel-border rounded-lg p-4 cyber-glow">
        <h2 className="text-lg font-semibold mb-4 text-cyber-green neon-text">
          SYSTEM CONSOLE
        </h2>
        <div className="h-32 bg-black/70 border border-cyber-green/30 rounded p-3 overflow-y-auto font-mono text-sm">
          {consoleOutput.map((line, index) => (
            <div key={index} className="text-cyber-green mb-1">
              <span className="text-muted-foreground">
                [{new Date().toLocaleTimeString()}]
              </span>{" "}
              {line}
            </div>
          ))}
        </div>
        <div className="mt-3 flex">
          <input
            type="text"
            placeholder="Enter command..."
            className="flex-1 bg-black/50 border border-cyber-green/30 rounded-l px-3 py-2 text-sm focus:outline-none focus:border-cyber-green"
            onKeyPress={(e) => {
              if (e.key === "Enter" && e.currentTarget.value) {
                addConsoleMessage(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
          <button className="px-4 py-2 bg-cyber-green/20 border border-cyber-green text-cyber-green rounded-r hover:bg-cyber-green/30 transition-colors">
            SEND
          </button>
        </div>
      </div>
    </div>
  );
}

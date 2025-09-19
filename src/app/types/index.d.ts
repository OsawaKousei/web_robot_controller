// ROS関連の型定義
export interface TwistMessage {
    linear: {
        x: number;
        y: number;
        z: number;
    };
    angular: {
        x: number;
        y: number;
        z: number;
    };
}

export interface ROSConnectionConfig {
    url: string;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface ROSContext {
    connectionStatus: ConnectionStatus;
    ros: any; // roslib.jsのROSオブジェクト
    connect: (url: string) => void;
    disconnect: () => void;
    publishCmdVel: (linear: number, angular: number) => void;
    error: string | null;
}

// WebRTC関連の型定義
export type PeerConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WebRTCContext {
    mediaStream: MediaStream | null;
    peerConnectionStatus: PeerConnectionStatus;
    startConnection: () => void;
    stopConnection: () => void;
    error: string | null;
}

// ジョイスティック関連の型定義
export interface JoystickData {
    x: number; // -1 から 1
    y: number; // -1 から 1
}

export interface JoystickConfig {
    size?: number;
    baseColor?: string;
    stickColor?: string;
    disabled?: boolean;
    throttleRate?: number;
}

// UIコンポーネントの共通Props
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
}

// ロボット制御に関する型定義
export interface RobotControlCommand {
    linear: number;
    angular: number;
    timestamp: number;
}

export interface RobotStatus {
    isConnected: boolean;
    batteryLevel?: number;
    lastCommand?: RobotControlCommand;
    errorMessage?: string;
}
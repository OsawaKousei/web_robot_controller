// roslib.jsのラッパークラス
import { TwistMessage, ConnectionStatus } from '../types';

// この型定義はroslibがグローバルに定義されることを想定
declare global {
    interface Window {
        ROSLIB: any;
    }
}

export class ROSManager {
    private ros: any = null;
    private cmdVelTopic: any = null;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private maxReconnectAttempts: number = 5;
    private reconnectAttempts: number = 0;
    private reconnectInterval: number = 3000;

    // イベントコールバック
    public onConnectionChange?: (status: ConnectionStatus) => void;
    public onError?: (error: string) => void;

    constructor() {
        // roslibがロードされるまで待機する処理は別途必要
    }

    async connect(url: string): Promise<void> {
        if (typeof window === 'undefined' || !window.ROSLIB) {
            throw new Error('ROSLIB is not loaded');
        }

        return new Promise((resolve, reject) => {
            try {
                this.ros = new window.ROSLIB.Ros({
                    url: url
                });

                this.ros.on('connection', () => {
                    console.log('Connected to websocket server.');
                    this.reconnectAttempts = 0;
                    this.onConnectionChange?.('connected');
                    this.setupTopics();
                    resolve();
                });

                this.ros.on('error', (error: any) => {
                    console.log('Error connecting to websocket server: ', error);
                    this.onConnectionChange?.('error');
                    this.onError?.(error.toString());
                    this.scheduleReconnect(url);
                    reject(error);
                });

                this.ros.on('close', () => {
                    console.log('Connection to websocket server closed.');
                    this.onConnectionChange?.('disconnected');
                    this.scheduleReconnect(url);
                });

                this.onConnectionChange?.('connecting');
            } catch (error) {
                this.onConnectionChange?.('error');
                this.onError?.(error instanceof Error ? error.message : 'Unknown error');
                reject(error);
            }
        });
    }

    disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.ros) {
            this.ros.close();
            this.ros = null;
        }

        this.cmdVelTopic = null;
        this.onConnectionChange?.('disconnected');
    }

    private setupTopics(): void {
        if (!this.ros) return;

        // cmd_velトピックの設定
        this.cmdVelTopic = new window.ROSLIB.Topic({
            ros: this.ros,
            name: '/cmd_vel',
            messageType: 'geometry_msgs/Twist'
        });
    }

    publishCmdVel(linearX: number, angularZ: number): void {
        if (!this.cmdVelTopic) {
            console.warn('cmd_vel topic is not initialized');
            return;
        }

        const twist: TwistMessage = {
            linear: {
                x: linearX,
                y: 0,
                z: 0
            },
            angular: {
                x: 0,
                y: 0,
                z: angularZ
            }
        };

        this.cmdVelTopic.publish(twist);
    }

    private scheduleReconnect(url: string): void {
        if (this.reconnectTimer || this.reconnectAttempts >= this.maxReconnectAttempts) {
            return;
        }

        this.reconnectTimer = setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

            this.reconnectTimer = null;
            this.connect(url).catch(() => {
                // エラーは既にconnectメソッド内で処理済み
            });
        }, this.reconnectInterval);
    }

    isConnected(): boolean {
        return this.ros && this.ros.isConnected;
    }

    getConnectionStatus(): ConnectionStatus {
        if (!this.ros) return 'disconnected';
        if (this.ros.isConnected) return 'connected';
        return 'disconnected';
    }
}

// シングルトンインスタンス
let rosManagerInstance: ROSManager | null = null;

export const getRosManager = (): ROSManager => {
    if (!rosManagerInstance) {
        rosManagerInstance = new ROSManager();
    }
    return rosManagerInstance;
};
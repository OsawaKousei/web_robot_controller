'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConnectionStatus, ROSConnectionConfig } from '../types';
import { getRosManager } from '../lib/ros';

export const useRos = (config?: ROSConnectionConfig) => {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [error, setError] = useState<string | null>(null);
    const [lastCommandTime, setLastCommandTime] = useState<number>(0);

    const rosManager = getRosManager();

    // ROSライブラリの動的ロード
    const loadRosLib = useCallback(async () => {
        if (typeof window !== 'undefined' && !window.ROSLIB) {
            try {
                // CDNからroslibを動的ロード
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/roslib@1.3.0/build/roslib.min.js';
                script.async = true;

                return new Promise<void>((resolve, reject) => {
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Failed to load ROSLIB'));
                    document.head.appendChild(script);
                });
            } catch (err) {
                throw new Error('Failed to load ROS library');
            }
        }
    }, []);

    useEffect(() => {
        // ROSマネージャーのイベントリスナーを設定
        rosManager.onConnectionChange = setConnectionStatus;
        rosManager.onError = setError;

        return () => {
            // クリーンアップ
            rosManager.onConnectionChange = undefined;
            rosManager.onError = undefined;
        };
    }, [rosManager]);

    const connect = useCallback(async (url: string) => {
        try {
            setError(null);
            await loadRosLib();
            await rosManager.connect(url);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Connection failed';
            setError(errorMessage);
            setConnectionStatus('error');
        }
    }, [rosManager, loadRosLib]);

    const disconnect = useCallback(() => {
        rosManager.disconnect();
        setError(null);
    }, [rosManager]);

    const publishCmdVel = useCallback((linear: number, angular: number) => {
        if (connectionStatus !== 'connected') {
            console.warn('Cannot publish cmd_vel: not connected to ROS');
            return;
        }

        // スロットリング：同じ秒内での重複送信を防ぐ
        const now = Date.now();
        const minInterval = config?.reconnectInterval || 100; // 100ms間隔

        if (now - lastCommandTime < minInterval) {
            return;
        }

        try {
            rosManager.publishCmdVel(linear, angular);
            setLastCommandTime(now);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to publish cmd_vel';
            setError(errorMessage);
        }
    }, [connectionStatus, rosManager, lastCommandTime, config?.reconnectInterval]);

    const isConnected = useCallback(() => {
        return rosManager.isConnected();
    }, [rosManager]);

    return {
        connectionStatus,
        error,
        connect,
        disconnect,
        publishCmdVel,
        isConnected,
        ros: rosManager
    };
};
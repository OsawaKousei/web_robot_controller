'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PeerConnectionStatus } from '../types';

export const useWebRTC = () => {
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [peerConnectionStatus, setPeerConnectionStatus] = useState<PeerConnectionStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    // WebRTC設定
    const rtcConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    const createPeerConnection = useCallback(() => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }

        const pc = new RTCPeerConnection(rtcConfiguration);

        pc.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', pc.iceConnectionState);
            switch (pc.iceConnectionState) {
                case 'connected':
                case 'completed':
                    setPeerConnectionStatus('connected');
                    break;
                case 'disconnected':
                    setPeerConnectionStatus('disconnected');
                    break;
                case 'failed':
                    setPeerConnectionStatus('error');
                    setError('ICE connection failed');
                    break;
                case 'checking':
                    setPeerConnectionStatus('connecting');
                    break;
                default:
                    break;
            }
        };

        pc.ontrack = (event) => {
            console.log('Received remote stream');
            setMediaStream(event.streams[0]);
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                // シグナリングサーバーにICE候補を送信する処理
                // 実際の実装では、WebSocketやHTTPでシグナリングサーバーに送信
                console.log('ICE candidate:', event.candidate);
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    }, []);

    const startConnection = useCallback(async () => {
        try {
            setError(null);
            setPeerConnectionStatus('connecting');

            // ローカルメディア（カメラ・マイク）を取得（送信側の場合）
            // ロボット制御の場合は主に受信側なので、この部分は省略可能
            /*
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true
            });
            localStreamRef.current = stream;
            */

            const pc = createPeerConnection();

            // ローカルストリームをPeerConnectionに追加（送信側の場合）
            /*
            if (localStreamRef.current) {
              localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
              });
            }
            */

            // オファーを作成（実際の実装では、シグナリングの種類によって異なる）
            // この例では、受信側（ロボットからの映像を受信）として実装

            // シグナリングサーバーからオファーを受信する処理をここに実装
            // 実際の実装では、WebSocketまたはHTTPでシグナリングサーバーと通信

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start WebRTC connection';
            setError(errorMessage);
            setPeerConnectionStatus('error');
        }
    }, [createPeerConnection]);

    const stopConnection = useCallback(() => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        setMediaStream(null);
        setPeerConnectionStatus('idle');
        setError(null);
    }, []);

    // シグナリングメッセージを処理する関数（実際の実装で使用）
    const handleSignalingMessage = useCallback(async (message: any) => {
        if (!peerConnectionRef.current) return;

        const pc = peerConnectionRef.current;

        try {
            if (message.type === 'offer') {
                await pc.setRemoteDescription(new RTCSessionDescription(message));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                // シグナリングサーバーにアンサーを送信
                // 実際の実装では、WebSocketやHTTPでシグナリングサーバーに送信
                console.log('Sending answer:', answer);

            } else if (message.type === 'answer') {
                await pc.setRemoteDescription(new RTCSessionDescription(message));

            } else if (message.type === 'ice-candidate') {
                await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Signaling error';
            setError(errorMessage);
            setPeerConnectionStatus('error');
        }
    }, []);

    // クリーンアップ
    useEffect(() => {
        return () => {
            stopConnection();
        };
    }, [stopConnection]);

    return {
        mediaStream,
        peerConnectionStatus,
        error,
        startConnection,
        stopConnection,
        handleSignalingMessage
    };
};
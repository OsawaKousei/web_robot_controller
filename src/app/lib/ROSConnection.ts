import * as ROSLIB from 'roslib';

export class ROSConnection {
    private ros: ROSLIB.Ros | null = null;
    private cmdVelTopic: ROSLIB.Topic | null = null;
    private isConnected = false;

    constructor() { }

    connect(url: string = 'ws://localhost:9090'): Promise<void> {
        return new Promise((resolve, reject) => {
            this.ros = new ROSLIB.Ros({
                url: url
            });

            this.ros.on('connection', () => {
                console.log('Connected to ROS bridge server.');
                this.isConnected = true;
                this.setupCmdVelTopic();
                resolve();
            });

            this.ros.on('error', (error) => {
                console.error('Error connecting to ROS bridge server:', error);
                this.isConnected = false;
                reject(error);
            });

            this.ros.on('close', () => {
                console.log('Connection to ROS bridge server closed.');
                this.isConnected = false;
            });
        });
    }

    private setupCmdVelTopic() {
        if (!this.ros) return;

        this.cmdVelTopic = new ROSLIB.Topic({
            ros: this.ros,
            name: '/cmd_vel',
            messageType: 'geometry_msgs/Twist'
        });
    }

    publishCmdVel(linear: { x: number; y: number; z: number }, angular: { x: number; y: number; z: number }) {
        if (!this.cmdVelTopic || !this.isConnected) return;

        const twist = new ROSLIB.Message({
            linear: linear,
            angular: angular
        });

        this.cmdVelTopic.publish(twist);
    }

    publishJoystickMovement(x: number, y: number, maxLinearSpeed = 1.0, maxAngularSpeed = 1.0) {
        const linear = {
            x: y * maxLinearSpeed,  // forward/backward
            y: 0.0,
            z: 0.0
        };

        const angular = {
            x: 0.0,
            y: 0.0,
            z: -x * maxAngularSpeed  // rotation (negative for intuitive control)
        };

        this.publishCmdVel(linear, angular);
    }

    disconnect() {
        if (this.ros) {
            this.ros.close();
            this.ros = null;
            this.cmdVelTopic = null;
            this.isConnected = false;
        }
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }
}

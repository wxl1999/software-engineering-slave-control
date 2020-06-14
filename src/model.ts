export enum Event {
    onStatsUpdate = 'onStatsUpdate',
    onEnviromentUpdate = "onEnviromentUpdate"
}

/**
 * @member on {boolean} 空调是否打开
 * @member needWind {boolean} 是否需要送风 
 * @member temperature {number} 空调设定温度
 * @member speed {number} 空调设定风速 1-3
 */
export interface Settings {
    on: boolean;
    needWind: boolean;
    temperature?: number;
    speed?: 0 | 1 | 2 | 3;
}


/**
 * @member mode {"code"|"warm"} 主控工作模式
 */
export interface MasterSettings {
    mode?: "cold" | "warm",
    default_temperature?: number;
    min_temperature?: number,
    max_temperature?: number,
    metric_delay?: number;
    update_delay?: number;
}

/**
 * @member cost {number} 入住以来累计价格 
 * @member energy {number} 累计消耗能量
 */
export interface Stats {
    cost?: number;
    energy?: number;
}

export interface Metric {
    mode?: "cold" | "warm",
    fan_speed?: 0 | 1 | 2 | 3;
    temperature?: number;
}


/**
 * @member room_id {string} 房间信息
 * @member id {string} 住客身份证（认证用）
 */
export interface LoginInfo {
    room_id: string;
    id: string;
}
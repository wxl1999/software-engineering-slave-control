export enum Event {
    onStatsUpdate = 'onStatsUpdate',
    onEnviromentUpdate = "onEnviromentUpdate"
}

/**
 * @member on {boolean} 空调是否打开
 * @member needWind {boolean} 是否需要送风 
 * @member temp {number} 空调设定温度
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
    min_temperature?: number,
    max_temperature?: number
}

/**
 * @member total_fee {number} 入住以来累计价格 
 * @member fee {number} 当次开机价格
 * @member total_energy {number} 累计消耗能量
 * @member metric_delay {number} 发送频率
 */
export interface Stats {
    total_fee?: number;
    // fee: number;
    total_energy?: number;
}


/**
 * @member roomId {string} 房间信息
 * @member phone {number} 住客手机号信息（认证用）
 * @member Id {string} 住客身份证（认证用）
 */
export interface LoginInfo {
    roomId: string;
    phone?: string;
    Id?: string;
}
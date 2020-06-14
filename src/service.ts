import { Stats, Settings, MasterSettings, LoginInfo, Event } from './model';
import axios from 'axios'

/**
 * @param message {string} when error, provide a hint error message
 * @param data {T} when success, provide a data
 */
export interface ServiceResponse {
    data?: object;
    message?: string;
}

/**
 * @param code {int}
 */
export interface Response {
    code: number;
}

/**
 * @param token {string}
 * @param user_id {number}
 * @param room_id {number}
 * @param default_temperature {number}
 * @param metric_delay {number}
 * @param update_delay {number}
 * @param mode {string}
 */
export interface ConnectionResponse extends Response {
    token: string;
    user_id: number;
    room_id: number;
    default_temperature: number;
    metric_delay: number;
    update_delay: number;
    mode: string;
    cool_min: number;
    cool_max: number;
    warm_min: number;
    warm_max: number;
}


class Service {
    mockStats: Stats = {
        cost: 5.5,
        energy: 11,
    }

    /**
     * Request update stats when timer expire
     * - According to doc, this should invoke in a period
     * - Success: Invoke an onStatsUpdate Global event
     * - Error: Do nothing
     */
    // getStats = async ()  : Promise< ServiceResponse > => {
    //     let stats: Stats = this.mockStats;
    //     this.mockStats.total_energy += 0.02;
    //     this.mockStats.total_fee += 0.01;

    //     eventBus.$emit(Event.onStatsUpdate, stats);

    //     return Promise.resolve({
    //         data: {
    //             stats,
    //             metric_delay: 1000
    //         }
    //     })
    // };

    getStats = async () => {
        // const res = await axios.get('/v1/statistics')
        // return res
        let stats: Stats = this.mockStats;
        this.mockStats.energy += 0.02;
        this.mockStats.cost += 0.01;
        return Promise.resolve({
            energy: stats.energy,
            cost: stats.cost
        })
    }

    sendMetric = async(metric: Metric) => {
        // const res = await axios.post('/v1/metrics', { metric })
        // return res;
        return Promise.resolve({});
    }

    /**
     * Request Server to Permit Change Settings
     * - Success: return null
     * - Error: return error message
     */
    // setSettings = async (settings: Settings) : Promise< ServiceResponse > => {
    //     if(!settings.speed) {
    //         return Promise.resolve< ServiceResponse >({
    //             message: "设置失败！"
    //         });
    //     }
    //     else {
    //         return Promise.resolve< ServiceResponse >({
    //             data: settings
    //         });
    //     }
    // };

    // setSettings = async (settings: Settings) => {
    //     const res = axios.post('', {
    //         settings
    //     })
    //     // return res
    //     if (!settings.speed) {
    //         return Promise.resolve<ServiceResponse>({
    //             message: "设置失败！"
    //         });
    //     }
    //     else {
    //         return Promise.resolve<ServiceResponse>({
    //             data: settings
    //         });
    //     }
    // }
    startControl = async (mode, speed) => {
        // const res = axios.post('/v1/state_control/start', {mode: mode, speed: speed})
        // return res;
        return Promise.resolve({});
    }
    stopControl = async() => {
        // const res = axios.post('/v1/state_control/stop', {})
        // return res;
        return Promise.resolve({});
    }


    /**
     * Request Server To Change Settings
     * - Success: return null
     * - Error: return error message
     */
    // login = async (loginInfo? : LoginInfo) : Promise< ServiceResponse > => {
    //     return Promise.resolve< ServiceResponse >({
    //     });
    // }
    login = async (loginInfo: LoginInfo): Promise<ConnectionResponse> => {
        // const res = axios.post('/v1/connect', { loginInfo })
        // return res;
        return Promise.resolve<ConnectionResponse>({
            code: 200,
            token: '123',
            user_id: 123,
            room_id: 1234,
            default_temperature: 25.0,
            metric_delay: 1000,
            update_delay: 1000,
            mode: 'cold',
            cool_min: 18,
            cool_max: 25,
            warm_min: 25,
            warm_max: 30,
        });
    }
}

const service = new Service();

// setInterval(() => {

//     service.getStats();
// }, 1000)

export default service;




// /**
//  * Request update stats when timer expire
//  * - According to doc, this should invoke in a period
//  * - Success: Invoke an onStatsUpdate Global event
//  * - Error: Do nothing
//  */
// export const updateStats = async ()  : Promise< ServiceResponse<Stats> > => {
//     let stats:Stats = {
//         total_fee: 5.5,
//         fee: 2.1
//     }

//     vue.$emit('onStatsUpdate', stats);

//     return Promise.resolve({
//         data: stats
//     })
// };


// /**
//  * Get Master Air Condition Settings
//  * - Success: Invoke an onStatsUpdate Global event
//  * - Error: Do nothing
//  * - According to doc, this should invoke in a period
//  */
// export const getMasterSettings = async (): Promise< ServiceResponse<MasterSettings> > => {
//     return Promise.resolve< ServiceResponse<MasterSettings> >({
//         data: {
//             mode: "cold",
//             min_temperature: 16,
//             max_temperature: 26
//         }
//     });
// }

// /**
//  * Request Server To Change Settings
//  * - Success: return null
//  * - Error: return error message
//  */
// export const requestSettings = async (settings: Settings) : Promise< ServiceResponse<Settings> > => {
//     return Promise.resolve< ServiceResponse<Settings> >({
//         data: settings
//     });
// };


// /**
//  * Request Server To Change Settings
//  * - Success: return null
//  * - Error: return error message
//  */
// export const login = async (loginInfo? : LoginInfo) : Promise< ServiceResponse<LoginInfo> > => {
//     return Promise.resolve< ServiceResponse<LoginInfo> >({
//     });
// }

// setTimeout(() => {
//     updateStats();
// }, 1000)
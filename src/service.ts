import { Stats, Settings, MasterSettings, LoginInfo, Event  } from './model';
import eventBus from './main';
import axios from 'axios'
axios.defaults.baseURL = 'https://httpbin.org/'

/**
 * @param message {string} when error, provide a hint error message
 * @param data {T} when success, provide a data
 */
export interface ServiceResponse {
    data?: object;
    message? : string;
}


class Service {
    mockStats = {
        total_fee: 5.5,
        total_energy: 11,
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
        const res = await axios.get('')
        // return res
        let stats: Stats = this.mockStats;
        this.mockStats.total_energy += 0.02;
        this.mockStats.total_fee += 0.01;
        return Promise.resolve({
            data: {
                stats,
                metric_delay: 1000
            }
        })
    }

    /**
     * Get Master Air Condition Settings
     * - Success: Invoke an onStatsUpdate Global event
     * - Error: Do nothing
     * - According to doc, this should invoke in a period
     */
    // getMasterSettings = async (): Promise< ServiceResponse<MasterSettings> > => {
    //     return Promise.resolve< ServiceResponse<MasterSettings> >({
    //         data: {
    //             mode: "cold",
    //             min_temperature: 16,
    //             max_temperature: 26
    //         }
    //     });
    // }
    getMasterSettings = async () => {
        const res = await axios.get('get')
        // return res
        return Promise.resolve({
            data: {
                masterSettings: {
                    mode: "cold",
                    min_temperature: 18,
                    max_temperature: 25
                },
                settings: {
                    on: true,
                    needWind: true,
                    temperature: 25,
                    speed: 2
                }
            }
        })
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

    setSettings = async (settings: Settings) => {
        const res = axios.post('', {
            settings
        })        
        // return res
        if(!settings.speed) {
            return Promise.resolve< ServiceResponse >({
                message: "设置失败！"
            });
        }
        else {
            return Promise.resolve< ServiceResponse >({
                data: settings
            });
        }
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
    login = async (loginInfo?: LoginInfo) => {
        const res = axios.post('', {
            loginInfo
        })
        // return res;
        return Promise.resolve< ServiceResponse >({
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
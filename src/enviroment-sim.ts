import { Settings, Event  } from './model';
import eventBus from './main';


class EnviromentSim {
    defaultTemperature : number = 26;
    enviromentTemperature : number = this.defaultTemperature;
    settings : Settings | null = null;

    setSettings = (settings: Settings) => {
        this.settings = settings
    }

    simulateEnviroment = (ms:number) => {
        let scale;
        if(this.settings && this.settings.on && this.settings.needWind && this.settings.speed != 0) {
            let direction = 0;
            if(this.settings.temperature > this.enviromentTemperature) {
                direction = 1;
            }
            else if(this.settings.temperature < this.enviromentTemperature) {
                direction = -1;
            }
            
            if (this.settings.speed == 1) {
                scale = 25;
            }
            else if (this.settings.speed == 2) {
                scale = 20;
            }
            else if (this.settings.speed == 3) {
                scale = 15;
            }
            else {
                console.log('speed is zero');
                return;
            };
            
            this.enviromentTemperature += direction * ms / 1000 / scale;
        }
        else {
            scale = 10;
            let direction = 0;
            if(this.defaultTemperature > this.enviromentTemperature) {
                direction = 1;
            }
            else if(this.defaultTemperature < this.enviromentTemperature) {
                direction = -1;
            }
            
            this.enviromentTemperature += direction * ms / 1000 / scale;
        }

        eventBus.$emit(Event.onEnviromentUpdate, this.enviromentTemperature);
    }

    getEnviromentTemperature = () : number => {
        return this.enviromentTemperature;
    }
}




const enviromentSim = new EnviromentSim();
setInterval(() => {
    enviromentSim.simulateEnviroment(1000);
}, 1000)
export default enviromentSim;



// let enviromentTemperature : number = 16;
// let settings : Settings | null = null;

// export const setSettings = (new_settings: Settings) => {
//     settings = new_settings;
// }

// const simulateEnviroment = (ms:number) => {
//     if(settings) {
//         let direction = 0;
//         if(settings.temperature > enviromentTemperature) {
//             direction = 1;
//         }
//         if(settings.temperature < enviromentTemperature) {
//             direction = -1;
//         }

//         enviromentTemperature = direction * ms * settings.speed / scale;
//     }

//     vue.$emit("enviroment-update", enviromentTemperature);
// }

// export const getEnviromentTemperature = () : number => {
//     return enviromentTemperature;
// }


<template>
  <div>
    <!-- header -->
    <el-container>
      <el-header class="toolbar">
        <h1 class="toolbar-title">分布式温控系统</h1>
        <div class="toolbar-buttons">
          <el-button icon="el-icon-setting" type="warning" @click="bindDialogVisible = true">服务绑定</el-button>
          <el-button icon="el-icon-cloudy" type="primary" @click="openAuthDialog">连接认证</el-button>
          <el-button v-show="exitVisible" icon="el-icon-s-promotion" type="info" @click="exit">退出</el-button>
        </div>
      </el-header>
    </el-container>
    <!-- bind -->
    <el-dialog title="服务绑定" :visible.sync="bindDialogVisible" width="30%">
      <el-form :model="bindForm" :rules="bindFormRules" ref="bindForm">
        <el-form-item label="序列号" label-width="100px" prop="number">
          <el-input v-model="bindForm.number" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="bindDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitBindForm('bindForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- auth -->
    <el-dialog title="连接认证" :visible.sync="authDialogVisible" width="30%">
      <el-form :model="authForm" :rules="authFormRules" ref="authForm">
        <el-form-item label="房间号" label-width="100px" prop="room_id">
          <el-input v-model="authForm.room_id" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="身份证号" label-width="100px" prop="id">
          <el-input v-model="authForm.id" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="authDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAuthForm('authForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- panel -->
    <div class="panel">
      <!-- slave -->
      <el-divider content-position="left">从控信息与设置</el-divider>
      <el-row class="switch">
        <el-col :span="12">
          <div class="status-card-item">
            <el-switch
              type="primary"
              v-model="pendingSettings.on"
              active-text="启用空调"
              inactive-text="关闭空调"
              @change="switchAirCond"
            ></el-switch>
          </div>
        </el-col>

        <el-col :span="12">
          <div class="status-card-item">
            <el-tag v-show="room_id" type="danger">房间号：{{ room_id }}</el-tag>
          </div>
        </el-col>
      </el-row>

      <div v-loading="this.loading" :element-loading-text="loadingText">
        <el-row v-show="pendingSettings.on">
          <el-col :span="12">
            <el-card class="status-card">
              <div slot="header" class="clearfix">
                <span>温度信息</span>
                <el-tag class="defaultTemp" type="warning">室外温度：{{defaultTemperature.toFixed(2)}}</el-tag>
              </div>

              <div class="status-card-item">
                <span v-show="settings.temperature" type="primary">{{ settings.temperature }}</span>
                <el-tag type="primary">当前设定温度</el-tag>
              </div>

              <div class="status-card-item">
                <span
                  type="success"
                >{{ enviromentTemperature ? enviromentTemperature.toFixed(2) : '' }}</span>
                <el-tag type="success">室内温度</el-tag>
              </div>

              <div class="splitter"></div>

              <div class="status-card-item">
                <el-slider
                  v-model="pendingSettings.temperature"
                  :step="1"
                  :min="this.masterSettings.min_temperature"
                  :max="this.masterSettings.max_temperature"
                  :disabled="!isAdjustable"
                  @change="handleSettingsChange('temperature')"
                ></el-slider>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="status-card">
              <div slot="header" class="clearfix">
                <span>风速信息</span>
              </div>

              <div class="status-card-item">
                <span type="success">{{ marks[settings.speed] }}</span>
                <el-tag type="success">当前风速</el-tag>
              </div>

              <div class="splitter"></div>

              <div class="status-card-item">
                <el-slider
                  v-model="pendingSettings.speed"
                  :marks="marks"
                  :step="1"
                  :min="0"
                  :max="3"
                  show-stops
                  :disabled="!isAdjustable"
                  :show-tooltip="false"
                  @change="handleSettingsChange('speed')"
                ></el-slider>
              </div>

              <div class="splitter"></div>
            </el-card>
          </el-col>
        </el-row>
        <!-- master -->
        <el-row v-show="pendingSettings.on">
          <el-col :span="24">
            <el-divider content-position="left">主控状态</el-divider>

            <div class="status-card-item">
              <span
                v-show="masterSettings.mode"
                type="primary"
              >{{ masterSettings.mode == "cold" ? "制冷" : "制热" }}</span>
              <el-tag type="primary">当前模式</el-tag>
            </div>
            <div class="status-card-item">
              <span
                v-show="masterSettings.min_temperature"
                type="success"
              >{{ masterSettings.min_temperature }} ~ {{ masterSettings.max_temperature }}</span>
              <el-tag type="success">温度范围</el-tag>
            </div>
          </el-col>
        </el-row>
        <!-- fee -->
        <el-row v-show="pendingSettings.on">
          <el-col :span="24">
            <el-divider content-position="left">计费信息</el-divider>
            <div class="status-card-item">
              <span type="primary">{{ stats.cost ? stats.cost.toFixed(2) + ' 元' : ''}}</span>
              <el-tag type="primary">累计费用</el-tag>
            </div>

            <div class="status-card-item">
              <span type="warning">{{ stats.energy ? stats.energy.toFixed(2) + ' 千瓦时' : ''}}</span>
              <el-tag type="warning">累计消耗能量</el-tag>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Settings, Stats, MasterSettings, Event, Metric } from "../model";
import eventBus from "../main";
import enviromentSim from "../enviroment-sim";
import service from "../service";

@Component
export default class ControlPanel extends Vue {
  lastSpeed = -1;
  hasChangeSettings = false;
  async mounted() {
    eventBus.$on(Event.onStatsUpdate, (stats: Stats) => {
      // console.log("[On]", Event.onStatsUpdate, stats);
      Object.assign(this.$data.stats, stats);
    });

    eventBus.$on(
      Event.onEnviromentUpdate,
      async (enviromentTemperature: number) => {
        // console.log("[On]", Event.onEnviromentUpdate, enviromentTemperature);
        this.$data.enviromentTemperature = enviromentTemperature;
        // stop wind after reach target temperature
        if (this.$data.settings.on == false) return;
        if (
          this.$data.settings.needWind == true &&
          Math.abs(
            this.$data.enviromentTemperature - this.$data.settings.temperature
          ) < 0.1
        ) {
          this.lastSpeed = this.$data.pendingSettings.speed;
          this.$data.pendingSettings.needWind = false;
          this.$data.pendingSettings.speed = 0;
          const res = await service.stopControl();
          const test = true;
          if (test) {
            Object.assign(this.$data.settings, this.$data.pendingSettings);
            enviromentSim.setSettings(this.$data.pendingSettings);
            if (this.hasChangeSettings) this.$data.isAdjustable = false;
          } else {
            this.$message.error("停止送风失败");
          }
        } else if (
          // restart wind
          this.$data.settings.needWind == false &&
          Math.abs(
            this.$data.enviromentTemperature - this.$data.settings.temperature
          ) > 1
        ) {
          this.$data.pendingSettings.needWind = true;
          this.$data.pendingSettings.speed = this.lastSpeed;
          const res = await service.startControl(
            this.$data.masterSettings.mode,
            this.$data.settings.speed
          );
          const test = true;
          if (test) {
            Object.assign(this.$data.settings, this.$data.pendingSettings);
            enviromentSim.setSettings(this.$data.pendingSettings);
            this.$data.isAdjustable = true;
          } else {
            this.$message.error("请求送风失败");
          }
        }
      }
    );

    this.$on("test", () => {
      console.log("test event!");
    });
    this.$emit("test");

    eventBus.$emit(Event.onStatsUpdate);
  }

  lastSettingsUpdate = -1;
  async handleSettingsChange(type: string) {
    const currentSettingsChange = Date.now();
    // only one request per sec
    setTimeout(async () => {
      if (currentSettingsChange > this.lastSettingsUpdate) {
        this.lastSettingsUpdate = Date.now();
        if (type === "speed") {
          let test = false;
          if (this.$data.pendingSettings.speed == 0) {
            this.$data.pendingSettings.needWind = false;
            const res = await service.stopControl();
            test = true;
          } else {
            this.$data.pendingSettings.needWind = true;
            const res = await service.startControl(
              this.$data.masterSettings.mode,
              this.$data.settings.speed
            );
            test = true;
          }
          if (test) {
            this.lastSpeed = this.$data.pendingSettings.speed;
            Object.assign(this.$data.settings, this.$data.pendingSettings);
            enviromentSim.setSettings(this.$data.pendingSettings);
            this.hasChangeSettings = true;
          } else {
            this.$message.error("风速调节失败");
          }
        } else {
          Object.assign(this.$data.settings, this.$data.pendingSettings);
          enviromentSim.setSettings(this.$data.pendingSettings);
          this.hasChangeSettings = true;
        }
      }
    }, 1000);
  }

  async switchAirCond(state: boolean) {
    if (state == true) {
      if (this.$data.room_id) {
        this.$data.loading = true;
        this.startSlave();
        this.$message.success("空调成功打开");
      } else {
        this.$message.success("空调已打开，请进行连接认证");
      }
    } else {
      this.$data.pendingSettings.on = false;
      this.$data.pendingSettings.needWind = false;
      const data = this.initData();
      this.$data.isAdjustable = data.isAdjustable;
      this.$data.stats = data.stats;
      this.$data.settings = data.settings;
      this.$data.pendingSettings = data.pendingSettings;
      this.$data.masterSettings = data.masterSettings;
      this.lastSpeed = 0;

      enviromentSim.setSettings(this.$data.settings);
      clearInterval(this.statTimer);
      clearInterval(this.updateTimer);
    }
  }

  submitBindForm(formRef: string) {
    this.$refs[formRef].validate(async valid => {
      if (valid) {
        window.localStorage.setItem("app_key", this.$data.bindForm.number);
        this.$data.bindDialogVisible = false;
        this.$message.success("成功输入序列号");
      } else {
        this.$message.error("输入序列号有误，请重新输入");
      }
    });
  }

  openAuthDialog() {
    if (
      this.$data.pendingSettings.on == true &&
      this.$data.settings.on == false
    ) {
      this.$data.authDialogVisible = true;
    } else if (this.$data.settings.on == true) {
      this.$message.success("认证已完成，空调正在运行");
    } else {
      this.$message.error("请先打开空调");
    }
  }

  async submitAuthForm(formRef: string) {
    this.$refs[formRef].validate(async valid => {
      if (valid) {
        this.$data.authDialogVisible = false;
        this.$data.loading = true;
        /**login and get default settings */
        const res = await service.login(this.$data.authForm);
        const test = true;
        if (test) {
          // masterSettings
          this.$data.masterSettings.mode = res.mode;
          this.$data.masterSettings.default_temperature =
            res.default_temperature;
          if (res.mode === "cold") {
            this.$data.masterSettings.min_temperature = res.cool_min;
            this.$data.masterSettings.max_temperature = res.cool_max;
          } else {
            this.$data.masterSettings.min_temperature = res.heat_min;
            this.$data.masterSettings.max_temperature = res.heat_max;
          }
          this.$data.masterSettings.metric_delay = res.metric_delay;
          this.$data.masterSettings.update_delay = res.update_delay;

          this.$data.exitVisible = true;
          this.$data.room_id = this.$data.authForm.room_id;
          this.startSlave();
        } else {
          this.$data.loading = false;
          this.$message.error("输入信息有误，认证失败，请重新输入");
        }
      } else {
        this.$message.error("输入信息格式有误，请重新输入");
      }
    });
  }

  exit() {
    if (this.$data.settings.on == true) {
      this.$message.error("请先关闭空调");
    } else {
      this.$data.authForm.room_id = "";
      this.$data.authForm.id = "";
      this.$data.room_id = undefined;
      this.$data.exitVisible = false;
    }
  }

  statTimer = 0;
  updateTimer = 0;
  startSlave() {
    // settings
    this.$data.settings.on = true;
    this.$data.settings.needWind = false;
    this.$data.settings.temperature = this.$data.masterSettings.default_temperature;
    this.$data.settings.speed = 0;
    Object.assign(this.$data.pendingSettings, this.$data.settings);

    enviromentSim.setSettings(this.$data.settings);
    // get stats from master per metric_delay
    this.statTimer = setInterval(async () => {
      if (this.$data.settings.on) {
        const res = await service.getStats();
        this.$data.stats.energy = res.energy;
        this.$data.stats.cost = res.cost;
        this.$data.masterSettings.metric_delay = res.metric_delay;
      }
    }, this.$data.masterSettings.metric_delay);
    // update mode, speed and temp tp master per update_delay
    this.updateTimer = setInterval(async () => {
      if (this.$data.settings.on) {
        const metric: Metric = {
          mode: this.$data.masterSettings.mode,
          fan_speed: this.$data.settings.speed,
          temperature: this.$data.settings.temperature
        };
        const res = await service.sendMetric(metric);
      }
    }, this.$data.masterSettings.update_delay);

    this.$data.isAdjustable = true;
    this.$data.loading = false;
    this.hasChangeSettings = false;
  }

  checkId = (rule, value, callback) => {
    if (value === "") {
      callback(new Error("请输入身份证号"));
    } else {
      const regId = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
      if (!regId.test(value)) {
        callback(new Error("请输入有效的身份证号"));
      } else callback();
    }
  };

  initData() {
    const marks: object = {
      0: "无",
      1: "低",
      2: "中",
      3: "高"
    };
    const settings: Settings = {
      on: false,
      needWind: false,
      temperature: undefined,
      speed: undefined
    };
    const pendingSettings = {};
    Object.assign(pendingSettings, settings);
    const masterSettings: MasterSettings = {
      mode: undefined,
      default_temperature: undefined,
      min_temperature: undefined,
      max_temperature: undefined,
      metric_delay: undefined,
      update_delay: undefined
    };
    const stats: Stats = {
      cost: undefined,
      energy: undefined
    };
    const bindForm: object = {
      number: null
    };
    const bindFormRules: object = {
      number: [{ required: true, message: "请输入序列号", trigger: "blur" }]
    };
    const authForm: object = {
      room_id: null,
      id: null
    };
    const authFormRules: object = {
      room_id: [{ required: true, message: "请输入房间号", trigger: "blur" }],
      id: [
        { required: true, message: "请输入身份证号", trigger: "blur" },
        {
          pattern: /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/,
          message: "身份证号码格式有误",
          trigger: "blur"
        }
      ]
    };
    const data = {
      // loading
      loading: false,
      loadingText: "拼命加载中",
      // bindDialog
      bindDialogVisible: false,
      bindForm: bindForm,
      bindFormRules: bindFormRules,
      // authDialog
      authDialogVisible: false,
      authForm: authForm,
      authFormRules: authFormRules,
      // settings
      masterSettings: masterSettings,
      settings: settings,
      pendingSettings: pendingSettings,

      marks: marks,
      room_id: undefined,
      enviromentTemperature: undefined,
      defaultTemperature: enviromentSim.defaultTemperature,
      stats: stats,

      exitVisible: false,
      isAdjustable: false
    };
    return data;
  }

  data() {
    const res: {
      loading: boolean;
      loadingText: string;
      marks: object;
      exitVisible: boolean;
      bindDialogVisible: boolean;
      bindForm: object;
      bindFormRules: object;
      authDialogVisible: boolean;
      authForm: object;
      authFormRules: object;
      room_id: string;
      isAdjustable: boolean;
      settings: Settings;
      enviromentTemperature?: number;
      default_temperature: number;
      pendingSettings: Settings;
      stats: Stats;
      masterSettings: MasterSettings;
    } = this.initData();
    return res;
  }
}
</script>

<style>
.toolbar-title {
  color: white;
  line-height: 60px;
  display: inline;
}

.toolbar {
  background-color: #444444;
  width: auto;
}

.toolbar-buttons {
  width: 40vw;
  height: 100%;
  float: right;
  display: flex;
  justify-content: flex-end;
}

.toolbar-buttons > .el-button {
  height: 40px;
  align-self: center;
}

.defaultTemp {
  margin: -5px 10px;
}

.switch {
  margin: 0px 0px 15px;
}

.splitter {
  height: 10px;
}

.status-card {
  /*  min-height: 50vh; */
}

.el-card__body {
  height: 100%;
  /* min-height: 100% !important; */
}

.status-card-item {
  /* overflow: hidden; */
  padding: 5px 10px;
  height: 30px;
  line-height: 30px;
}

.panel {
  width: 60vw;
  min-width: 95vmin;
  margin: auto;
  padding: 0 20px;
}

.el-col {
  padding: 0px 10px;
}
.el-tag {
  float: right;
}

.el-slider {
  float: bottom;
}
</style>

<template>
  <div>
    <!-- header -->
    <el-container>
      <el-header class="toolbar">
        <h1 class="toolbar-title">正在控制 507 房间</h1>
        <div class="toolbar-buttons">
          <el-button icon="el-icon-cloudy" type="primary">远程控制</el-button>
          <el-button icon="el-icon-setting" type="info" @click="authFormVisible = true">连接认证</el-button>
        </div>
      </el-header>
    </el-container>
    <!-- auth -->
    <el-dialog title="连接认证" :visible.sync="authFormVisible">
      <el-form :model="authForm">
        <el-form-item label="房间号" :label-width="formLabelWidth">
          <el-input v-model="authForm.roomId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="活动区域" :label-width="formLabelWidth">
          <el-input v-model="authForm.Id" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="authFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="auth">确 定</el-button>
      </div>
    </el-dialog>
    <!-- panel -->
    <div class="panel">
      <!-- slave -->
      <el-divider content-position="left">从控信息与设置</el-divider>
      <el-row>
        <el-col :span="12">
          <div style="margin-bottom:20px">
            <el-switch
              type="primary"
              v-model="pendingSettings.on"
              active-text="启用空调"
              inactive-text="关闭空调"
              @change="switchAirCond"
            ></el-switch>
          </div>
        </el-col>
      </el-row>

      <div v-loading="this.loading" :element-loading-text="loadingText">
        <el-row v-show="pendingSettings.on">
          <el-col :span="12">
            <el-card class="status-card">
              <div slot="header" class="clearfix">
                <span>温度信息</span>
              </div>

              <div class="status-card-item">
                <span v-show="settings.temperature" type="primary">{{ settings.temperature }}</span>
                <el-tag type="primary">当前设定温度</el-tag>
              </div>

              <div class="status-card-item">
                <span
                  type="success"
                >{{ enviromentTemperature ? enviromentTemperature.toFixed(2) : '' }}</span>
                <el-tag type="success">环境温度</el-tag>
              </div>

              <div class="splitter"></div>
              <!-- <div class="splitter"></div> -->
              <!-- <div class="splitter"></div> -->

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

            <!-- <div class="status-card-item">
          <span type="success">{{ this.stats.fee.toFixed(2) }} 元</span>
          <el-tag type="success">当前费用</el-tag>
            </div>-->

            <div class="status-card-item">
              <span type="primary">{{ stats.total_fee ? stats.total_fee.toFixed(2) + ' 元' : ''}}</span>
              <el-tag type="primary">累计费用</el-tag>
            </div>

            <div class="status-card-item">
              <span
                type="warning"
              >{{ stats.total_energy ? stats.total_energy.toFixed(2) + ' 千瓦时' : ''}}</span>
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
import { Settings, Stats, MasterSettings, Event } from "../model";
import eventBus from "../main";
import enviromentSim from "../enviroment-sim";
import service from "../service";

@Component
export default class ControlPanel extends Vue {
  lastSpeed = 0; // default speed
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
        /**stop wind after reach target temperature */
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
          const res = await service.setSettings(this.$data.pendingSettings);
          Object.assign(this.$data.settings, this.$data.pendingSettings);
          enviromentSim.setSettings(this.$data.pendingSettings);
          this.$data.isAdjustable = false;
        } else if (
          /**restart wind */
          this.$data.settings.needWind == false &&
          Math.abs(
            this.$data.enviromentTemperature - this.$data.settings.temperature
          ) > 1
        ) {
          this.$data.pendingSettings.needWind = true;
          this.$data.pendingSettings.speed = this.lastSpeed;
          const res = await service.setSettings(this.$data.pendingSettings);
          Object.assign(this.$data.settings, this.$data.pendingSettings)
          enviromentSim.setSettings(this.$data.pendingSettings);
          this.$data.isAdjustable = true;
        }
      }
    );

    this.$on("test", () => {
      console.log("test event!");
    });
    this.$emit("test");

    eventBus.$emit(Event.onStatsUpdate);
  }

  showError(message: string) {
    console.error(message);
  }

  lastSettingsUpdate = -1;
  async handleSettingsChange(type: string) {
    const currentSettingsChange = Date.now();

    /** only one request per sec */
    setTimeout(async () => {
      if (currentSettingsChange > this.lastSettingsUpdate) {
        this.lastSettingsUpdate = Date.now();

        if (type === "speed") {
          if (this.$data.pendingSettings.speed == 0)
            this.$data.pendingSettings.needWind = false;
          else this.$data.pendingSettings.needWind = true;
        }

        const res = await service.setSettings(this.$data.pendingSettings);
        Object.assign(this.$data.settings, this.$data.pendingSettings);
        enviromentSim.setSettings(this.$data.pendingSettings);
        if (type === "speed") this.lastSpeed = this.$data.pendingSettings.speed;
      }
    }, 1000);
  }

  async switchAirCond(state: boolean) {
    if (state == true) {
      return;
    } else {
      this.$data.pendingSettings.on = false;
      this.$data.pendingSettings.needWind = false;
      const res = await service.setSettings(this.$data.pendingSettings);

      const data = this.init();
      this.$data.loading = data.loading;
      this.$data.loadingText = data.loadingText;
      this.$data.marks = data.marks;
      this.$data.authForm = data.authForm;
      this.$data.authFormVisible = data.authFormVisible;
      this.$data.isAdjustable = data.isAdjustable;
      this.$data.metric_delay = data.metric_delay;
      this.$data.enviromentTemperature = data.enviromentTemperature;
      this.$data.settings = data.settings;
      this.$data.pendingSettings = data.pendingSettings;
      this.$data.stats = data.stats;
      this.$data.masterSettings = data.masterSettings;
      this.lastSpeed = 0;

      enviromentSim.setSettings(this.$data.settings);
    }
  }

  async auth() {
    const res = await service.login(this.$data.authForm);
    const test = true;
    if (test) {
      this.$data.authFormVisible = false;
      this.$data.loading = true;
      /**get master settings */
      const res = await service.getMasterSettings();
      Object.assign(this.$data.masterSettings, res.data.masterSettings);
      Object.assign(this.$data.pendingSettings, res.data.settings);
      Object.assign(this.$data.settings, res.data.settings);

      enviromentSim.setSettings(this.$data.settings);
      /**get stats from master per metric_delay */
      setInterval(async () => {
        if (this.$data.settings.on) {
          const res = await service.getStats();
          Object.assign(this.$data.stats, res.data.stats);
          this.$data.metric_delay = res.data.metric_delay;
        }
      }, this.$data.metric_delay);
      this.$data.loading = false;
      this.$data.isAdjustable = true;
    }
    else {
      this.$message.error("输入信息有误，认证失败");
    }
  }

  init() {
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
      min_temperature: undefined,
      max_temperature: undefined
    };
    const stats: Stats = {
      total_fee: undefined,
      total_energy: undefined
    };
    const authForm: object = {
      roomId: '',
      Id: ''
    };
    const data = {
      loading: false,
      loadingText: "拼命加载中",
      marks: marks,
      authFormVisible: false,
      formLabelWidth: '120px',
      authForm: authForm,
      isAdjustable: false,
      metric_delay: 1000,
      enviromentTemperature: undefined,
      settings: settings,
      pendingSettings: pendingSettings,
      stats: stats,
      masterSettings: masterSettings
    };
    return data;
  }

  data() {
    const res: {
      loading: boolean;
      loadingText: string;
      marks: object;
      authFormVisible: boolean;
      formLabelWidth: string;
      authForm: Object;
      isAdjustable: boolean;
      metric_delay: number;
      settings: Settings;
      enviromentTemperature?: number;
      pendingSettings: Settings;
      stats: Stats;
      masterSettings: MasterSettings;
    } = this.init();
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

<template>
  <div id="app">
    <ControlPanel></ControlPanel>
  </div>
</template>

<script>
import ControlPanel from "./components/ControlPanel.vue";

export default {
  name: "app",
  components: {
    ControlPanel
  }
};
</script>

<style>
body {
  margin: 0;
}

#app {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>

<template>
  <div class="app_index__footer">

  </div>
</template>

<script>
export default {
  data() {
    return {
      thisYear: (new Date()).getFullYear(),
    };
  },
};
</script>

<style>
.app_index__footer {
  height: 48px;
  background: #F0F2F5;
  color: #A2A9B8;
  font-size: 12px;
  line-height: 48px;
  text-align: center;
}
</style>

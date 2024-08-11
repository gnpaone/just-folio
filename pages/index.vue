<template>
  <div class="index">
    <v-logo ref="logo"></v-logo>
    <div class="u-container">
      <div class="u-d-f">
        <v-portrait ref="portrait"></v-portrait>
        <div>
          <v-about ref="about"></v-about>
          <v-credits ref="credits"></v-credits>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import vLogo from "~/components/index/logo.vue";
import vPortrait from "~/components/index/portrait.vue";
import vAbout from "~/components/index/about.vue";
import vCredits from "~/components/index/credits.vue";
export default {
  components: {
    vLogo,
    vCredits,
    vAbout,
    vPortrait
  },
  methods: {
    tick(scrollTop) {
      this.$refs.portrait.tick(scrollTop);
      this.$refs.about.tick(scrollTop);
      this.$refs.credits.tick(scrollTop);
    },
    resize(w, h, ph) {
      this.$refs.portrait.resize(w, h, ph);
      this.$refs.about.resize(w, h, ph);
      this.$refs.credits.resize(w, h, ph);
      this.$refs.logo.resize(w, h);
    }
  },
  mounted() {}
};
</script>

<style lang="stylus" scoped>
.index
  background $black
  width 100%
  min-height 100vh
  padding-bottom 20vh


.about
  margin-bottom 20vh
</style>

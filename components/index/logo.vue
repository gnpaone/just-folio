<template>
  <div
    class="logo"
    @mouseover="onMouseEnterWrapper"
    @mouseout="onMouseLeaveWrapper"
    @click="onMouseClickWrapper"
  >
    <div class="listContainer">
      <ul ref="listRoot" class="listRoot">
        <li ref="listItem" v-for="(ind, i) in index" :key="`index-${i}`" class="listItem">
          <img :src="`${path}${ind.img}`" :alt="ind.text2.replace('<br>', '')" />
          <p>
            <span class="first" v-html="ind.text1"></span>
            <span class="second" v-html="ind.text2"></span>
          </p>
        </li>
      </ul>
    </div>
    <div
      ref="threejsContainer"
      class="listCanva"
    ></div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import IndexSprite from "~/assets/js/three/index/IndexSprite";
import Emitter from "~/assets/js/events/EventsEmitter";
import ScrollHelper from "~/assets/js/utils/ScrollHelper";

export default {
  data() {
    return {
      w: 0
    };
  },
  computed: {
    ...mapState(["index", "path"])
  },
  methods: {
    setThreeJS() {
      this.indexSprite = new IndexSprite(
        this.$refs.threejsContainer,
        this.isPhone,
        this.isDevice,
        '.listRoot',
        '.listItem'
      );
      this.indexSprite.animate();
    },
    onMouseEnterWrapper(event) {
      if (!this.isEventInsideListContainer(event)) {
        this.onMouseEnter();
      }
    },
    onMouseLeaveWrapper(event) {
      if (!this.isEventInsideListContainer(event)) {
        this.onMouseLeave();
      }
    },
    onMouseClickWrapper(event) {
      if (!this.isEventInsideListContainer(event)) {
        this.onMouseClick();
      }
    },
    isEventInsideListContainer(event) {
      const listContainer = this.$refs.listRoot;
      return listContainer && listContainer.contains(event.target);
    },
    onMouseEnter() {
      Emitter.emit("LOGO:OVER");
    },
    onMouseLeave() {
      Emitter.emit("LOGO:OUT");
    },
    onMouseClick() {
      ScrollHelper.scrollTo(window.innerHeight - 120);
    },
    resize(w, h) {
      this.w = w;
    }
  },
  mounted() {
    this.setThreeJS();
  }
};
</script>
<style lang="stylus" scoped>
.logo
  width 100%
  height 100vh
  position relative
  display flex
  align-items center
  justify-content center
  background #000000

div
  position relative
  top 0
  left 0
  width 100%
  height 100%
  z-index 2
  pointer-events none
  &.events
    pointer-events auto

.listCanva
  height 100vh
  width 100vw
  position fixed
  inset 0px
  z-index -10
  pointer-events auto

.listContainer
  position relative
  display inline
  top 7vh
  z-index 2
  pointer-events none
  scroll-behavior smooth
  transition all 1.8s cubic-bezier(0.76, 0.16, 0.24, 0.86)

.listRoot
  display flex
  max-width 40rem
  margin 0 auto
  z-index 4
  list-style-type none
  justify-content center
  pointer-events auto

  p
    font-size 2.5rem
    line-height 8rem
    font-weight normal
    letter-spacing calc((100vh - 300px) / 20);
    max-width 50rem
    margin 0 auto
    writing-mode vertical-rl

    .first
      font-family $yrdzst

    .second
      font-family $fujimaru

.listItem
  width 30%
  align-self flex-start
  display inline-block

  img
    display none
</style>

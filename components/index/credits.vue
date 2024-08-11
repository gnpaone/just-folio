<template>
  <article class="credits">
    <h3 class="title">Kiran MK.</h3>
    <p>Copyright &copy; 2024. <br />All rights reserved.</p>
    <p>This website is developed with VueJs <br />with NuxtJs.</p>
    <p>
      ThreeJS & WebGL rendered PixiJS animations <br />overlayed with animeJS.
    </p>
    <p>
      Made with 💖 in
      <span>
        <img
          class="inline-image"
          title="India"
          loading="lazy"
          src="~/assets/img/india.png"
          alt="india"/></span
      >.
    </p>
  </article>
</template>
<script>
import { mapState } from "vuex";
import Emitter from "~/assets/js/events/EventsEmitter";
import offsetMixins from "./../offsetMixins.vue";
import anime from "animejs";
export default {
  computed: {
    ...mapState(["contact"])
  },
  mixins: [offsetMixins],
  methods: {
    show() {
      anime({
        targets: this.anime_array,
        translateY: 0,
        scaleY: 1,
        duration: 500,
        opacity: 1,
        easing: "easeOutQuad",
        delay: anime.stagger(100)
      });
    }
  },
  mounted() {
    this.anime_array = [
      this.$el.querySelector("h3"),
      ...[].slice.call(this.$el.querySelectorAll("p"))
    ];
    anime.set(this.anime_array, {
      translateY: 100,
      opacity: 0
    });
  }
};
</script>

<style lang="stylus" scoped>
p:last-child
  margin-bottom 0

a
  display inline-block
  border-bottom 1px solid #fff
  line-height 1

.inline-image {
  width 25px;
  display: inline;
  vertical-align: middle;
}
.device &
  br
    display none
</style>

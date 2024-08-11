<template>
  <section class="projects u-container">
    <ul>
      <li v-for="(project, i) in projects" :key="`project-${i}`">
        <nuxt-link
          :to="{ name: 'project-slug', params: { slug: project.slug } }"
          v-html="project.title"
          class="vLarge"
        ></nuxt-link>
      </li>
    </ul>
  </section>
</template>

<script>
import Emitter from "~/assets/js/events/EventsEmitter";
import { mapState, mapGetters } from "vuex";
export default {
  components: {},
  computed: {
    ...mapState(["projects"]),
    ...mapGetters(["isDevice"])
  },
  methods: {
    resize(w, h) {
      if (w && h) {
        this.w = w;
        this.h = h;
      }
    },
    tick(scrollTop, mouseEaseX, mouseEaseY, mouseEaseSlowX, mouseEaseSlowY) {}
  },
  mounted() {
    if (!this.isDevice)
      this.$el.querySelector("ul").style.visibility = "hidden";
  }
};
</script>

<style lang="stylus" scoped>
.projects
  position relative
  background $black
  ul
    padding 100px 0px
    width 100%
    li
      display block
      .vLarge
        font-size 40px
        line-height 1
    li+li
      margin-top 30px
</style>
<style lang="stylus">
.no-touch section.projects
  height 1000vh
</style>

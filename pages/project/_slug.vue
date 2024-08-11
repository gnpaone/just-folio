<template>
  <section
    class="project"
    :class="{ ready: isReady }"
    :style="{ 'background-color': project.color }"
    v-if="project"
  >
    <v-cover
      :img="`${project.cover}`"
      :path="`${path}${project.slug}/`"
      :imgPath="imgPath"
      :title="project.title"
      ref="cover"
    ></v-cover>
    <v-desc
      :year="project.year"
      :keywords="project.keywords"
      :desc="project.desc"
      ref="desc"
    ></v-desc>
    <component
      v-for="(item, i) in project.content"
      :key="`item-${i}`"
      ref="media"
      :is="item.type"
      :item="item"
      :path="`${path}${project.slug}/`"
      :imgPath="imgPath"
      :videoPath="videoPath"
      :alt="project.title"
    ></component>
    <v-credits :credits="project.credits" ref="credits"></v-credits>
    <v-next :project="nextProject" ref="next"></v-next>
  </section>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import vCover from "~/components/project/cover.vue";
import vDesc from "~/components/project/desc.vue";
import vImage from "~/components/project/image.vue";
import vImageFull from "~/components/project/imageFull.vue";
import vColumn from "~/components/project/column.vue";
import vVideo from "~/components/project/video.vue";
import vCredits from "~/components/project/credits.vue";
import vNext from "~/components/project/next.vue";
import Utils from "~/assets/js/utils/Utils";
import ResizeHelper from "~/assets/js/utils/ResizeHelper";
import transform from "dom-transform";
import Emitter from "~/assets/js/events/EventsEmitter";
export default {
  head() {
    return {
      meta: [
        {
          hid: "description",
          name: "description",
          content: this.project
            ? this.project.desc
            : "Software developer based in India."
        },
        {
          hid: "og:description",
          property: "og:description",
          content: this.project
            ? this.project.desc
            : "Software developer based in India."
        },
        {
          hid: "twitter:description",
          property: "twitter:description",
          content: this.project
            ? this.project.desc
            : "Software developer based in India."
        },
        {
          hid: "og:url",
          property: "og:url",
          content: this.project ? `url/project/${this.project.slug}` : ""
        },
        {
          hid: "twitter:url",
          property: "twitter:url",
          content: this.project ? `url/project/${this.project.slug}` : ""
        },
        {
          hid: "og:image",
          property: "og:image",
          content: this.project
            ? `url/images/${this.project.slug}/${this.project.cover}`
            : "url/images/share.jpg"
        },
        {
          hid: "twitter:image",
          property: "twitter:image",
          content: this.project
            ? `url/images/${this.project.slug}/${this.project.cover}`
            : "url/images/share.jpg"
        }
      ]
    };
  },
  data() {
    return {
      isReady: false,
      isOverScrolled: false,
      pageScroll: 0,
      imgLoaded: 0,
      w: 0
    };
  },
  components: {
    vCover,
    vDesc,
    vImage,
    vImageFull,
    vCredits,
    vNext,
    vVideo,
    vColumn
  },
  computed: {
    ...mapState(["path", "vPath", "nextOffset"]),
    ...mapGetters(["project", "nextProject", "isDevice"]),
    imgPath() {
      return `${this.path}${this.project.slug}/`;
    },
    videoPath() {
      return `${this.vPath}${this.project.slug}/`;
    }
  },
  methods: {
    ...mapActions(["setNextOffset"]),
    tick(scrollTop) {
      this.$refs.desc.tick(scrollTop);
      this.$refs.credits.tick(scrollTop);
      if (this.isDevice) {
        this.$refs.media.forEach(el => {
          el.tick(scrollTop);
        });
        this.$refs.next.tick(scrollTop);
      } else {
        if (scrollTop + this.h > this.nextOffset) {
          this.pageScroll = scrollTop + this.h - this.nextOffset;
        } else {
          this.pageScroll = 0;
        }
        this.pourc = this.pageScroll / (this.pageHeight - this.nextOffset); // Math.min(2000, Math.max(0,(scrollTop + (this.h)) - (this.nextOffset))) /  1999

        if (this.pourc > 0.99 && !this.isOverScrolled) {
          this.isOverScrolled = true;
          this.$router.push({
            name: "project-slug",
            params: { slug: this.nextProject.slug }
          });
        }
        transform(this.$el, { translate3d: [0, this.pageScroll, 0] });
      }
    },
    onLoad() {
      this.imgLoaded++;
      if (this.imgLoaded === this.imgs.length) Emitter.emit("GLOBAL:RESIZE");
    },
    resize(w, h, pageHeight) {
      if (w && h) {
        this.w = w;
        this.h = h;
        this.pageHeight = pageHeight;
      }

      this.$refs.credits.resize(this.w, this.h, pageHeight);
      this.$refs.desc.resize(this.w, this.h, pageHeight);
      if (this.isDevice) {
        this.$refs.media.forEach(el => {
          el.resize(this.w, this.h);
        });
        this.$refs.next.resize(this.w, this.h);
      }
      this.setNextOffset(Utils.offset(this.$refs.next.$el).top);
    }
  },
  beforeDestroy() {
    this.imgs.forEach(element => {
      element.removeEventListener("load", this._onLoad);
    });
  },
  mounted() {
    this._onLoad = this.onLoad.bind(this);
    this.imgs = [];
    this.$nextTick(() => {
      const imgs = [].slice.call(this.$el.querySelectorAll("img"));
      imgs.forEach(element => {
        if (!element.dataset.src) return;
        const img = new Image();
        img.addEventListener("load", this._onLoad);
        img.src = element.dataset.src;
        this.imgs.push(img);
      });
      this.isReady = true;
    });
    setTimeout(() => {
      Emitter.emit("GLOBAL:RESIZE");
    }, 1000);
  }
};
</script>

<style lang="stylus" scoped>
.project
  color $black
  min-height 100vh
</style>
<style lang="stylus">
.no-touch .project.ready
  img, video
    opacity 0
</style>

<template>
  <div :class="[{ events: canvasEvents }, $route.name]">
    <div
      :class="[{ events: canvasEvents }, $route.name]"
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
    <canvas
      ref="pixiCanvas"
      :class="[{ events: canvasEvents }, $route.name]"
    ></canvas>
  </div>
</template>

<script>
import anime from "animejs";
import transform from "dom-transform";
import ContactSprite from "~/assets/js/pixi/contact/ContactSprite";
import IndexSprite from "~/assets/js/pixi/index/IndexSprite"; //h
import Projects from "~/assets/js/pixi/projects/Projects";
import MouseSprite from "~/assets/js/pixi/mouse/MouseSprite";
import Emitter from "~/assets/js/events/EventsEmitter";
if (process.browser) {
  require("pixi.js");
}
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  name: "scene",
  data() {
    return {
      w: 0,
      isMobile: false
    };
  },
  computed: {
    ...mapState([
      "projects",
      "index",
      "contact",
      "path",
      "currentProject",
      "nextOffset"
    ]),
    ...mapGetters(["project", "projectId", "nextProject", "isFF", "isDevice", "isPhone"]),
    canvasEvents() {
      return (
        (this.$route.name === "projects" && !this.isDevice) ||
        (this.$route.name === "contact" && (this.isFF || this.isDevice))
      );
    },
    containerClass() {
      return this.isMobile ? "mobile-container" : "";
    }
  },
  methods: {
    ...mapActions(["setCurrentProject"]),
    tick(
      scrollTop,
      mouseX,
      mouseY,
      mouseEaseX,
      mouseEaseY,
      mouseEaseSlowX,
      mouseEaseSlowY,
      realScrollTop
    ) {
      if (this.projectsSprite)
        this.projectsSprite.tick(
          scrollTop,
          realScrollTop,
          mouseEaseX,
          mouseEaseY,
          mouseEaseSlowX,
          mouseEaseSlowY
        );
      if (this.mouseSprite)
        this.mouseSprite.tick(mouseX, mouseY, mouseEaseX, mouseEaseY);
      if (this.contactSprite) this.contactSprite.tick(scrollTop);
      if (this.indexSprite) {
        this.indexSprite.tick(
          scrollTop,
          mouseX,
          mouseY,
          mouseEaseSlowX,
          mouseEaseSlowY
        ); //h
      }
      this.app.renderer.render(this.app.stage);
    },
    resize(w, h) {
      if (w && h) {
        this.h = h;
        this.w = w;
      }
      if (this.projectsSprite) this.projectsSprite.resize(this.w, this.h);
      if (this.mouseSprite) this.mouseSprite.resize(this.w, this.h);
      if (this.contactSprite) this.contactSprite.resize(this.w, this.h);
      if (this.indexSprite) {
        this.indexSprite.resize(this.w, this.h); //h
      }
      this.app.renderer.resize(this.w, this.h);
    },
    setPixi() {
      this.app = new PIXI.Application({
        transparent: true,
        autoStart: false,
        autoResize: true,
        antialias: true,
        backgroundAlpha: 0,
        powerPreference: "high-performance",
        view: this.$refs.pixiCanvas,
        resolution: window.devicePixelRatio,
        legacy: true //flickering on old browser
      });

      let path = this.path;
      if (this.w < 600) {
        path = path.replace("f_auto", "f_auto,w_600");
      } else if (this.w < 1000) {
        path = path.replace("f_auto", "f_auto,w_1000");
      }

      if (!this.isDevice) {
        this.projectsSpriteContainer = new PIXI.Sprite();
        this.projectsSprite = new Projects(
          this.projectsSpriteContainer,
          this.projects,
          path
        );
        this.app.stage.addChild(this.projectsSpriteContainer);
        this.projectsSprite.setPage(this.$route.name);
      }

      if (this.isFF || this.isDevice) {
        this.contactSpriteContainer = new PIXI.Sprite();
        this.contactSprite = new ContactSprite(
          this.contactSpriteContainer,
          path,
          this.contact
        );
        this.app.stage.addChild(this.contactSpriteContainer);
      }

      if (!this.isDevice) {
        this.mouseSpriteContainer = new PIXI.Sprite();
        this.mouseSprite = new MouseSprite(this.mouseSpriteContainer, path);
        this.app.stage.addChild(this.mouseSpriteContainer);
      } else {
        this.app.renderer.plugins.interaction.autoPreventDefault = false;
      }
    },
    setThreeJS() {
      let path = this.path;
      if (this.w < 600) {
        path = path.replace("f_auto", "f_auto,w_600");
      } else if (this.w < 1000) {
        path = path.replace("f_auto", "f_auto,w_1000");
      }

      this.indexSprite = new IndexSprite(
        this.$refs.threejsContainer,
        this.isPhone,
        this.isDevice,
        '.listRoot',
        '.listItem'
      );
      this.indexSprite.animate();
    },
    animateIn() {
      this.resize();
    },
    setEvents() {
      this._projectOver = this.projectOver.bind(this);
      this._projectOut = this.projectOut.bind(this);
      this._projectClick = this.projectClick.bind(this);
      this._onMouseOver = this.onMouseOver.bind(this);
      this._onMouseOut = this.onMouseOut.bind(this);
      this._onCoverOver = this.onCoverOver.bind(this);
      this._onCoverOut = this.onCoverOut.bind(this);
      this._onLogoOver = this.onLogoOver.bind(this);
      this._onLogoOut = this.onLogoOut.bind(this);
      this._projectIdChange = this.projectIdChange.bind(this);
      Emitter.on("PROJECT:OVER", this._projectOver);
      Emitter.on("PROJECT:OUT", this._projectOut);
      Emitter.on("PROJECT:CLICK", this._projectClick);
      Emitter.on("LINK:OVER", this._onMouseOver);
      Emitter.on("LINK:OUT", this._onMouseOut);
      Emitter.on("COVER:OVER", this._onCoverOver);
      Emitter.on("COVER:OUT", this._onCoverOut);
      Emitter.on("LOGO:OVER", this._onLogoOver);
      Emitter.on("LOGO:OUT", this._onLogoOut);
      Emitter.on("PROJECT:OVER", this._onMouseOver);
      Emitter.on("PROJECTID:CHANGE", this._projectIdChange);
    },
    projectIdChange(id) {
      this.setCurrentProject(id);
    },
    projectOver() {
      this.onMouseOver();
    },
    projectOut() {
      this.onMouseOut();
    },

    projectClick(id) {
      if (this.projectsSprite) this.projectsSprite.doClick(id);
      this.$router.push({
        name: "project-slug",
        params: { slug: this.projects[id % this.projects.length].slug }
      });
    },
    onMouseOver(e) {
      if (this.mouseSprite) this.mouseSprite.onMouseOver();
    },
    onMouseOut() {
      if (this.mouseSprite) this.mouseSprite.onMouseOut();
    },
    onCoverOver(e) {
      if (this.mouseSprite) this.mouseSprite.onCoverOver();
    },
    onCoverOut() {
      if (this.mouseSprite) this.mouseSprite.onCoverOut();
    },
    onLogoOver(e) {
      if (this.mouseSprite) this.mouseSprite.onLogoOver();
    },
    onLogoOut() {
      if (this.mouseSprite) this.mouseSprite.onLogoOut();
    },
    reset() {
      this.links_array.forEach(element => {
        element.removeEventListener("mouseover", this._onMouseOver);
        element.removeEventListener("mouseout", this._onMouseOut);
      });
    },
    beforeChangePage(fromPageName, toPageName) {
      this.reset();
      switch (fromPageName) {
        case "index":
          if (this.indexSprite) {
            anime({
              targets: '.listRoot',
              opacity: [1, 0],
              alpha: 0,
              easing: "easeOutQuad",
              duration: 800
            });
            this.indexSprite.hide(); //h
          }
          break;
        case "contact":
          if (this.contactSprite) this.contactSprite.hide();
          break;
        case "projects":
          if (toPageName === "project-slug") {
            if (this.projectsSprite)
              this.projectsSprite.setProjectSelected(true);
            if (this.projectsSprite)
              this.projectsSprite.transitionBetweenProjectsAndProject();
          } else {
            if (this.projectsSprite) this.projectsSprite.hide();
          }
          break;
        case "project-slug":
          if (toPageName === "projects") {
            if (this.projectsSprite)
              this.projectsSprite.transitionBetweenProjectAndProjects();
          } else {
            if (this.projectsSprite) this.projectsSprite.hide();
            if (this.projectsSprite)
              this.projectsSprite.hideProject(toPageName === "project-slug");
            if (toPageName === "project-slug" && this.projectsSprite)
              this.projectsSprite.doNextTrans();
          }
          break;
      }
    },
    changePage(isFast = false) {
      this.$nextTick(() => {
        this.links_array = [].slice.call(document.querySelectorAll("a"));
        this.links_array.forEach(element => {
          element.addEventListener("mouseover", this._onMouseOver, {
            passive: true
          });
          element.addEventListener("mouseout", this._onMouseOut, {
            passive: true
          });
        });
      });

      if (this.projectsSprite)
        this.projectsSprite.setCurrentId(this.currentProject);
      if (this.mouseSprite) this.mouseSprite.changePage(this.$route.name);
      switch (this.$route.name) {
        case "index":
          if (this.indexSprite) {
            anime({
              targets: '.listRoot',
              opacity: [0, 1],
              alpha: 1,
              easing: "easeOutQuad",
              duration: 500,
            });
            this.indexSprite.show(); //h
          }
          break;
        case "contact":
          if (this.contactSprite) this.contactSprite.show();
          break;
        case "projects":
          if (this.projectsSprite) this.projectsSprite.showProjects(isFast);
          this.indexSprite.hide();
          this.resize();
          break;
        case "project-slug":
          if (this.projectsSprite)
            this.projectsSprite.showProject(
              this.projectId,
              isFast,
              this.project,
              this.nextProject
            );
          this.setCurrentProject(this.projectId);
          break;
      }
      if (this.projectsSprite) this.projectsSprite.setPage(this.$route.name);
    }
  },
  watch: {
    currentProject(val) {
      if (this.projectsSprite) this.projectsSprite.setCurrentId(val);
    },
    nextOffset(val) {
      if (this.projectsSprite) this.projectsSprite.nextOffset = val;
      this.resize();
    }
  },
  beforeDestroy() {
    if (this.mouseSprite) this.mouseSprite.destroy();
    Emitter.removeListener("LINK:OVER", this._onMouseOver);
    Emitter.removeListener("LINK:OUT", this._onMouseOut);
    Emitter.removeListener("PROJECT:OVER", this._onMouseOver);
    Emitter.removeListener("PROJECT:OUT", this._onMouseOut);
    Emitter.removeListener("PROJECT:OVER", this._projectOver);
    Emitter.removeListener("PROJECT:OUT", this._projectOut);
    Emitter.removeListener("PROJECT:CLICK", this._projectClick);
    Emitter.removeListener("PROJECTID:CHANGE", this._projectIdChange);
  },
  mounted() {
    this.w = window.innerWidth;
    this.isMobile = this.w < 769;
    this.setPixi();
    this.setThreeJS();
    this.setEvents();
    document.querySelector(".scroll").style.top = "1px";
    Emitter.emit("GLOBAL:RESIZE");
    this.$nextTick(() => {
      this.changePage(true);
      document.querySelector(".scroll").style.top = 0;
    });
    anime({
      targets: this.$el,
      opacity: [0, 1],
      easing: "easeInQuad",
      duration: 2000
    });
  }
};
</script>

<style lang="stylus" scoped>
div
  position relative
  top 0
  left 0
  width 100%
  height 100%
  z-index 2
  pointer-events none
  .device &.index
    position relative
  &.events
    pointer-events auto

.listContainer
  position relative
  display inline
  top 7vh
  z-index 2
  pointer-events none
  scroll-behavior smooth
  transition all 1.8s cubic-bezier(0.76, 0.16, 0.24, 0.86)

.listCanva
  height 100vh
  width 100vw
  position fixed
  inset 0px
  z-index -10

.listRoot
  display flex
  max-width 40rem
  margin 0 auto
  list-style-type none
  justify-content center
  pointer-events auto

  p
    font-size 2.5rem
    line-height 8rem
    font-weight normal
    letter-spacing calc((100vh - 300px) / 20)
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

canvas
  position fixed
  top 0
  left 0
  width 100%
  height 100%
  z-index 2
  pointer-events none
  .device &.index
    position relative
  &.events
    pointer-events auto
</style>

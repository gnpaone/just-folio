<template>
  <canvas :class="{'events': canvasEvents}"></canvas>
</template>
<script>
import anime from 'animejs';
import transform from 'dom-transform';
import ContactSprite from '~/assets/js/pixi/contact/ContactSprite'
import ErrorSprite from '~/assets/js/pixi/error/ErrorSprite'
import Projects from '~/assets/js/pixi/projects/Projects'
import MouseSprite from '~/assets/js/pixi/mouse/MouseSprite'
import Emitter from '~/assets/js/events/EventsEmitter'
if(process.browser) {
  require('pixi.js')
}
import { mapState, mapGetters, mapActions } from 'vuex';
export default {
  name: 'scene',
  data(){
    return {
      w: 0
    }
  },
  computed: {
    ...mapState(['projects', 'contact', 'path', 'currentProject', 'nextOffset']),
    ...mapGetters(['project', 'projectId', 'nextProject', 'isFF','isDevice']),
    canvasEvents() {
      return ((this.$route.name === 'projects' && !this.isDevice ) || (this.$route.name === 'contact' && (this.isFF || this.isDevice)) )
    }
  },
  methods:{
    ...mapActions(['setCurrentProject']),
    tick(scrollTop, mouseX, mouseY,mouseEaseX, mouseEaseY, mouseEaseSlowX, mouseEaseSlowY,realScrollTop) {
      if(this.projectsSprite)this.projectsSprite.tick(scrollTop, realScrollTop, mouseEaseX, mouseEaseY, mouseEaseSlowX, mouseEaseSlowY)
      if(this.mouseSprite) this.mouseSprite.tick( mouseX, mouseY, mouseEaseX, mouseEaseY)
      if(this.contactSprite)this.contactSprite.tick(scrollTop);
      this.errorSprite.tick(scrollTop, mouseX, mouseY, mouseEaseSlowX, mouseEaseSlowY);
      this.app.renderer.render(this.app.stage);

    },
    resize(w, h) {
      if(w && h) {
        this.h = h
        this.w = w
      }
      if(this.projectsSprite)this.projectsSprite.resize(this.w, this.h)
      if(this.mouseSprite) this.mouseSprite.resize(this.w, this.h);
      if(this.contactSprite)this.contactSprite.resize(this.w, this.h);
      this.errorSprite.resize(this.w, this.h);
      this.app.renderer.resize(this.w, this.h);

    },
    setPixi() {
      this.app = new PIXI.Application({
        transparent: true,
        autoStart: false,
        autoResize: true,
        antialias:true,
        powerPreference: "high-performance",
        view: this.$el,
        resolution: window.devicePixelRatio,
        legacy: true //flickering on old browser
      });

      //
      let path = this.path
      if(this.w < 600) {
        path = path.replace('f_auto','f_auto,w_600')
      }
      else if(this.w < 1000) {
        path = path.replace('f_auto','f_auto,w_1000')
      }

      this.errorSpriteContainer = new PIXI.Sprite();
      this.errorSprite = new ErrorSprite(this.errorSpriteContainer, path, this.isDevice);
      this.app.stage.addChild(this.errorSpriteContainer);

      //
      if(!this.isDevice) {
        this.mouseSpriteContainer = new PIXI.Sprite();
        this.mouseSprite = new MouseSprite(this.mouseSpriteContainer, path);
        this.app.stage.addChild(this.mouseSpriteContainer);
      }else{
        this.app.renderer.plugins.interaction.autoPreventDefault = false
      }
        this.errorSprite.show()
    },
    animateIn() {
      this.resize()
    },
    setEvents() {
      this._projectOver = this.projectOver.bind(this)
      this._projectOut = this.projectOut.bind(this)
      this._projectClick = this.projectClick.bind(this)
      this._onMouseOver = this.onMouseOver.bind(this)
      this._onMouseOut = this.onMouseOut.bind(this)
      this._onCoverOver = this.onCoverOver.bind(this)
      this._onCoverOut = this.onCoverOut.bind(this)
      this._onLogoOver = this.onLogoOver.bind(this)
      this._onLogoOut = this.onLogoOut.bind(this)
      this._projectIdChange = this.projectIdChange.bind(this)
      Emitter.on('PROJECT:OVER', this._projectOver)
      Emitter.on('PROJECT:OUT', this._projectOut)
      Emitter.on('PROJECT:CLICK', this._projectClick)
      Emitter.on('LINK:OVER',this._onMouseOver)
      Emitter.on('LINK:OUT',this._onMouseOut)
      Emitter.on('COVER:OVER',this._onCoverOver)
      Emitter.on('COVER:OUT',this._onCoverOut)
      Emitter.on('LOGO:OVER',this._onLogoOver)
      Emitter.on('LOGO:OUT',this._onLogoOut)
      Emitter.on('PROJECT:OVER',this._onMouseOver)
      Emitter.on('PROJECTID:CHANGE', this._projectIdChange)
    },
    projectIdChange(id) {
      //console.log('projectIdChange', id);

      this.setCurrentProject(id)
    },
    projectOver() {
      this.onMouseOver()
    },
    projectOut() {
      this.onMouseOut()
    },

    projectClick(id) {
      if(this.projectsSprite)this.projectsSprite.doClick(id)
      this.$router.push({name:'project-slug', params: { slug: this.projects[id % this.projects.length ].slug }})
    },
    onMouseOver(e) {
      if(this.mouseSprite) this.mouseSprite.onMouseOver()
    },
    onMouseOut() {
      if(this.mouseSprite) this.mouseSprite.onMouseOut()
    },
    onCoverOver(e) {
      if(this.mouseSprite) this.mouseSprite.onCoverOver()
    },
    onCoverOut() {
      if(this.mouseSprite) this.mouseSprite.onCoverOut()
    },
    onLogoOver(e) {
      if(this.mouseSprite) this.mouseSprite.onLogoOver()
    },
    onLogoOut() {
      if(this.mouseSprite) this.mouseSprite.onLogoOut()
    },
    reset(){
      this.links_array.forEach(element => {
        element.removeEventListener('mouseover', this._onMouseOver, )
        element.removeEventListener('mouseout', this._onMouseOut)
      });
    },
  },

  beforeDestroy() {
    if(this.mouseSprite) this.mouseSprite.destroy()
    Emitter.removeListener('LINK:OVER',this._onMouseOver)
    Emitter.removeListener('LINK:OUT',this._onMouseOut)
    Emitter.removeListener('PROJECT:OVER',this._onMouseOver)
    Emitter.removeListener('PROJECT:OUT',this._onMouseOut)
    Emitter.removeListener('PROJECT:OVER', this._projectOver)
    Emitter.removeListener('PROJECT:OUT', this._projectOut)
    Emitter.removeListener('PROJECT:CLICK', this._projectClick)

    Emitter.removeListener('PROJECTID:CHANGE', this._projectIdChange)
  },
  mounted() {
    this.w = window.innerWidth
    this.setPixi()
    this.setEvents()
    Emitter.emit('GLOBAL:RESIZE')
    anime({
      targets: this.$el,
      opacity: [0,1],
      easing: 'easeInQuad',
      duration: 2000
    })
  }
}

</script>

<style lang="stylus" scoped>
canvas
  position fixed
  top 0
  left 0
  width 100%
  height 100%
  z-index 2
  pointer-events none
  &.events
    pointer-events auto
</style>

import Covers from '~/assets/js/pixi/projects/Covers'
import CoversNext from '~/assets/js/pixi/project/CoversNext'
import Titles from '~/assets/js/pixi/projects/Titles'
import Project from '~/assets/js/pixi/project/Project'
import Emitter from '~/assets/js/events/EventsEmitter'
import ScrollHelper from '~/assets/js/utils/ScrollHelper'
import deformation from '~/assets/js/shaders/deformation'
import ResizeHelper from '~/assets/js/utils/ResizeHelper'
import anime from 'animejs'

class Projects {
  constructor(stage, projects, path) {
    this.stage = stage
    this.stage.name = "projects"
    this.projects = projects
    this.path = path
    this.page = ''
    this.coef = 1
    this.backgroundAnim= {p:0,a:1}
    this.titlesPositionArray = []

    this.currentId = 0
    this.nextOffset = 0
    this.w = ResizeHelper.width()
    this.h = ResizeHelper.height()
    this.setProjectSelected(false)
    this.init()
  }

  init() {
    //
    this.container  = new PIXI.Sprite();
    this.container.name = 'container '
    this.stage.addChild(this.container);
    //
    this.background = new PIXI.Sprite()
    this.backgroundGraph = new PIXI.Graphics()
    this.container.addChild(this.background)
    this.background.addChild(this.backgroundGraph)
    this.background.visible = false
    //
    this.titlesBackContainer  = new PIXI.Sprite();
    this.titlesBackContainer.name = 'titlesBackContainer '
    this.container.addChild(this.titlesBackContainer);

    this.nextSprite = new PIXI.Sprite()
    this.next = new CoversNext(this.nextSprite, this.path, this.w, this.h)
    this.stage.addChild(this.nextSprite)

    this.projectContainer  = new PIXI.Sprite();
    this.projectContainer.name = 'projectContainer '
    this.container.addChild(this.projectContainer);
    //
    this.coversContainer = new PIXI.Sprite();
    this.coversContainer.name = 'coversContainer '
    this.container.addChild(this.coversContainer);
    this.covers = new Covers(this.coversContainer, this.projects, this.path,this.w, this.h);
    this.titlesContainer = new PIXI.Sprite();
    this.titlesContainer.name = 'titlesContainer '
    this.container.addChild(this.titlesContainer);
    this.titles = new Titles(this.titlesContainer, this.titlesBackContainer, this.projects,this.w, this.h);
    //

    this.stage.visible = false
    let uniforms = {
      uDimensions: { type: 'v2', value: [this.w, this.h] },
      uMousePos: { type: 'v2', value: [.5, .5] },
      uScale: { type: 'f', value: .7}
    };


    this.deformationFilter = new PIXI.Filter(null, deformation, {...uniforms});
    this.deformationFilter.enabled = false
    this.deformationFilter.autoFit = false

  }
  doBgAnimation() {

    this.backgroundAnim= {p:0,a:0}


    anime({
      targets: this.backgroundAnim,
      a:[0.3,1,0],
      p: [0,1],
      delay:100,
      duration: 700,
      endDelay: 100,
      easing: 'easeInOutQuad',
      update:()=>{
        this.drawBg()
      },
      begin:()=>{
        this.background.visible = true
      },
      complete:()=>{
        this.background.visible = false
      }
    })
  }
  drawBg() {
    const top = this.backgroundAnim.p * this.h
    const  h = this.h - this.h / 2 + this.h / 2 - top;
    this.backgroundGraph.clear()
    this.backgroundGraph.beginFill(this.isShowingProjects ?  0x000000 : 0xffffff );
    this.backgroundGraph.drawRect(0, h, this.w, top + 1)
    this.backgroundGraph.moveTo(0, h)
    this.backgroundGraph.quadraticCurveTo(this.w / 2, h - this.h / 2 * this.backgroundAnim.a, this.w, h)
    this.backgroundGraph.closePath()
    this.backgroundGraph.endFill()
  }
  setPage(page) {
    this.page = page
    this.background.position.y = 0
  }
  show() {
    this.stage.visible = true
    this.titlesContainer.filters = [this.deformationFilter];
    this.titlesBackContainer.filters = [this.deformationFilter];
    this.deformationFilter.enabled = true
    clearTimeout(this.hideTimer)
  }

  hide() {
    this.setProjectSelected(true)
    this.titles.hideAll()
    this.covers.hideAll()
    this.hideTimer = setTimeout(()=>{
      this.stage.visible = false
      this.deformationFilter.enabled = false
      this.titlesContainer.filters = null;
      this.titlesBackContainer.filters = null;
    }, 1000)
  }

  showProjects() {
    if(this.coefAnim)this.coefAnim.pause()
    this.coefAnim = anime({
      targets: this,
      coef: 1,
      easing: 'easeOutQuad',
      duration: 600
    })
    this.coversContainer.visible = true
    const scrollTop = this.currentId ? this.currentId === 0 ? 1 : (this.titles.titles_array[this.currentId + this.projects.length].title.yPos - this.h / 2) : 1
    setTimeout(()=>{
      this.setProjectSelected(false)
      ScrollHelper.resetScroll(scrollTop)
    },20)
    this.show()
    this.titles.showAll()
    this.covers.showAll()
    if(this.project) this.resetProject()
  }
  showProject(id,isFast, project, nextProject) {
    if(this.project) this.resetProject()
    if(this.coefAnim)this.coefAnim.pause()
    this.coefAnim = anime({
      targets: this,
      coef: 0,
      easing: 'easeOutQuad',
      duration: 600
    })
    this.next.transitionAlpha(1)
    anime({
      targets: this.titles.stage,
      alpha: 1,
      easing: 'easeOutQuad',
      duration: 600,
      delay : 300
    })
    anime({
      targets: this.titles.stage.position,
      y: 0,
      easing: 'easeOutQuad',
      duration: 600,
      delay : 300
    })
    this.titles.showProject(id,isFast)
    ScrollHelper.goTo(1)
    this.setProjectSelected(true)
    this.show(isFast)

    this.covers.showProject()
    this.covers.doClick(id)
    this.projectSprite = new PIXI.Sprite()
    this.projectContainer.addChild(this.projectSprite)
    anime({
      targets: this.projectContainer,
      alpha: [0,1],
      duration: 200,
      easing: 'easeOutQuad'
    })

    this.project = new Project(this.projectSprite, this.path, project, this.w, this.h)
    setTimeout(()=>{
      this.coversContainer.visible = false
      this.next.load(nextProject)
      this.next.resize(this.w, this.h, this.nextOffset)
    },300)
    this.pageScroll = 0
  }
  resetProject(){
    this.project.destroy()
    this.projectContainer.removeChild(this.projectSprite)
    this.project = null
    this.el = null
    this.next.reset()
  }
  transitionBetweenProjectsAndProject(id){
    this.isShowingProjects = false
    this.doBgAnimation()
    this.titles.showProject(id, false)
    this.covers.showProject()
  }
  transitionBetweenProjectAndProjects(id){
    this.isShowingProjects = true
    this.doBgAnimation()
  }
  doNextTrans() {
    this.next.doNextTrans()
    this.titles.stage.alpha = 0
    this.titles.stage.position.y = 100
  }
  hideProject(isGoingToProject){
    anime({
      targets: this.projectContainer,
      alpha: 0,
      duration: 500,
      easing: 'easeOutQuad'
    })
    if(!isGoingToProject) this.next.transitionAlpha(0)
  }

  doClick(id) {
    this.setProjectSelected(true)
    this.titles.doClick(id)
    this.covers.setCurrentId(id)
    ScrollHelper.goTo(0)
  }

  tick(scrollTop,realScrollTop,easeX, easeY) {
    if(!this.w) return
    if(!this.stage.visible) return
    const mouseEaseX = easeX - this.w / 2
    const mouseEaseY = easeY - this.h / 2

    this.deformationFilter.uniforms.uMousePos = [.05 *this.coef , -.1  *this.coef]
    this.titles.tick(scrollTop, mouseEaseX, mouseEaseY)
    this.covers.tick(mouseEaseX, mouseEaseY)

    if(this.page === 'projects') {
      if(!this.isProjectSelected) {
        if(realScrollTop > this.titles.titlesHeight )ScrollHelper.resetScroll(1)
        if(realScrollTop < 1)ScrollHelper.resetScroll(this.titles.titlesHeight)

        let id = 0
        for (let index = 0; index < this.titlesPositionArray.length; index++) {
          if(scrollTop >= this.titlesPositionArray[index]) id = index
        }
        if(this.currentId !== id % (this.projects.length)) {
          Emitter.emit('PROJECTID:CHANGE', id % (this.projects.length))
        }
      }
    }
    if(this.page === 'project-slug') {

    this.background.position.y = scrollTop
      this.next.tick(mouseEaseX, mouseEaseY, scrollTop)
      if(this.nextOffset) {
        if(scrollTop + (this.h) < this.nextOffset) {
          this.pageScroll =  -scrollTop
        }
      }
      this.container.position.y = this.pageScroll
      if(this.project)this.project.tick(scrollTop, this.pageScroll, mouseEaseX, mouseEaseY)
    }else{
      this.container.position.y = 0
    }
  }
  setProjectSelected(bool) {
    this.isProjectSelected = bool
  }

  setCurrentId(id) {
    if(id === this.currentId)return
    this.covers.setCurrentId(id)
    this.titles.setCurrentId(id)
    this.currentId = id

  }

  destroy() {
    this.titles.destroy()
    this.covers.destroy()
    this.stage.removeChildren()
  }

  resize(w, h) {
    if(w && h){
      this.w = w
      this.h = h
    }
    if(this.project){
      this.project.resize(this.w,this.h)
      this.next.resize(this.w, this.h, this.nextOffset)
    }
    this.covers.resize(this.w, this.h)
    this.titles.resize(this.w, this.h)
    this.titlesPositionArray = []

    this.titles.titles_array.forEach((el,i) => {
      const mid =  el.title.yPos - el.title.textMetrics.height / 2  - this.titles.titleOffset
      this.titlesPositionArray.push(mid)
    })
    this.deformationFilter.uniforms.uDimensions = [this.w, this.h]
    this.titlesContainer.filterArea = new PIXI.Rectangle(0,0,this.w,this.h);
    this.titlesBackContainer.filterArea = new PIXI.Rectangle(0,0,this.w,this.h);
  }

}

export default Projects

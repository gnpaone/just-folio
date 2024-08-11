import Cover from '~/assets/js/pixi/projects/Cover'
import anime from 'animejs'
class Covers {
  constructor(stage, projects, path, w ,h) {
    this.h = h
    this.w = w
    this.stage = stage
    this.projects = projects
    this.path = path
    this.isAnimating = false
    this.currentId = 0
    this.totalProjects = projects.length
    this.init()
  }

  init() {
    this.container = new PIXI.Sprite()
    this.stage.addChild(this.container);

    this.covers_array = []

    this.dim = Math.min(Math.max(Math.min(this.w, this.h) * .68, 300), 600)
    this.projects.forEach((el,i) => {
      const coverSprite = new PIXI.Sprite()
      this.container.addChild(coverSprite)
      const cover = new Cover(coverSprite,i, this.w, this.h, this.dim)
      cover.load(`${this.path}${el.slug}/${el.cover}`)
      this.covers_array.push(cover)
    });
    this.mask = new PIXI.Graphics()
    this.mask.beginFill(0xCC0000)
    this.mask.drawCircle(0,0, this.dim / 2)
    this.stage.addChild(this.mask)
    this.mask.scale.set(0)
    this.container.mask = this.mask

  }
  hideAll() {
    anime({
      targets: this.mask.scale,
      x:.3,
      y:.3,
      easing: 'easeOutQuad',
      duration: 800
    })
    anime({
      targets: this.container,
      alpha:0,
      easing: 'easeOutQuad',
      duration: 500,
      delay: 300
    })
    this.covers_array[this.currentId].hide()
  }

  showAll() {
    anime({
      targets: this.container,
      alpha: 1,
      easing: 'easeInQuad',
      duration: 200
    })
    anime({
      targets: this.mask.scale,
      x: 1,
      y: 1,
      easing: 'easeOutQuad',
      duration: 500
    })
    this.covers_array[this.currentId].resetClick()
    this.covers_array[this.currentId].show()
  }

  setCurrentId(id) {
    if(id % this.totalProjects === this.currentId)return
    if(this.isAnimating) {
      this.nextId = id % this.totalProjects
      clearTimeout(this.timer)
      this.timer = setTimeout(()=>{
        this.isAnimating = false
        if(this.nextId !== this.currentId)this.setCurrentId(this.nextId)
      }, 200)
    }else{
      this.covers_array[this.currentId].hide()
      this.currentId = id % this.totalProjects
      this.nextId = this.currentId

      this.covers_array[this.currentId].show()
      this.isAnimating = true
    }

  }

  showProject(id) {
    anime({
      targets: this.mask.scale,
      x:1.1,
      y:1.1,
      easing: 'easeOutQuad',
      duration: 500
    })
  }
  doClick(id) {
    this.covers_array[id % this.totalProjects].doClick()
  }

  tick(easeX, easeY) {
    this.mask.position.x = this.w / 2 - easeX/this.w * 25
    this.mask.position.y = this.h / 2 - easeY/this.h * 25
    this.container.position.x =  easeX/this.w * 25
    this.container.position.y =  easeY/this.h * 25
  }

  resize(w, h) {
    if(w && h){

      if(this.w !== w || this.h !== h) {
        this.w = w
        this.h = h
        this.dim = Math.min(Math.max(Math.min(this.w, this.h) * .68, 300), 600)
        this.mask.clear()
        this.mask.beginFill(0xCC0000)
        this.mask.drawCircle(0,0, this.dim / 2)
      }
    }
    this.covers_array.forEach(el => {
      el.resize(this.w, this.h, this.dim)
    })
  }

  destroy() {
    this.covers_array.forEach(el => {
      el.destroy()
    })
    this.stage.removeChildren()
  }

}

export default Covers

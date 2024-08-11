import Emitter from '~/assets/js/events/EventsEmitter'
class ScrollHelper {

    constructor() {
      this.ease = 0
      this.scrollTop = 0
      this._preventDefault = this.preventDefault.bind(this)
      this._onScroll = this.onScroll.bind(this)
      this.easeSlow = 0
      this.tempScroll = 0

      if(process.browser){
        this.doc = document.documentElement
        window.addEventListener('scroll', this._onScroll, {passive: true})
      }
      Emitter.on('WINDOW:DOSCROLL', this.scrollTo.bind(this))
    }

    onScroll() {

      if(this.isForceScrolling) {
        this.isForceScrolling = false
      }else{
        const scroll = (window.pageYOffset || this.doc.scrollTop)  - (this.doc.clientTop || 0)
        if(scroll != this.scrollTop){
          this.scrollTop = (window.pageYOffset || this.doc.scrollTop)  - (this.doc.clientTop || 0)
          this.scrollTop = Math.max(this.scrollTop, 0)
        }
      }
    }
    scrollTo(y) {
      window.scrollTo(0, y)
      this.scrollTop = y
    }

    goTo(y) {
      this.scrollTo(0, y)
      this.scrollTop = y
      this.ease = y
      this.easeSlow = y
      this.isForceScrolling = true

    }
    changePage(pageName) {
      this.pageName = pageName
    }
    resetScroll(y) {
      this.tick()
      if(y>this.scrollTop) {
        this.ease = this.ease + y
        this.easeSlow = this.easeSlow + y
      }else{
        this.ease = this.ease-this.scrollTop
        this.easeSlow = this.easeSlow-this.scrollTop
      }

      this.scrollTop = y
      this.scrollTo( y )
      this.tick()
    }

    tick() {
      this.tempScroll = this.scrollTop
      this.ease = Math.round(this.lerp(this.ease, this.scrollTop, 0.07)*100)/100
      this.easeSlow = Math.round(this.lerp(this.easeSlow, this.scrollTop, 0.05)*100)/100
    }
    lerp(x, y, r) {
      return x + ((y - x) * r);
    }

    preventDefault(e) {
      e = e || window.event;
      if (e.preventDefault)
          e.preventDefault();
      e.returnValue = false;
    }
  }

  export default new ScrollHelper();

import{D as e,p as n,l as r}from"./p-b018976f.js";var t={fullscreenEnabled:0,fullscreenElement:1,requestFullscreen:2,exitFullscreen:3,fullscreenchange:4,fullscreenerror:5,fullscreen:6},s=["webkitFullscreenEnabled","webkitFullscreenElement","webkitRequestFullscreen","webkitExitFullscreen","webkitfullscreenchange","webkitfullscreenerror","-webkit-full-screen"],l=["mozFullScreenEnabled","mozFullScreenElement","mozRequestFullScreen","mozCancelFullScreen","mozfullscreenchange","mozfullscreenerror","-moz-full-screen"],u=["msFullscreenEnabled","msFullscreenElement","msRequestFullscreen","msExitFullscreen","MSFullscreenChange","MSFullscreenError","-ms-fullscreen"],i="undefined"!=typeof window&&void 0!==window.document?window.document:{},c="fullscreenEnabled"in i&&Object.keys(t)||s[0]in i&&s||l[0]in i&&l||u[0]in i&&u||[],o={requestFullscreen:function(e){return e[c[t.requestFullscreen]]()},requestFullscreenFunction:function(e){return e[c[t.requestFullscreen]]},get exitFullscreen(){return i[c[t.exitFullscreen]].bind(i)},get fullscreenPseudoClass(){return":"+c[t.fullscreen]},addEventListener:function(e,n,r){return i.addEventListener(c[t[e]],n,r)},removeEventListener:function(e,n,r){return i.removeEventListener(c[t[e]],n,r)},get fullscreenEnabled(){return Boolean(i[c[t.fullscreenEnabled]])},set fullscreenEnabled(e){},get fullscreenElement(){return i[c[t.fullscreenElement]]},set fullscreenElement(e){},get onfullscreenchange(){return i[("on"+c[t.fullscreenchange]).toLowerCase()]},set onfullscreenchange(e){return i[("on"+c[t.fullscreenchange]).toLowerCase()]=e},get onfullscreenerror(){return i[("on"+c[t.fullscreenerror]).toLowerCase()]},set onfullscreenerror(e){return i[("on"+c[t.fullscreenerror]).toLowerCase()]=e}};function f(e){return{all:e=e||new Map,on:function(n,r){var t=e.get(n);t?t.push(r):e.set(n,[r])},off:function(n,r){var t=e.get(n);t&&(r?t.splice(t.indexOf(r)>>>0,1):e.set(n,[]))},emit:function(n,r){var t=e.get(n);t&&t.slice().map((function(e){e(r)})),(t=e.get("*"))&&t.slice().map((function(e){e(n,r)}))}}}var h=function(e,n,r,t){return new(r||(r=Promise))((function(s,l){function u(e){try{c(t.next(e))}catch(e){l(e)}}function i(e){try{c(t.throw(e))}catch(e){l(e)}}function c(e){var n;e.done?s(e.value):(n=e.value,n instanceof r?n:new r((function(e){e(n)}))).then(u,i)}c((t=t.apply(e,n||[])).next())}))};class a{constructor(n){this.host=n,this.disposal=new e,this.emitter=f()}get isSupported(){return this.isSupportedNatively}get isSupportedNatively(){return o.fullscreenEnabled}get isFullscreen(){return this.isNativeFullscreen}get isNativeFullscreen(){if(o.fullscreenElement===this.host)return!0;try{return this.host.matches(o.fullscreenPseudoClass)}catch(e){return!1}}on(e,n){this.emitter.on(e,n)}off(e,n){this.emitter.off(e,n)}destroy(){return h(this,void 0,void 0,(function*(){this.isFullscreen&&(yield this.exitFullscreen()),this.disposal.empty(),this.emitter.all.clear()}))}addFullscreenChangeEventListener(e){return this.isSupported?r(o,"fullscreenchange",e):n}addFullscreenErrorEventListener(e){return this.isSupported?r(o,"fullscreenerror",e):n}requestFullscreen(){return h(this,void 0,void 0,(function*(){if(!this.isFullscreen)return this.throwIfNoFullscreenSupport(),this.disposal.add(this.addFullscreenChangeEventListener(this.handleFullscreenChange.bind(this))),this.disposal.add(this.addFullscreenErrorEventListener(this.handleFullscreenError.bind(this))),this.makeEnterFullscreenRequest()}))}makeEnterFullscreenRequest(){return h(this,void 0,void 0,(function*(){return o.requestFullscreen(this.host)}))}handleFullscreenChange(){this.isFullscreen||this.disposal.empty(),this.emitter.emit("change",this.isFullscreen)}handleFullscreenError(e){this.emitter.emit("error",e)}exitFullscreen(){return h(this,void 0,void 0,(function*(){if(this.isFullscreen)return this.throwIfNoFullscreenSupport(),this.makeExitFullscreenRequest()}))}makeExitFullscreenRequest(){return h(this,void 0,void 0,(function*(){return o.exitFullscreen()}))}throwIfNoFullscreenSupport(){if(!this.isSupported)throw Error("Fullscreen API is not enabled or supported in this environment.")}}export{a as F,f as m}
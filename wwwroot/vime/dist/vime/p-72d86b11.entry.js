import{r as t,h as i}from"./p-aa8acb66.js";import{c as o,h as s}from"./p-b018976f.js";import{V as r}from"./p-415151d7.js";import{a as n}from"./p-b0ea4d0d.js";import{w as a}from"./p-17652948.js";import"./p-121aab6e.js";import"./p-8acb8eb5.js";var e=function(t,i,o,s){return new(o||(o=Promise))((function(r,n){function a(t){try{c(s.next(t))}catch(t){n(t)}}function e(t){try{c(s.throw(t))}catch(t){n(t)}}function c(t){var i;t.done?r(t.value):(i=t.value,i instanceof o?i:new o((function(t){t(i)}))).then(a,e)}c((s=s.apply(t,i||[])).next())}))};const c=class{constructor(i){t(this,i),this.willAttach=!1,this.preload="metadata",o(this),this.willAttach||a(this)}getAdapter(){var t,i;return e(this,void 0,void 0,(function*(){const o=null!==(i=yield null===(t=this.fileProvider)||void 0===t?void 0:t.getAdapter())&&void 0!==i?i:{};return o.canPlay=t=>e(this,void 0,void 0,(function*(){return s(t)&&n.test(t)})),o}))}render(){return i("vm-file",{noConnect:!0,willAttach:this.willAttach,crossOrigin:this.crossOrigin,preload:this.preload,disableRemotePlayback:this.disableRemotePlayback,mediaTitle:this.mediaTitle,viewType:r.Audio,ref:t=>{this.fileProvider=t}},i("slot",null))}};export{c as vm_audio}
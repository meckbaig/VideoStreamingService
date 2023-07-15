import{r as t,h as i,H as s,g as o,c as n}from"./p-aa8acb66.js";import{c as e,a as r,e as h,D as a,f as c,l,w as d}from"./p-b018976f.js";import{w as u}from"./p-cbbce638.js";import{c as v}from"./p-5ad78595.js";import{r as m}from"./p-61f7a20b.js";import{f as p}from"./p-d1e67aeb.js";import"./p-152748b8.js";const g=class{constructor(i){t(this,i),this.canToggleCaptionVisibility=!1,this.showIcon="captions-on",this.hideIcon="captions-off",this.tooltipPosition="top",this.hideTooltip=!1,this.keys="c",this.i18n={},this.playbackReady=!1,this.textTracks=[],this.isTextTrackVisible=!1,e(this),u(this,["i18n","textTracks","isTextTrackVisible","playbackReady"])}onTextTracksChange(){var t,i,s,o,n;return i=this,s=void 0,n=function*(){const i=r(this);this.canToggleCaptionVisibility=this.textTracks.length>0&&null!==(t=yield null==i?void 0:i.canSetTextTrackVisibility())&&void 0!==t&&t},new((o=void 0)||(o=Promise))((function(t,e){function r(t){try{a(n.next(t))}catch(t){e(t)}}function h(t){try{a(n.throw(t))}catch(t){e(t)}}function a(i){var s;i.done?t(i.value):(s=i.value,s instanceof o?s:new o((function(t){t(s)}))).then(r,h)}a((n=n.apply(i,s||[])).next())}))}componentDidLoad(){this.onTextTracksChange()}onClick(){var t;const i=r(this);null===(t=null==i?void 0:i.setTextTrackVisibility)||void 0===t||t.call(i,!this.isTextTrackVisible)}render(){const t=this.isTextTrackVisible?this.i18n.disableCaptions:this.i18n.enableCaptions,o=h(this.keys)?t:`${t} (${this.keys})`;return i(s,{hidden:!this.canToggleCaptionVisibility},i("vm-control",{label:this.i18n.captions,keys:this.keys,hidden:!this.canToggleCaptionVisibility,pressed:this.isTextTrackVisible,onClick:this.onClick.bind(this)},i("vm-icon",{name:this.isTextTrackVisible?this.showIcon:this.hideIcon,library:this.icons}),i("vm-tooltip",{hidden:this.hideTooltip,position:this.tooltipPosition,direction:this.tooltipDirection},o)))}static get watchers(){return{textTracks:["onTextTracksChange"],playbackReady:["onTextTracksChange"]}}};g.style=":host([hidden]){display:none}";const b=class{constructor(i){t(this,i),this.space="none",e(this)}render(){return i("div",{class:{controlGroup:!0,spaceTop:"none"!==this.space&&"bottom"!==this.space,spaceBottom:"none"!==this.space&&"top"!==this.space}},i("slot",null))}get host(){return o(this)}};b.style=":host{width:100%}.controlGroup{position:relative;width:100%;display:flex;flex-wrap:wrap;flex-direction:inherit;align-items:inherit;justify-content:inherit;box-sizing:border-box}.controlGroup.spaceTop{margin-top:var(--vm-control-group-spacing)}.controlGroup.spaceBottom{margin-bottom:var(--vm-control-group-spacing)}::slotted(*){margin-left:var(--vm-controls-spacing)}::slotted(*:first-child){margin-left:0}";const f=class{constructor(i){t(this,i),e(this)}};f.style=":host{flex:1}";const y=(t,i=1e3,s=!1)=>{let o;return function(...n){const e=this,r=s&&h(o);clearTimeout(o),o=setTimeout((function(){o=void 0,s||t.apply(e,n)}),i),r&&t.apply(e,n)}};const k={},w={},C=class{constructor(i){t(this,i),this.disposal=new a,this.isInteracting=!1,this.hidden=!1,this.fullWidth=!1,this.fullHeight=!1,this.direction="row",this.align="center",this.justify="start",this.pin="bottomLeft",this.activeDuration=2750,this.waitForPlaybackStart=!1,this.hideWhenPaused=!1,this.hideOnMouseLeave=!1,this.isAudioView=!1,this.isSettingsActive=!1,this.playbackReady=!1,this.isControlsActive=!1,this.paused=!0,this.playbackStarted=!1,e(this),m(this),u(this,["playbackReady","isAudioView","isControlsActive","isSettingsActive","paused","playbackStarted"])}connectedCallback(){this.dispatch=v(this),this.onControlsChange(),this.setupPlayerListeners()}componentWillLoad(){this.onControlsChange()}disconnectedCallback(){this.disposal.empty(),delete w[k[this]],delete k[this]}setupPlayerListeners(){return t=this,i=void 0,o=function*(){const t=yield c(this);h(t)||(["focus","keydown","click","touchstart","mouseleave"].forEach((i=>{this.disposal.add(l(t,i,this.onControlsChange.bind(this)))})),this.disposal.add(l(t,"mousemove",y(this.onControlsChange,50,!0).bind(this))),k[this]=t)},new((s=void 0)||(s=Promise))((function(n,e){function r(t){try{a(o.next(t))}catch(t){e(t)}}function h(t){try{a(o.throw(t))}catch(t){e(t)}}function a(t){var i;t.done?n(t.value):(i=t.value,i instanceof s?i:new s((function(t){t(i)}))).then(r,h)}a((o=o.apply(t,i||[])).next())}));var t,i,s,o}show(){this.dispatch("isControlsActive",!0)}hide(){this.dispatch("isControlsActive",!1)}hideWithDelay(){clearTimeout(w[k[this]]),w[k[this]]=setTimeout((()=>{this.hide()}),this.activeDuration)}onControlsChange(t){if(clearTimeout(w[k[this]]),!this.hidden&&this.playbackReady)if(this.isAudioView)this.show();else if(!this.waitForPlaybackStart||this.playbackStarted)if(this.isInteracting||this.isSettingsActive)this.show();else if(this.hideWhenPaused&&this.paused)this.hideWithDelay();else{if(!this.hideOnMouseLeave||this.paused||"mouseleave"!==(null==t?void 0:t.type))return this.paused?void this.show():(this.show(),void this.hideWithDelay());this.hide()}else this.hide();else this.hide()}getPosition(){if(this.isAudioView)return{};if("center"===this.pin)return{top:"50%",left:"50%",transform:"translate(-50%, -50%)"};const t=this.pin.split(/(?=[L|R])/).map((t=>t.toLowerCase()));return{[t[0]]:0,[t[1]]:0}}onStartInteraction(){this.isInteracting=!0}onEndInteraction(){this.isInteracting=!1}render(){return i(s,{video:!this.isAudioView},i("div",{style:Object.assign(Object.assign({},this.getPosition()),{flexDirection:this.direction,alignItems:"center"===this.align?"center":`flex-${this.align}`,justifyContent:this.justify}),class:{controls:!0,audio:this.isAudioView,hidden:this.hidden,active:this.playbackReady&&this.isControlsActive,fullWidth:this.isAudioView||this.fullWidth,fullHeight:!this.isAudioView&&this.fullHeight},onMouseEnter:this.onStartInteraction.bind(this),onMouseLeave:this.onEndInteraction.bind(this),onTouchStart:this.onStartInteraction.bind(this),onTouchEnd:this.onEndInteraction.bind(this)},i("slot",null)))}static get watchers(){return{paused:["onControlsChange"],hidden:["onControlsChange"],isAudioView:["onControlsChange"],isInteracting:["onControlsChange"],isSettingsActive:["onControlsChange"],hideWhenPaused:["onControlsChange"],hideOnMouseLeave:["onControlsChange"],playbackStarted:["onControlsChange"],waitForPlaybackStart:["onControlsChange"],playbackReady:["onControlsChange"]}}};C.style=":host{position:relative;width:100%;z-index:var(--vm-controls-z-index)}:host([video]){position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}.controls{display:flex;width:100%;position:absolute;flex-wrap:wrap;pointer-events:auto;box-sizing:border-box;background:var(--vm-controls-bg);padding:var(--vm-controls-padding);border-radius:var(--vm-controls-border-radius);opacity:0;visibility:hidden;transition:var(--vm-fade-transition)}.controls.audio{position:relative}.controls.hidden{display:none}.controls.active{opacity:1;visibility:visible}.controls.fullWidth{width:100%}.controls.fullHeight{height:100%}::slotted(*:not(vm-control-group)){margin-left:var(--vm-controls-spacing)}::slotted(*:not(vm-control-group):first-child){margin-left:0}";const A=class{constructor(i){t(this,i),this.currentTime=0,this.i18n={},this.alwaysShowHours=!1,e(this),u(this,["currentTime","i18n"])}render(){return i("vm-time",{label:this.i18n.currentTime,seconds:this.currentTime,alwaysShowHours:this.alwaysShowHours})}};A.style=":host{display:flex;align-items:center;justify-content:center}";const x=class{constructor(i){t(this,i),this.duration=-1,this.i18n={},this.alwaysShowHours=!1,e(this),u(this,["duration","i18n"])}render(){return i("vm-time",{label:this.i18n.duration,seconds:Math.max(0,this.duration),alwaysShowHours:this.alwaysShowHours})}};x.style=":host{display:flex;align-items:center;justify-content:center}";const S=class{constructor(i){t(this,i),this.canSetFullscreen=!1,this.enterIcon="fullscreen-enter",this.exitIcon="fullscreen-exit",this.tooltipPosition="top",this.hideTooltip=!1,this.keys="f",this.isFullscreenActive=!1,this.i18n={},this.playbackReady=!1,e(this),u(this,["isFullscreenActive","playbackReady","i18n"])}onPlaybackReadyChange(){var t,i,s,o,n;return i=this,s=void 0,n=function*(){const i=r(this);this.canSetFullscreen=null!==(t=yield null==i?void 0:i.canSetFullscreen())&&void 0!==t&&t},new((o=void 0)||(o=Promise))((function(t,e){function r(t){try{a(n.next(t))}catch(t){e(t)}}function h(t){try{a(n.throw(t))}catch(t){e(t)}}function a(i){var s;i.done?t(i.value):(s=i.value,s instanceof o?s:new o((function(t){t(s)}))).then(r,h)}a((n=n.apply(i,s||[])).next())}))}componentDidLoad(){this.onPlaybackReadyChange()}onClick(){const t=r(this);this.isFullscreenActive?null==t||t.exitFullscreen():null==t||t.enterFullscreen()}render(){const t=this.isFullscreenActive?this.i18n.exitFullscreen:this.i18n.enterFullscreen,o=h(this.keys)?t:`${t} (${this.keys})`;return i(s,{hidden:!this.canSetFullscreen},i("vm-control",{label:this.i18n.fullscreen,keys:this.keys,pressed:this.isFullscreenActive,hidden:!this.canSetFullscreen,onClick:this.onClick.bind(this)},i("vm-icon",{name:this.isFullscreenActive?this.exitIcon:this.enterIcon,library:this.icons}),i("vm-tooltip",{hidden:this.hideTooltip,position:this.tooltipPosition,direction:this.tooltipDirection},o)))}static get watchers(){return{playbackReady:["onPlaybackReadyChange"]}}};S.style=":host([hidden]){display:none}";const T=class{constructor(i){t(this,i),this.isLive=!1,this.i18n={},e(this),u(this,["isLive","i18n"])}render(){return i("div",{class:{liveIndicator:!0,hidden:!this.isLive}},i("div",{class:"indicator"}),this.i18n.live)}};T.style=".liveIndicator{display:flex;align-items:center;font-size:13px;font-weight:bold;letter-spacing:0.6px;color:var(--vm-control-color)}.liveIndicator.hidden{display:none}.indicator{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px;background-color:var(--vm-live-indicator-color, red)}";const P=class{constructor(i){t(this,i),this.vmFocus=n(this,"vmFocus",7),this.vmBlur=n(this,"vmBlur",7),this.lowVolumeIcon="volume-low",this.highVolumeIcon="volume-high",this.mutedIcon="volume-mute",this.tooltipPosition="top",this.hideTooltip=!1,this.keys="m",this.volume=50,this.muted=!1,this.i18n={},e(this),u(this,["muted","volume","i18n"])}connectedCallback(){this.dispatch=v(this)}getIcon(){return this.muted||0===this.volume?this.mutedIcon:this.volume<50?this.lowVolumeIcon:this.highVolumeIcon}onClick(){this.dispatch("muted",!this.muted)}render(){const t=this.muted?this.i18n.unmute:this.i18n.mute,s=h(this.keys)?t:`${t} (${this.keys})`;return i("vm-control",{label:this.i18n.mute,pressed:this.muted,keys:this.keys,onClick:this.onClick.bind(this)},i("vm-icon",{name:this.getIcon(),library:this.icons}),i("vm-tooltip",{hidden:this.hideTooltip,position:this.tooltipPosition,direction:this.tooltipDirection},s))}};const _=class{constructor(i){t(this,i),this.canSetPiP=!1,this.enterIcon="pip-enter",this.exitIcon="pip-exit",this.tooltipPosition="top",this.hideTooltip=!1,this.keys="p",this.isPiPActive=!1,this.i18n={},this.playbackReady=!1,e(this),u(this,["isPiPActive","playbackReady","i18n"])}onPlaybackReadyChange(){var t,i,s,o,n;return i=this,s=void 0,n=function*(){const i=r(this);this.canSetPiP=null!==(t=yield null==i?void 0:i.canSetPiP())&&void 0!==t&&t},new((o=void 0)||(o=Promise))((function(t,e){function r(t){try{a(n.next(t))}catch(t){e(t)}}function h(t){try{a(n.throw(t))}catch(t){e(t)}}function a(i){var s;i.done?t(i.value):(s=i.value,s instanceof o?s:new o((function(t){t(s)}))).then(r,h)}a((n=n.apply(i,s||[])).next())}))}componentDidLoad(){this.onPlaybackReadyChange()}onClick(){const t=r(this);this.isPiPActive?null==t||t.exitPiP():null==t||t.enterPiP()}render(){const t=this.isPiPActive?this.i18n.exitPiP:this.i18n.enterPiP,o=h(this.keys)?t:`${t} (${this.keys})`;return i(s,{hidden:!this.canSetPiP},i("vm-control",{label:this.i18n.pip,keys:this.keys,pressed:this.isPiPActive,hidden:!this.canSetPiP,onClick:this.onClick.bind(this)},i("vm-icon",{name:this.isPiPActive?this.exitIcon:this.enterIcon,library:this.icons}),i("vm-tooltip",{hidden:this.hideTooltip,position:this.tooltipPosition,direction:this.tooltipDirection},o)))}static get watchers(){return{playbackReady:["onPlaybackReadyChange"]}}};_.style=":host([hidden]){display:none}";const M=class{constructor(i){t(this,i),this.playIcon="play",this.pauseIcon="pause",this.tooltipPosition="top",this.hideTooltip=!1,this.keys="k",this.paused=!0,this.i18n={},e(this),u(this,["paused","i18n"])}connectedCallback(){this.dispatch=v(this)}onClick(){this.dispatch("paused",!this.paused)}render(){const t=this.paused?this.i18n.play:this.i18n.pause,s=h(this.keys)?t:`${t} (${this.keys})`;return i("vm-control",{label:this.i18n.playback,keys:this.keys,pressed:!this.paused,onClick:this.onClick.bind(this)},i("vm-icon",{name:this.paused?this.playIcon:this.pauseIcon,library:this.icons}),i("vm-tooltip",{hidden:this.hideTooltip,position:this.tooltipPosition,direction:this.tooltipDirection},s))}},K=class{constructor(i){t(this,i),this.isVideoView=!1,this.isControlsActive=!1,e(this),u(this,["isVideoView","isControlsActive"])}render(){return i("div",{class:{scrim:!0,gradient:!h(this.gradient),gradientUp:"up"===this.gradient,gradientDown:"down"===this.gradient,hidden:!this.isVideoView,active:this.isControlsActive}})}};K.style=":host{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:var(--vm-scrim-z-index)}.scrim{position:absolute;width:100%;background:var(--vm-scrim-bg);display:inline-block;opacity:0;visibility:hidden;transition:var(--vm-fade-transition)}.scrim.gradient{height:258px;background:none;background-position:bottom;background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAECCAYAAAA/9r2TAAABKklEQVQ4T2XI50cFABiF8dvee++67b33uM17b1MkkSSSSBJJJIkkkkQSSSKJ9Efmeb8cr86HH88JBP4thkfEkiKOFPGkSCCNRE8SKZJJkUIaqZ40UqSTIoMUmaSR5ckmRQ4pckkjz5NPigJSFJKiiDSKPSWkKCVFGWmUeypIUUmKKlJUk0aNJ0iKWlLUkUa9p4EUjaRoIkUzabR4WknRRop20ujwdJKiixTdpOghjV5PHyn6STFAGoOeIVIMk2KEFKOkMeYZJ8UEKUKkMemZIsU0KWZIMUsac54wKSKkiJLGvGeBFIukWCLFMrkCq7AG67ABm7AF27ADu7AH+3AAh3AEx3ACp3AG53ABl3AF13ADt3AH9/AAj/AEz/ACr/AG7/ABn/AF3/ADv39LujSyJPVJ0QAAAABJRU5ErkJggg==')}.scrim.gradientUp{top:unset;bottom:0}.scrim.gradientDown{transform:rotate(180deg)}.scrim.hidden{display:none}.scrim.active{opacity:1;visibility:visible}";const V=class{constructor(i){t(this,i),this.keyboardDisposal=new a,this.timestamp="",this.endTime=0,this.alwaysShowHours=!1,this.hideTooltip=!1,this.currentTime=0,this.duration=-1,this.noKeyboard=!1,this.buffering=!1,this.buffered=0,this.i18n={},e(this),u(this,["i18n","currentTime","duration","buffering","buffered"])}onNoKeyboardChange(){return t=this,i=void 0,o=function*(){if(this.keyboardDisposal.empty(),this.noKeyboard)return;const t=yield c(this);h(t)||this.keyboardDisposal.add(l(t,"keydown",(t=>{if("ArrowLeft"!==t.key&&"ArrowRight"!==t.key)return;t.preventDefault();const i="ArrowLeft"===t.key?Math.max(0,this.currentTime-5):Math.min(this.duration,this.currentTime+5);this.dispatch("currentTime",i)})))},new((s=void 0)||(s=Promise))((function(n,e){function r(t){try{a(o.next(t))}catch(t){e(t)}}function h(t){try{a(o.throw(t))}catch(t){e(t)}}function a(t){var i;t.done?n(t.value):(i=t.value,i instanceof s?i:new s((function(t){t(i)}))).then(r,h)}a((o=o.apply(t,i||[])).next())}));var t,i,s,o}onDurationChange(){this.endTime=Math.max(0,this.duration)}connectedCallback(){this.dispatch=v(this),this.timestamp=p(this.currentTime,this.alwaysShowHours),this.onNoKeyboardChange()}disconnectedCallback(){this.keyboardDisposal.empty()}setTooltipPosition(t){var i,s;const o=null===(s=null===(i=this.tooltip.shadowRoot)||void 0===i?void 0:i.querySelector(".tooltip"))||void 0===s?void 0:s.getBoundingClientRect(),n=this.slider.getBoundingClientRect(),e=parseFloat(window.getComputedStyle(this.slider).getPropertyValue("--vm-slider-thumb-width")),r=Math.max(o.width/2-e/2,Math.min(t,n.width-o.width/2-e/2));this.tooltip.style=`--vm-tooltip-left: ${r}px`}onSeek(t){this.dispatch("currentTime",t.detail)}onSeeking(t){if(this.duration<0||this.tooltip.hidden)return;if("mouseleave"===t.type)return this.getSliderInput().blur(),void(this.tooltip.active=!1);const i=this.host.getBoundingClientRect(),s=Math.max(0,Math.min(100,100/i.width*(t.pageX-i.left)));this.timestamp=p(this.duration/100*s,this.alwaysShowHours),this.setTooltipPosition(s/100*i.width),this.tooltip.active||(this.getSliderInput().focus(),this.tooltip.active=!0)}getSliderInput(){var t;return null===(t=this.slider.shadowRoot)||void 0===t?void 0:t.querySelector("input")}render(){const t=this.i18n.scrubberLabel.replace(/{currentTime}/,p(this.currentTime)).replace(/{duration}/,p(this.endTime));return i("div",{class:"scrubber",onMouseEnter:this.onSeeking.bind(this),onMouseLeave:this.onSeeking.bind(this),onMouseMove:this.onSeeking.bind(this),onTouchMove:()=>{this.getSliderInput().focus()},onTouchEnd:()=>{this.getSliderInput().blur()}},i("vm-slider",{step:.01,max:this.endTime,value:this.currentTime,label:this.i18n.scrubber,valueText:t,onVmValueChange:this.onSeek.bind(this),ref:t=>{this.slider=t}}),i("progress",{class:{loading:this.buffering},min:0,max:this.endTime,value:this.buffered,"aria-label":this.i18n.buffered,"aria-valuemin":"0","aria-valuemax":this.endTime,"aria-valuenow":this.buffered,"aria-valuetext":`${(this.endTime>0?this.buffered/this.endTime:0).toFixed(0)}%`},"% buffered"),i("vm-tooltip",{hidden:this.hideTooltip,ref:t=>{this.tooltip=t}},this.timestamp))}get host(){return o(this)}static get watchers(){return{noKeyboard:["onNoKeyboardChange"],duration:["onDurationChange"]}}};V.style=":host{--vm-tooltip-spacing:var(--vm-scrubber-tooltip-spacing);flex:1;position:relative;cursor:pointer;pointer-events:auto;box-sizing:border-box;left:calc(var(--vm-slider-thumb-width) / 2);margin-right:var(--vm-slider-thumb-width);margin-bottom:var(--vm-slider-track-height)}@keyframes progress{to{background-position:var(--vm-scrubber-loading-stripe-size) 0}}.scrubber{position:relative;width:100%}vm-slider,progress{margin-left:calc(calc(var(--vm-slider-thumb-width) / 2) * -1);margin-right:calc(calc(var(--vm-slider-thumb-width) / 2) * -1);width:calc(100% + var(--vm-slider-thumb-width));height:var(--vm-slider-track-height)}vm-slider:hover,progress:hover{cursor:pointer}vm-slider{position:absolute;top:0;left:0;z-index:3}progress{-webkit-appearance:none;background:transparent;border:0;border-radius:100px;position:absolute;left:0;top:50%;padding:0;color:var(--vm-scrubber-buffered-bg);height:var(--vm-slider-track-height)}progress::-webkit-progress-bar{background:transparent}progress::-webkit-progress-value{background:currentColor;border-radius:100px;min-width:var(--vm-slider-track-height);transition:width 0.2s ease}progress::-moz-progress-bar{background:currentColor;border-radius:100px;min-width:var(--vm-slider-track-height);transition:width 0.2s ease}progress::-ms-fill{border-radius:100px;transition:width 0.2s ease}progress.loading{animation:progress 1s linear infinite;background-image:linear-gradient(\n    -45deg,\n    var(--vm-scrubber-loading-stripe-color) 25%,\n    transparent 25%,\n    transparent 50%,\n    var(--vm-scrubber-loading-stripe-color) 50%,\n    var(--vm-scrubber-loading-stripe-color) 75%,\n    transparent 75%,\n    transparent\n  );background-repeat:repeat-x;background-size:var(--vm-scrubber-loading-stripe-size)\n    var(--vm-scrubber-loading-stripe-size);color:transparent;background-color:transparent}";var I=function(t,i,s,o){return new(s||(s=Promise))((function(n,e){function r(t){try{a(o.next(t))}catch(t){e(t)}}function h(t){try{a(o.throw(t))}catch(t){e(t)}}function a(t){var i;t.done?n(t.value):(i=t.value,i instanceof s?i:new s((function(t){t(i)}))).then(r,h)}a((o=o.apply(t,i||[])).next())}))};let R=0;const U=class{constructor(i){t(this,i),this.icon="settings",this.tooltipPosition="top",this.expanded=!1,this.i18n={},this.hideTooltip=!1,e(this),u(this,["i18n"])}onComponentsChange(){h(this.vmSettings)||this.vmSettings.setController(this.host)}connectedCallback(){R+=1,this.id=`vm-settings-control-${R}`,d(this,"vm-settings",(t=>{[this.vmSettings]=t}))}focusControl(){var t;return I(this,void 0,void 0,(function*(){null===(t=this.control)||void 0===t||t.focusControl()}))}blurControl(){var t;return I(this,void 0,void 0,(function*(){null===(t=this.control)||void 0===t||t.blurControl()}))}render(){const t=!h(this.menu);return i("div",{class:{settingsControl:!0,hidden:!t,active:t&&this.expanded}},i("vm-control",{identifier:this.id,menu:this.menu,hidden:!t,expanded:this.expanded,label:this.i18n.settings,ref:t=>{this.control=t}},i("vm-icon",{name:this.icon,library:this.icons}),i("vm-tooltip",{hidden:this.hideTooltip||this.expanded,position:this.tooltipPosition,direction:this.tooltipDirection},this.i18n.settings)))}get host(){return o(this)}static get watchers(){return{vmSettings:["onComponentsChange"]}}};U.style=".settingsControl.hidden{display:none}.settingsControl{--vm-icon-transition:transform 0.3s ease}.settingsControl.active{--vm-icon-transform:rotate(90deg)}";const z=class{constructor(i){t(this,i),this.separator="/",this.alwaysShowHours=!1,e(this)}render(){return i("div",{class:"timeProgress"},i("vm-current-time",{alwaysShowHours:this.alwaysShowHours}),i("span",{class:"separator"},this.separator),i("vm-end-time",{alwaysShowHours:this.alwaysShowHours}))}};z.style=".timeProgress{display:flex;width:100%;height:100%;align-items:center;color:var(--vm-time-color)}.separator{margin:0 4px}";const j=class{constructor(i){t(this,i),this.keyboardDisposal=new a,this.prevMuted=!1,this.currentVolume=50,this.isSliderActive=!1,this.lowVolumeIcon="volume-low",this.highVolumeIcon="volume-high",this.mutedIcon="volume-mute",this.tooltipPosition="top",this.hideTooltip=!1,this.muteKeys="m",this.noKeyboard=!1,this.muted=!1,this.volume=50,this.isMobile=!1,this.i18n={},e(this),u(this,["volume","muted","isMobile","i18n"])}onNoKeyboardChange(){return t=this,i=void 0,o=function*(){if(this.keyboardDisposal.empty(),this.noKeyboard)return;const t=yield c(this);h(t)||this.keyboardDisposal.add(l(t,"keydown",(t=>{if("ArrowUp"!==t.key&&"ArrowDown"!==t.key)return;const i="ArrowUp"===t.key?Math.min(100,this.volume+5):Math.max(0,this.volume-5);this.dispatch("volume",parseInt(`${i}`,10))})))},new((s=void 0)||(s=Promise))((function(n,e){function r(t){try{a(o.next(t))}catch(t){e(t)}}function h(t){try{a(o.throw(t))}catch(t){e(t)}}function a(t){var i;t.done?n(t.value):(i=t.value,i instanceof s?i:new s((function(t){t(i)}))).then(r,h)}a((o=o.apply(t,i||[])).next())}));var t,i,s,o}onPlayerVolumeChange(){this.currentVolume=this.muted?0:this.volume,!this.muted&&this.prevMuted&&0===this.volume&&this.dispatch("volume",30),this.prevMuted=this.muted}connectedCallback(){this.prevMuted=this.muted,this.dispatch=v(this),this.onNoKeyboardChange()}disconnectedCallback(){this.keyboardDisposal.empty()}onShowSlider(){clearTimeout(this.hideSliderTimeout),this.isSliderActive=!0}onHideSlider(){this.hideSliderTimeout=setTimeout((()=>{this.isSliderActive=!1}),100)}onVolumeChange(t){const i=t.detail;this.currentVolume=i,this.dispatch("volume",i),this.dispatch("muted",0===i)}onKeyDown(t){"ArrowLeft"!==t.key&&"ArrowRight"!==t.key||t.stopPropagation()}render(){return i("div",{class:"volumeControl",onMouseEnter:this.onShowSlider.bind(this),onMouseLeave:this.onHideSlider.bind(this)},i("vm-mute-control",{keys:this.muteKeys,lowVolumeIcon:this.lowVolumeIcon,highVolumeIcon:this.highVolumeIcon,mutedIcon:this.mutedIcon,icons:this.icons,tooltipPosition:this.tooltipPosition,tooltipDirection:this.tooltipDirection,hideTooltip:this.hideTooltip,onVmFocus:this.onShowSlider.bind(this),onVmBlur:this.onHideSlider.bind(this)}),i("vm-slider",{class:{hidden:this.isMobile,active:this.isSliderActive},step:5,max:100,value:this.currentVolume,label:this.i18n.volume,onKeyDown:this.onKeyDown.bind(this),onVmFocus:this.onShowSlider.bind(this),onVmBlur:this.onHideSlider.bind(this),onVmValueChange:this.onVolumeChange.bind(this)}))}static get watchers(){return{noKeyboard:["onNoKeyboardChange"],muted:["onPlayerVolumeChange"],volume:["onPlayerVolumeChange"]}}};j.style=".volumeControl{align-items:center;display:flex;position:relative;pointer-events:auto;box-sizing:border-box}vm-slider{width:75px;height:100%;margin:0;max-width:0;position:relative;z-index:3;transition:margin 0.2s cubic-bezier(0.4, 0, 1, 1),\n    max-width 0.2s cubic-bezier(0.4, 0, 1, 1);margin-left:calc(var(--vm-control-spacing) / 2) !important;visibility:hidden}vm-slider:hover{cursor:pointer}vm-slider.hidden{display:none}vm-slider.active{max-width:75px;visibility:visible;margin:0 calc(var(--vm-control-spacing) / 2)}";export{g as vm_caption_control,b as vm_control_group,f as vm_control_spacer,C as vm_controls,A as vm_current_time,x as vm_end_time,S as vm_fullscreen_control,T as vm_live_indicator,P as vm_mute_control,_ as vm_pip_control,M as vm_playback_control,K as vm_scrim,V as vm_scrubber_control,U as vm_settings_control,z as vm_time_progress,j as vm_volume_control}
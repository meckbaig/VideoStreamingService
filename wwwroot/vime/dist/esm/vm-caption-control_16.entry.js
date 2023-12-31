import { r as registerInstance, h, H as Host, g as getElement, c as createEvent } from './index-f5fd0f81.js';
import { c as withComponentRegistry, a as getPlayerFromRegistry, e as isUndefined, D as Disposal, f as findPlayer, l as listen, w as watchComponentRegistry } from './withComponentRegistry-28311671.js';
import { w as withPlayerContext } from './withPlayerContext-4c52f564.js';
import { c as createDispatcher } from './PlayerDispatcher-de9282f5.js';
import { r as registerControlsForCollisionDetection } from './withControlsCollisionDetection-ebad8447.js';
import { f as formatTime } from './formatters-1343ea73.js';
import './PlayerEvents-5c5704d6.js';

const captionControlCss = ":host([hidden]){display:none}";

var __awaiter$6 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try {
      step(generator.next(value));
    }
    catch (e) {
      reject(e);
    } }
    function rejected(value) { try {
      step(generator["throw"](value));
    }
    catch (e) {
      reject(e);
    } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const CaptionControl = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.canToggleCaptionVisibility = false;
    /**
     * The URL to an SVG element or fragment to load.
     */
    this.showIcon = 'captions-on';
    /**
     * The URL to an SVG element or fragment to load.
     */
    this.hideIcon = 'captions-off';
    /**
     * Whether the tooltip is positioned above/below the control.
     */
    this.tooltipPosition = 'top';
    /**
     * Whether the tooltip should not be displayed.
     */
    this.hideTooltip = false;
    /** @inheritdoc */
    this.keys = 'c';
    /** @internal */
    this.i18n = {};
    /** @internal */
    this.playbackReady = false;
    /** @internal */
    this.textTracks = [];
    /** @internal */
    this.isTextTrackVisible = false;
    withComponentRegistry(this);
    withPlayerContext(this, [
      'i18n',
      'textTracks',
      'isTextTrackVisible',
      'playbackReady',
    ]);
  }
  onTextTracksChange() {
    var _a;
    return __awaiter$6(this, void 0, void 0, function* () {
      const player = getPlayerFromRegistry(this);
      this.canToggleCaptionVisibility =
        this.textTracks.length > 0 &&
          ((_a = (yield (player === null || player === void 0 ? void 0 : player.canSetTextTrackVisibility()))) !== null && _a !== void 0 ? _a : false);
    });
  }
  componentDidLoad() {
    this.onTextTracksChange();
  }
  onClick() {
    var _a;
    const player = getPlayerFromRegistry(this);
    (_a = player === null || player === void 0 ? void 0 : player.setTextTrackVisibility) === null || _a === void 0 ? void 0 : _a.call(player, !this.isTextTrackVisible);
  }
  render() {
    const tooltip = this.isTextTrackVisible
      ? this.i18n.disableCaptions
      : this.i18n.enableCaptions;
    const tooltipWithHint = !isUndefined(this.keys)
      ? `${tooltip} (${this.keys})`
      : tooltip;
    return (h(Host, { hidden: !this.canToggleCaptionVisibility }, h("vm-control", { label: this.i18n.captions, keys: this.keys, hidden: !this.canToggleCaptionVisibility, pressed: this.isTextTrackVisible, onClick: this.onClick.bind(this) }, h("vm-icon", { name: this.isTextTrackVisible ? this.showIcon : this.hideIcon, library: this.icons }), h("vm-tooltip", { hidden: this.hideTooltip, position: this.tooltipPosition, direction: this.tooltipDirection }, tooltipWithHint))));
  }
  static get watchers() { return {
    "textTracks": ["onTextTracksChange"],
    "playbackReady": ["onTextTracksChange"]
  }; }
};
CaptionControl.style = captionControlCss;

const controlGroupCss = ":host{width:100%}.controlGroup{position:relative;width:100%;display:flex;flex-wrap:wrap;flex-direction:inherit;align-items:inherit;justify-content:inherit;box-sizing:border-box}.controlGroup.spaceTop{margin-top:var(--vm-control-group-spacing)}.controlGroup.spaceBottom{margin-bottom:var(--vm-control-group-spacing)}::slotted(*){margin-left:var(--vm-controls-spacing)}::slotted(*:first-child){margin-left:0}";

const ControlNewLine = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    /**
     * Determines where to add spacing/margin. The amount of spacing is determined by the CSS variable
     * `--control-group-spacing`.
     */
    this.space = 'none';
    withComponentRegistry(this);
  }
  render() {
    return (h("div", { class: {
        controlGroup: true,
        spaceTop: this.space !== 'none' && this.space !== 'bottom',
        spaceBottom: this.space !== 'none' && this.space !== 'top',
      } }, h("slot", null)));
  }
  get host() { return getElement(this); }
};
ControlNewLine.style = controlGroupCss;

const controlSpacerCss = ":host{flex:1}";

const ControlSpacer = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    withComponentRegistry(this);
  }
};
ControlSpacer.style = controlSpacerCss;

const debounce = (func, wait = 1000, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    const later = function delayedFunctionCall() {
      timeout = undefined;
      if (!immediate)
        func.apply(context, args);
    };
    const callNow = immediate && isUndefined(timeout);
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow)
      func.apply(context, args);
  };
};

const controlsCss = ":host{position:relative;width:100%;z-index:var(--vm-controls-z-index)}:host([video]){position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}.controls{display:flex;width:100%;position:absolute;flex-wrap:wrap;pointer-events:auto;box-sizing:border-box;background:var(--vm-controls-bg);padding:var(--vm-controls-padding);border-radius:var(--vm-controls-border-radius);opacity:0;visibility:hidden;transition:var(--vm-fade-transition)}.controls.audio{position:relative}.controls.hidden{display:none}.controls.active{opacity:1;visibility:visible}.controls.fullWidth{width:100%}.controls.fullHeight{height:100%}::slotted(*:not(vm-control-group)){margin-left:var(--vm-controls-spacing)}::slotted(*:not(vm-control-group):first-child){margin-left:0}";

var __awaiter$5 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try {
      step(generator.next(value));
    }
    catch (e) {
      reject(e);
    } }
    function rejected(value) { try {
      step(generator["throw"](value));
    }
    catch (e) {
      reject(e);
    } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
/**
 * We want to keep the controls active state in-sync per player.
 */
const playerRef = {};
const hideControlsTimeout = {};
const Controls = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.disposal = new Disposal();
    this.isInteracting = false;
    /**
     * Whether the controls are visible or not.
     */
    this.hidden = false;
    /**
     * Whether the controls container should be 100% width. This has no effect if the view is of
     * type `audio`.
     */
    this.fullWidth = false;
    /**
     * Whether the controls container should be 100% height. This has no effect if the view is of
     * type `audio`.
     */
    this.fullHeight = false;
    /**
     * Sets the `flex-direction` property that manages the direction in which the controls are layed
     * out.
     */
    this.direction = 'row';
    /**
     * Sets the `align-items` flex property that aligns the individual controls on the cross-axis.
     */
    this.align = 'center';
    /**
     * Sets the `justify-content` flex property that aligns the individual controls on the main-axis.
     */
    this.justify = 'start';
    /**
     * Pins the controls to the defined position inside the video player. This has no effect when
     * the view is of type `audio`.
     */
    this.pin = 'bottomLeft';
    /**
     * The length in milliseconds that the controls are active for before fading out. Audio players
     * are not effected by this prop.
     */
    this.activeDuration = 2750;
    /**
     * Whether the controls should wait for playback to start before being shown. Audio players
     * are not effected by this prop.
     */
    this.waitForPlaybackStart = false;
    /**
     * Whether the controls should show/hide when paused. Audio players are not effected by this prop.
     */
    this.hideWhenPaused = false;
    /**
     * Whether the controls should hide when the mouse leaves the player. Audio players are not
     * effected by this prop.
     */
    this.hideOnMouseLeave = false;
    /** @internal */
    this.isAudioView = false;
    /** @internal */
    this.isSettingsActive = false;
    /** @internal */
    this.playbackReady = false;
    /** @internal */
    this.isControlsActive = false;
    /** @internal */
    this.paused = true;
    /** @internal */
    this.playbackStarted = false;
    withComponentRegistry(this);
    registerControlsForCollisionDetection(this);
    withPlayerContext(this, [
      'playbackReady',
      'isAudioView',
      'isControlsActive',
      'isSettingsActive',
      'paused',
      'playbackStarted',
    ]);
  }
  connectedCallback() {
    this.dispatch = createDispatcher(this);
    this.onControlsChange();
    this.setupPlayerListeners();
  }
  componentWillLoad() {
    this.onControlsChange();
  }
  disconnectedCallback() {
    this.disposal.empty();
    delete hideControlsTimeout[playerRef[this]];
    delete playerRef[this];
  }
  setupPlayerListeners() {
    return __awaiter$5(this, void 0, void 0, function* () {
      const player = yield findPlayer(this);
      if (isUndefined(player))
        return;
      const events = ['focus', 'keydown', 'click', 'touchstart', 'mouseleave'];
      events.forEach(event => {
        this.disposal.add(listen(player, event, this.onControlsChange.bind(this)));
      });
      this.disposal.add(listen(player, 'mousemove', debounce(this.onControlsChange, 50, true).bind(this)));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      playerRef[this] = player;
    });
  }
  show() {
    this.dispatch('isControlsActive', true);
  }
  hide() {
    this.dispatch('isControlsActive', false);
  }
  hideWithDelay() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    clearTimeout(hideControlsTimeout[playerRef[this]]);
    hideControlsTimeout[playerRef[this]] = setTimeout(() => {
      this.hide();
    }, this.activeDuration);
  }
  onControlsChange(event) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    clearTimeout(hideControlsTimeout[playerRef[this]]);
    if (this.hidden || !this.playbackReady) {
      this.hide();
      return;
    }
    if (this.isAudioView) {
      this.show();
      return;
    }
    if (this.waitForPlaybackStart && !this.playbackStarted) {
      this.hide();
      return;
    }
    if (this.isInteracting || this.isSettingsActive) {
      this.show();
      return;
    }
    if (this.hideWhenPaused && this.paused) {
      this.hideWithDelay();
      return;
    }
    if (this.hideOnMouseLeave && !this.paused && (event === null || event === void 0 ? void 0 : event.type) === 'mouseleave') {
      this.hide();
      return;
    }
    if (!this.paused) {
      this.show();
      this.hideWithDelay();
      return;
    }
    this.show();
  }
  getPosition() {
    if (this.isAudioView)
      return {};
    if (this.pin === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }
    // topLeft => { top: 0, left: 0 }
    const pos = this.pin.split(/(?=[L|R])/).map(s => s.toLowerCase());
    return { [pos[0]]: 0, [pos[1]]: 0 };
  }
  onStartInteraction() {
    this.isInteracting = true;
  }
  onEndInteraction() {
    this.isInteracting = false;
  }
  render() {
    return (h(Host, { video: !this.isAudioView }, h("div", { style: Object.assign(Object.assign({}, this.getPosition()), { flexDirection: this.direction, alignItems: this.align === 'center' ? 'center' : `flex-${this.align}`, justifyContent: this.justify }), class: {
        controls: true,
        audio: this.isAudioView,
        hidden: this.hidden,
        active: this.playbackReady && this.isControlsActive,
        fullWidth: this.isAudioView || this.fullWidth,
        fullHeight: !this.isAudioView && this.fullHeight,
      }, onMouseEnter: this.onStartInteraction.bind(this), onMouseLeave: this.onEndInteraction.bind(this), onTouchStart: this.onStartInteraction.bind(this), onTouchEnd: this.onEndInteraction.bind(this) }, h("slot", null))));
  }
  static get watchers() { return {
    "paused": ["onControlsChange"],
    "hidden": ["onControlsChange"],
    "isAudioView": ["onControlsChange"],
    "isInteracting": ["onControlsChange"],
    "isSettingsActive": ["onControlsChange"],
    "hideWhenPaused": ["onControlsChange"],
    "hideOnMouseLeave": ["onControlsChange"],
    "playbackStarted": ["onControlsChange"],
    "waitForPlaybackStart": ["onControlsChange"],
    "playbackReady": ["onControlsChange"]
  }; }
};
Controls.style = controlsCss;

const currentTimeCss = ":host{display:flex;align-items:center;justify-content:center}";

const CurrentTime = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    /** @internal */
    this.currentTime = 0;
    /** @internal */
    this.i18n = {};
    /**
     * Whether the time should always show the hours unit, even if the time is less than
     * 1 hour (eg: `20:35` -> `00:20:35`).
     */
    this.alwaysShowHours = false;
    withComponentRegistry(this);
    withPlayerContext(this, ['currentTime', 'i18n']);
  }
  render() {
    return (h("vm-time", { label: this.i18n.currentTime, seconds: this.currentTime, alwaysShowHours: this.alwaysShowHours }));
  }
};
CurrentTime.style = currentTimeCss;

const endTimeCss = ":host{display:flex;align-items:center;justify-content:center}";

const EndTime = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    /** @internal */
    this.duration = -1;
    /** @internal */
    this.i18n = {};
    /**
     * Whether the time should always show the hours unit, even if the time is less than
     * 1 hour (eg: `20:35` -> `00:20:35`).
     */
    this.alwaysShowHours = false;
    withComponentRegistry(this);
    withPlayerContext(this, ['duration', 'i18n']);
  }
  render() {
    return (h("vm-time", { label: this.i18n.duration, seconds: Math.max(0, this.duration), alwaysShowHours: this.alwaysShowHours }));
  }
};
EndTime.style = endTimeCss;

const fullscreenControlCss = ":host([hidden]){display:none}";

var __awaiter$4 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try {
      step(generator.next(value));
    }
    catch (e) {
      reject(e);
    } }
    function rejected(value) { try {
      step(generator["throw"](value));
    }
    catch (e) {
      reject(e);
    } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const FullscreenControl = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.canSetFullscreen = false;
    /**
     * The name of the enter fullscreen icon to resolve from the icon library.
     */
    this.enterIcon = 'fullscreen-enter';
    /**
     * The name of the exit fullscreen icon to resolve from the icon library.
     */
    this.exitIcon = 'fullscreen-exit';
    /**
     * Whether the tooltip is positioned above/below the control.
     */
    this.tooltipPosition = 'top';
    /**
     * Whether the tooltip should not be displayed.
     */
    this.hideTooltip = false;
    /** @inheritdoc */
    this.keys = 'f';
    /** @internal */
    this.isFullscreenActive = false;
    /** @internal */
    this.i18n = {};
    /** @internal */
    this.playbackReady = false;
    withComponentRegistry(this);
    withPlayerContext(this, ['isFullscreenActive', 'playbackReady', 'i18n']);
  }
  onPlaybackReadyChange() {
    var _a;
    return __awaiter$4(this, void 0, void 0, function* () {
      const player = getPlayerFromRegistry(this);
      this.canSetFullscreen = (_a = (yield (player === null || player === void 0 ? void 0 : player.canSetFullscreen()))) !== null && _a !== void 0 ? _a : false;
    });
  }
  componentDidLoad() {
    this.onPlaybackReadyChange();
  }
  onClick() {
    const player = getPlayerFromRegistry(this);
    !this.isFullscreenActive
      ? player === null || player === void 0 ? void 0 : player.enterFullscreen()
      : player === null || player === void 0 ? void 0 : player.exitFullscreen();
  }
  render() {
    const tooltip = this.isFullscreenActive
      ? this.i18n.exitFullscreen
      : this.i18n.enterFullscreen;
    const tooltipWithHint = !isUndefined(this.keys)
      ? `${tooltip} (${this.keys})`
      : tooltip;
    return (h(Host, { hidden: !this.canSetFullscreen }, h("vm-control", { label: this.i18n.fullscreen, keys: this.keys, pressed: this.isFullscreenActive, hidden: !this.canSetFullscreen, onClick: this.onClick.bind(this) }, h("vm-icon", { name: this.isFullscreenActive ? this.exitIcon : this.enterIcon, library: this.icons }), h("vm-tooltip", { hidden: this.hideTooltip, position: this.tooltipPosition, direction: this.tooltipDirection }, tooltipWithHint))));
  }
  static get watchers() { return {
    "playbackReady": ["onPlaybackReadyChange"]
  }; }
};
FullscreenControl.style = fullscreenControlCss;

const liveIndicatorCss = ".liveIndicator{display:flex;align-items:center;font-size:13px;font-weight:bold;letter-spacing:0.6px;color:var(--vm-control-color)}.liveIndicator.hidden{display:none}.indicator{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px;background-color:var(--vm-live-indicator-color, red)}";

const LiveIndicator = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    /** @internal */
    this.isLive = false;
    /** @internal */
    this.i18n = {};
    withComponentRegistry(this);
    withPlayerContext(this, ['isLive', 'i18n']);
  }
  render() {
    return (h("div", { class: {
        liveIndicator: true,
        hidden: !this.isLive,
      } }, h("div", { class: "indicator" }), this.i18n.live));
  }
};
LiveIndicator.style = liveIndicatorCss;

const MuteControl = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.vmFocus = createEvent(this, "vmFocus", 7);
    this.vmBlur = createEvent(this, "vmBlur", 7);
    /**
     * The name of the low volume icon to resolve from the icon library.
     */
    this.lowVolumeIcon = 'volume-low';
    /**
     * The name of the high volume icon to resolve from the icon library.
     */
    this.highVolumeIcon = 'volume-high';
    /**
     * The name of the muted volume icon to resolve from the icon library.
     */
    this.mutedIcon = 'volume-mute';
    /**
     * Whether the tooltip is positioned above/below the control.
     */
    this.tooltipPosition = 'top';
    /**
     * Whether the tooltip should not be displayed.
     */
    this.hideTooltip = false;
    /** @inheritdoc */
    this.keys = 'm';
    /** @internal */
    this.volume = 50;
    /** @internal */
    this.muted = false;
    /** @internal */
    this.i18n = {};
    withComponentRegistry(this);
    withPlayerContext(this, ['muted', 'volume', 'i18n']);
  }
  connectedCallback() {
    this.dispatch = createDispatcher(this);
  }
  getIcon() {
    const volumeIcon = this.volume < 50 ? this.lowVolumeIcon : this.highVolumeIcon;
    return this.muted || this.volume === 0 ? this.mutedIcon : volumeIcon;
  }
  onClick() {
    this.dispatch('muted', !this.muted);
  }
  render() {
    const tooltip = this.muted ? this.i18n.unmute : this.i18n.mute;
    const tooltipWithHint = !isUndefined(this.keys)
      ? `${tooltip} (${this.keys})`
      : tooltip;
    return (h("vm-control", { label: this.i18n.mute, pressed: this.muted, keys: this.keys, onClick: this.onClick.bind(this) }, h("vm-icon", { name: this.getIcon(), library: this.icons }), h("vm-tooltip", { hidden: this.hideTooltip, position: this.tooltipPosition, direction: this.tooltipDirection }, tooltipWithHint)));
  }
};

const pipControlCss = ":host([hidden]){display:none}";

var __awaiter$3 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try {
      step(generator.next(value));
    }
    catch (e) {
      reject(e);
    } }
    function rejected(value) { try {
      step(generator["throw"](value));
    }
    catch (e) {
      reject(e);
    } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const PiPControl = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.canSetPiP = false;
    /**
     * The name of the enter pip icon to resolve from the icon library.
     */
    this.enterIcon = 'pip-enter';
    /**
     * The name of the exit pip icon to resolve from the icon library.
     */
    this.exitIcon = 'pip-exit';
    /**
     * Whether the tooltip is positioned above/below the control.
     */
    this.tooltipPosition = 'top';
    /**
     * Whether the tooltip should not be displayed.
     */
    this.hideTooltip = false;
    /** @inheritdoc */
    this.keys = 'p';
    /** @internal */
    this.isPiPActive = false;
    /** @internal */
    this.i18n = {};
    /** @internal */
    this.playbackReady = false;
    withComponentRegistry(this);
    withPlayerContext(this, ['isPiPActive', 'playbackReady', 'i18n']);
  }
  onPlaybackReadyChange() {
    var _a;
    return __awaiter$3(this, void 0, void 0, function* () {
      const player = getPlayerFromRegistry(this);
      this.canSetPiP = (_a = (yield (player === null || player === void 0 ? void 0 : player.canSetPiP()))) !== null && _a !== void 0 ? _a : false;
    });
  }
  componentDidLoad() {
    this.onPlaybackReadyChange();
  }
  onClick() {
    const player = getPlayerFromRegistry(this);
    !this.isPiPActive ? player === null || player === void 0 ? void 0 : player.enterPiP() : player === null || player === void 0 ? void 0 : player.exitPiP();
  }
  render() {
    const tooltip = this.isPiPActive ? this.i18n.exitPiP : this.i18n.enterPiP;
    const tooltipWithHint = !isUndefined(this.keys)
      ? `${tooltip} (${this.keys})`
      : tooltip;
    return (h(Host, { hidden: !this.canSetPiP }, h("vm-control", { label: this.i18n.pip, keys: this.keys, pressed: this.isPiPActive, hidden: !this.canSetPiP, onClick: this.onClick.bind(this) }, h("vm-icon", { name: this.isPiPActive ? this.exitIcon : this.enterIcon, library: this.icons }), h("vm-tooltip", { hidden: this.hideTooltip, position: this.tooltipPosition, direction: this.tooltipDirection }, tooltipWithHint))));
  }
  static get watchers() { return {
    "playbackReady": ["onPlaybackReadyChange"]
  }; }
};
PiPControl.style = pipControlCss;

const PlaybackControl = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    /**
     * The name of the play icon to resolve from the icon library.
     */
    this.playIcon = 'play';
    /**
     * The name of the pause icon to resolve from the icon library.
     */
    this.pauseIcon = 'pause';
    /**
     * Whether the tooltip is positioned above/below the control.
     */
    this.tooltipPosition = 'top';
    /**
     * Whether the tooltip should not be displayed.
     */
    this.hideTooltip = false;
    /** @inheritdoc */
    this.keys = 'k';
    /** @internal */
    this.paused = true;
    /** @internal */
    this.i18n = {};
    withComponentRegistry(this);
    withPlayerContext(this, ['paused', 'i18n']);
  }
  connectedCallback() {
    this.dispatch = createDispatcher(this);
  }
  onClick() {
    this.dispatch('paused', !this.paused);
  }
  render() {
    const tooltip = this.paused ? this.i18n.play : this.i18n.pause;
    const tooltipWithHint = !isUndefined(this.keys)
      ? `${tooltip} (${this.keys})`
      : tooltip;
    return (h("vm-control", { label: this.i18n.playback, keys: this.keys, pressed: !this.paused, onClick: this.onClick.bind(this) }, h("vm-icon", { name: this.paused ? this.playIcon : this.pauseIcon, library: this.icons }), h("vm-tooltip", { hidden: this.hideTooltip, position: this.tooltipPosition, direction: this.tooltipDirection }, tooltipWithHint)));
  }
};

const scrimCss = ":host{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:var(--vm-scrim-z-index)}.scrim{position:absolute;width:100%;background:var(--vm-scrim-bg);display:inline-block;opacity:0;visibility:hidden;transition:var(--vm-fade-transition)}.scrim.gradient{height:258px;background:none;background-position:bottom;background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAECCAYAAAA/9r2TAAABKklEQVQ4T2XI50cFABiF8dvee++67b33uM17b1MkkSSSSBJJJIkkkkQSSSKJ9Efmeb8cr86HH88JBP4thkfEkiKOFPGkSCCNRE8SKZJJkUIaqZ40UqSTIoMUmaSR5ckmRQ4pckkjz5NPigJSFJKiiDSKPSWkKCVFGWmUeypIUUmKKlJUk0aNJ0iKWlLUkUa9p4EUjaRoIkUzabR4WknRRop20ujwdJKiixTdpOghjV5PHyn6STFAGoOeIVIMk2KEFKOkMeYZJ8UEKUKkMemZIsU0KWZIMUsac54wKSKkiJLGvGeBFIukWCLFMrkCq7AG67ABm7AF27ADu7AH+3AAh3AEx3ACp3AG53ABl3AF13ADt3AH9/AAj/AEz/ACr/AG7/ABn/AF3/ADv39LujSyJPVJ0QAAAABJRU5ErkJggg==')}.scrim.gradientUp{top:unset;bottom:0}.scrim.gradientDown{transform:rotate(180deg)}.scrim.hidden{display:none}.scrim.active{opacity:1;visibility:visible}";

const Scrim = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    /** @internal */
    this.isVideoView = false;
    /** @internal */
    this.isControlsActive = false;
    withComponentRegistry(this);
    withPlayerContext(this, ['isVideoView', 'isControlsActive']);
  }
  render() {
    return (h("div", { class: {
        scrim: true,
        gradient: !isUndefined(this.gradient),
        gradientUp: this.gradient === 'up',
        gradientDown: this.gradient === 'down',
        hidden: !this.isVideoView,
        active: this.isControlsActive,
      } }));
  }
};
Scrim.style = scrimCss;

const scrubberControlCss = ":host{--vm-tooltip-spacing:var(--vm-scrubber-tooltip-spacing);flex:1;position:relative;cursor:pointer;pointer-events:auto;box-sizing:border-box;left:calc(var(--vm-slider-thumb-width) / 2);margin-right:var(--vm-slider-thumb-width);margin-bottom:var(--vm-slider-track-height)}@keyframes progress{to{background-position:var(--vm-scrubber-loading-stripe-size) 0}}.scrubber{position:relative;width:100%}vm-slider,progress{margin-left:calc(calc(var(--vm-slider-thumb-width) / 2) * -1);margin-right:calc(calc(var(--vm-slider-thumb-width) / 2) * -1);width:calc(100% + var(--vm-slider-thumb-width));height:var(--vm-slider-track-height)}vm-slider:hover,progress:hover{cursor:pointer}vm-slider{position:absolute;top:0;left:0;z-index:3}progress{-webkit-appearance:none;background:transparent;border:0;border-radius:100px;position:absolute;left:0;top:50%;padding:0;color:var(--vm-scrubber-buffered-bg);height:var(--vm-slider-track-height)}progress::-webkit-progress-bar{background:transparent}progress::-webkit-progress-value{background:currentColor;border-radius:100px;min-width:var(--vm-slider-track-height);transition:width 0.2s ease}progress::-moz-progress-bar{background:currentColor;border-radius:100px;min-width:var(--vm-slider-track-height);transition:width 0.2s ease}progress::-ms-fill{border-radius:100px;transition:width 0.2s ease}progress.loading{animation:progress 1s linear infinite;background-image:linear-gradient(\n    -45deg,\n    var(--vm-scrubber-loading-stripe-color) 25%,\n    transparent 25%,\n    transparent 50%,\n    var(--vm-scrubber-loading-stripe-color) 50%,\n    var(--vm-scrubber-loading-stripe-color) 75%,\n    transparent 75%,\n    transparent\n  );background-repeat:repeat-x;background-size:var(--vm-scrubber-loading-stripe-size)\n    var(--vm-scrubber-loading-stripe-size);color:transparent;background-color:transparent}";

var __awaiter$2 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try {
      step(generator.next(value));
    }
    catch (e) {
      reject(e);
    } }
    function rejected(value) { try {
      step(generator["throw"](value));
    }
    catch (e) {
      reject(e);
    } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const ScrubberControl = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.keyboardDisposal = new Disposal();
    this.timestamp = '';
    this.endTime = 0;
    /**
     * Whether the timestamp in the tooltip should show the hours unit, even if the time is less than
     * 1 hour (eg: `20:35` -> `00:20:35`).
     */
    this.alwaysShowHours = false;
    /**
     * Whether the tooltip should not be displayed.
     */
    this.hideTooltip = false;
    /** @internal */
    this.currentTime = 0;
    /** @internal */
    this.duration = -1;
    /**
     * Prevents seeking forward/backward by using the Left/Right arrow keys.
     */
    this.noKeyboard = false;
    /** @internal */
    this.buffering = false;
    /** @internal */
    this.buffered = 0;
    /** @internal */
    this.i18n = {};
    withComponentRegistry(this);
    withPlayerContext(this, [
      'i18n',
      'currentTime',
      'duration',
      'buffering',
      'buffered',
    ]);
  }
  onNoKeyboardChange() {
    return __awaiter$2(this, void 0, void 0, function* () {
      this.keyboardDisposal.empty();
      if (this.noKeyboard)
        return;
      const player = yield findPlayer(this);
      if (isUndefined(player))
        return;
      const onKeyDown = (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
          return;
        event.preventDefault();
        const isLeftArrow = event.key === 'ArrowLeft';
        const seekTo = isLeftArrow
          ? Math.max(0, this.currentTime - 5)
          : Math.min(this.duration, this.currentTime + 5);
        this.dispatch('currentTime', seekTo);
      };
      this.keyboardDisposal.add(listen(player, 'keydown', onKeyDown));
    });
  }
  onDurationChange() {
    // Avoid -1.
    this.endTime = Math.max(0, this.duration);
  }
  connectedCallback() {
    this.dispatch = createDispatcher(this);
    this.timestamp = formatTime(this.currentTime, this.alwaysShowHours);
    this.onNoKeyboardChange();
  }
  disconnectedCallback() {
    this.keyboardDisposal.empty();
  }
  setTooltipPosition(value) {
    var _a, _b;
    const tooltipRect = (_b = (_a = this.tooltip.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.tooltip')) === null || _b === void 0 ? void 0 : _b.getBoundingClientRect();
    const bounds = this.slider.getBoundingClientRect();
    const thumbWidth = parseFloat(window
      .getComputedStyle(this.slider)
      .getPropertyValue('--vm-slider-thumb-width'));
    const leftLimit = tooltipRect.width / 2 - thumbWidth / 2;
    const rightLimit = bounds.width - tooltipRect.width / 2 - thumbWidth / 2;
    const xPos = Math.max(leftLimit, Math.min(value, rightLimit));
    this.tooltip.style = `--vm-tooltip-left: ${xPos}px`;
  }
  onSeek(event) {
    this.dispatch('currentTime', event.detail);
  }
  onSeeking(event) {
    if (this.duration < 0 || this.tooltip.hidden)
      return;
    if (event.type === 'mouseleave') {
      this.getSliderInput().blur();
      this.tooltip.active = false;
      return;
    }
    const rect = this.host.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, (100 / rect.width) * (event.pageX - rect.left)));
    this.timestamp = formatTime((this.duration / 100) * percent, this.alwaysShowHours);
    this.setTooltipPosition((percent / 100) * rect.width);
    if (!this.tooltip.active) {
      this.getSliderInput().focus();
      this.tooltip.active = true;
    }
  }
  getSliderInput() {
    var _a;
    return (_a = this.slider.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('input');
  }
  render() {
    const sliderValueText = this.i18n.scrubberLabel
      .replace(/{currentTime}/, formatTime(this.currentTime))
      .replace(/{duration}/, formatTime(this.endTime));
    return (h("div", { class: "scrubber", onMouseEnter: this.onSeeking.bind(this), onMouseLeave: this.onSeeking.bind(this), onMouseMove: this.onSeeking.bind(this), onTouchMove: () => {
        this.getSliderInput().focus();
      }, onTouchEnd: () => {
        this.getSliderInput().blur();
      } }, h("vm-slider", { step: 0.01, max: this.endTime, value: this.currentTime, label: this.i18n.scrubber, valueText: sliderValueText, onVmValueChange: this.onSeek.bind(this), ref: (el) => {
        this.slider = el;
      } }), h("progress", { class: {
        loading: this.buffering,
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      min: 0, max: this.endTime, value: this.buffered, "aria-label": this.i18n.buffered, "aria-valuemin": "0", "aria-valuemax": this.endTime, "aria-valuenow": this.buffered, "aria-valuetext": `${(this.endTime > 0
        ? this.buffered / this.endTime
        : 0).toFixed(0)}%` }, "% buffered"), h("vm-tooltip", { hidden: this.hideTooltip, ref: (el) => {
        this.tooltip = el;
      } }, this.timestamp)));
  }
  get host() { return getElement(this); }
  static get watchers() { return {
    "noKeyboard": ["onNoKeyboardChange"],
    "duration": ["onDurationChange"]
  }; }
};
ScrubberControl.style = scrubberControlCss;

const settingsControlCss = ".settingsControl.hidden{display:none}.settingsControl{--vm-icon-transition:transform 0.3s ease}.settingsControl.active{--vm-icon-transform:rotate(90deg)}";

var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try {
      step(generator.next(value));
    }
    catch (e) {
      reject(e);
    } }
    function rejected(value) { try {
      step(generator["throw"](value));
    }
    catch (e) {
      reject(e);
    } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
let idCount = 0;
const SettingsControl = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    /**
     * The name of the settings icon to resolve from the icon library.
     */
    this.icon = 'settings';
    /**
     * Whether the tooltip is positioned above/below the control.
     */
    this.tooltipPosition = 'top';
    /**
     * Whether the settings menu this control manages is open.
     */
    this.expanded = false;
    /** @internal */
    this.i18n = {};
    /**
     * Whether the tooltip should not be displayed.
     */
    this.hideTooltip = false;
    withComponentRegistry(this);
    withPlayerContext(this, ['i18n']);
  }
  onComponentsChange() {
    if (!isUndefined(this.vmSettings)) {
      this.vmSettings.setController(this.host);
    }
  }
  connectedCallback() {
    idCount += 1;
    this.id = `vm-settings-control-${idCount}`;
    watchComponentRegistry(this, 'vm-settings', regs => {
      [this.vmSettings] = regs;
    });
  }
  /**
   * Focuses the control.
   */
  focusControl() {
    var _a;
    return __awaiter$1(this, void 0, void 0, function* () {
      (_a = this.control) === null || _a === void 0 ? void 0 : _a.focusControl();
    });
  }
  /**
   * Removes focus from the control.
   */
  blurControl() {
    var _a;
    return __awaiter$1(this, void 0, void 0, function* () {
      (_a = this.control) === null || _a === void 0 ? void 0 : _a.blurControl();
    });
  }
  render() {
    const hasSettings = !isUndefined(this.menu);
    return (h("div", { class: {
        settingsControl: true,
        hidden: !hasSettings,
        active: hasSettings && this.expanded,
      } }, h("vm-control", { identifier: this.id, menu: this.menu, hidden: !hasSettings, expanded: this.expanded, label: this.i18n.settings, ref: control => {
        this.control = control;
      } }, h("vm-icon", { name: this.icon, library: this.icons }), h("vm-tooltip", { hidden: this.hideTooltip || this.expanded, position: this.tooltipPosition, direction: this.tooltipDirection }, this.i18n.settings))));
  }
  get host() { return getElement(this); }
  static get watchers() { return {
    "vmSettings": ["onComponentsChange"]
  }; }
};
SettingsControl.style = settingsControlCss;

const timeProgressCss = ".timeProgress{display:flex;width:100%;height:100%;align-items:center;color:var(--vm-time-color)}.separator{margin:0 4px}";

const TimeProgress = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    /**
     * The string used to separate the current time and end time.
     */
    this.separator = '/';
    /**
     * Whether the times should always show the hours unit, even if the time is less than
     * 1 hour (eg: `20:35` -> `00:20:35`).
     */
    this.alwaysShowHours = false;
    withComponentRegistry(this);
  }
  render() {
    return (h("div", { class: "timeProgress" }, h("vm-current-time", { alwaysShowHours: this.alwaysShowHours }), h("span", { class: "separator" }, this.separator), h("vm-end-time", { alwaysShowHours: this.alwaysShowHours })));
  }
};
TimeProgress.style = timeProgressCss;

const volumeControlCss = ".volumeControl{align-items:center;display:flex;position:relative;pointer-events:auto;box-sizing:border-box}vm-slider{width:75px;height:100%;margin:0;max-width:0;position:relative;z-index:3;transition:margin 0.2s cubic-bezier(0.4, 0, 1, 1),\n    max-width 0.2s cubic-bezier(0.4, 0, 1, 1);margin-left:calc(var(--vm-control-spacing) / 2) !important;visibility:hidden}vm-slider:hover{cursor:pointer}vm-slider.hidden{display:none}vm-slider.active{max-width:75px;visibility:visible;margin:0 calc(var(--vm-control-spacing) / 2)}";

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try {
      step(generator.next(value));
    }
    catch (e) {
      reject(e);
    } }
    function rejected(value) { try {
      step(generator["throw"](value));
    }
    catch (e) {
      reject(e);
    } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const VolumeControl = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.keyboardDisposal = new Disposal();
    this.prevMuted = false;
    this.currentVolume = 50;
    this.isSliderActive = false;
    /**
     * The name of the low volume icon to resolve from the icon library.
     */
    this.lowVolumeIcon = 'volume-low';
    /**
     * The name of the high volume icon to resolve from the icon library.
     */
    this.highVolumeIcon = 'volume-high';
    /**
     * The name of the muted volume icon to resolve from the icon library.
     */
    this.mutedIcon = 'volume-mute';
    /**
     * Whether the tooltip is positioned above/below the control.
     */
    this.tooltipPosition = 'top';
    /**
     * Whether the tooltip should be hidden.
     */
    this.hideTooltip = false;
    /**
     * A pipe (`/`) separated string of JS keyboard keys, that when caught in a `keydown` event, will
     * toggle the muted state of the player.
     */
    this.muteKeys = 'm';
    /**
     * Prevents the volume being changed using the Up/Down arrow keys.
     */
    this.noKeyboard = false;
    /** @internal */
    this.muted = false;
    /** @internal */
    this.volume = 50;
    /** @internal */
    this.isMobile = false;
    /** @internal */
    this.i18n = {};
    withComponentRegistry(this);
    withPlayerContext(this, ['volume', 'muted', 'isMobile', 'i18n']);
  }
  onNoKeyboardChange() {
    return __awaiter(this, void 0, void 0, function* () {
      this.keyboardDisposal.empty();
      if (this.noKeyboard)
        return;
      const player = yield findPlayer(this);
      if (isUndefined(player))
        return;
      this.keyboardDisposal.add(listen(player, 'keydown', (event) => {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')
          return;
        const isUpArrow = event.key === 'ArrowUp';
        const newVolume = isUpArrow
          ? Math.min(100, this.volume + 5)
          : Math.max(0, this.volume - 5);
        this.dispatch('volume', parseInt(`${newVolume}`, 10));
      }));
    });
  }
  onPlayerVolumeChange() {
    this.currentVolume = this.muted ? 0 : this.volume;
    if (!this.muted && this.prevMuted && this.volume === 0) {
      this.dispatch('volume', 30);
    }
    this.prevMuted = this.muted;
  }
  connectedCallback() {
    this.prevMuted = this.muted;
    this.dispatch = createDispatcher(this);
    this.onNoKeyboardChange();
  }
  disconnectedCallback() {
    this.keyboardDisposal.empty();
  }
  onShowSlider() {
    clearTimeout(this.hideSliderTimeout);
    this.isSliderActive = true;
  }
  onHideSlider() {
    this.hideSliderTimeout = setTimeout(() => {
      this.isSliderActive = false;
    }, 100);
  }
  onVolumeChange(event) {
    const newVolume = event.detail;
    this.currentVolume = newVolume;
    this.dispatch('volume', newVolume);
    this.dispatch('muted', newVolume === 0);
  }
  onKeyDown(event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
      return;
    event.stopPropagation();
  }
  render() {
    return (h("div", { class: "volumeControl", onMouseEnter: this.onShowSlider.bind(this), onMouseLeave: this.onHideSlider.bind(this) }, h("vm-mute-control", { keys: this.muteKeys, lowVolumeIcon: this.lowVolumeIcon, highVolumeIcon: this.highVolumeIcon, mutedIcon: this.mutedIcon, icons: this.icons, tooltipPosition: this.tooltipPosition, tooltipDirection: this.tooltipDirection, hideTooltip: this.hideTooltip, onVmFocus: this.onShowSlider.bind(this), onVmBlur: this.onHideSlider.bind(this) }), h("vm-slider", { class: {
        hidden: this.isMobile,
        active: this.isSliderActive,
      }, step: 5, max: 100, value: this.currentVolume, label: this.i18n.volume, onKeyDown: this.onKeyDown.bind(this), onVmFocus: this.onShowSlider.bind(this), onVmBlur: this.onHideSlider.bind(this), onVmValueChange: this.onVolumeChange.bind(this) })));
  }
  static get watchers() { return {
    "noKeyboard": ["onNoKeyboardChange"],
    "muted": ["onPlayerVolumeChange"],
    "volume": ["onPlayerVolumeChange"]
  }; }
};
VolumeControl.style = volumeControlCss;

export { CaptionControl as vm_caption_control, ControlNewLine as vm_control_group, ControlSpacer as vm_control_spacer, Controls as vm_controls, CurrentTime as vm_current_time, EndTime as vm_end_time, FullscreenControl as vm_fullscreen_control, LiveIndicator as vm_live_indicator, MuteControl as vm_mute_control, PiPControl as vm_pip_control, PlaybackControl as vm_playback_control, Scrim as vm_scrim, ScrubberControl as vm_scrubber_control, SettingsControl as vm_settings_control, TimeProgress as vm_time_progress, VolumeControl as vm_volume_control };

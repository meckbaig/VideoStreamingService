'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-86498cbd.js');
const withComponentRegistry = require('./withComponentRegistry-90ec334c.js');
const support = require('./support-e1714cb5.js');
const ProviderConnect = require('./ProviderConnect-100da60f.js');
const FullscreenController = require('./FullscreenController-0d7ca406.js');
const PlayerProps = require('./PlayerProps-4bbfc16a.js');
const MediaType = require('./MediaType-8f0adf5d.js');
const ViewType = require('./ViewType-ea1402c0.js');
const PlayerEvents = require('./PlayerEvents-79156eee.js');
const PlayerDispatcher = require('./PlayerDispatcher-00dbedc9.js');
require('./Provider-b6123cae.js');

var multiverse = new Map();
var updateConsumer = function (_a, state) {
    var fields = _a.fields, updater = _a.updater;
    fields.forEach(function (field) { updater(field, state[field]); });
};
var Universe = {
    create: function (creator, initialState) {
        var el = index.getElement(creator);
        var wormholes = new Map();
        var universe = { wormholes: wormholes, state: initialState };
        multiverse.set(creator, universe);
        var connectedCallback = creator.connectedCallback;
        creator.connectedCallback = function () {
            multiverse.set(creator, universe);
            if (connectedCallback) {
                connectedCallback.call(creator);
            }
        };
        var disconnectedCallback = creator.disconnectedCallback;
        creator.disconnectedCallback = function () {
            multiverse.delete(creator);
            if (disconnectedCallback) {
                disconnectedCallback.call(creator);
            }
        };
        el.addEventListener('openWormhole', function (event) {
            event.stopPropagation();
            var _a = event.detail, consumer = _a.consumer, onOpen = _a.onOpen;
            if (wormholes.has(consumer))
                return;
            if (typeof consumer !== 'symbol') {
                var connectedCallback_1 = consumer.connectedCallback, disconnectedCallback_1 = consumer.disconnectedCallback;
                consumer.connectedCallback = function () {
                    wormholes.set(consumer, event.detail);
                    if (connectedCallback_1) {
                        connectedCallback_1.call(consumer);
                    }
                };
                consumer.disconnectedCallback = function () {
                    wormholes.delete(consumer);
                    if (disconnectedCallback_1) {
                        disconnectedCallback_1.call(consumer);
                    }
                };
            }
            wormholes.set(consumer, event.detail);
            updateConsumer(event.detail, universe.state);
            onOpen === null || onOpen === void 0 ? void 0 : onOpen.resolve(function () { wormholes.delete(consumer); });
        });
        el.addEventListener('closeWormhole', function (event) {
            var consumer = event.detail;
            wormholes.delete(consumer);
        });
    },
    Provider: function (_a, children) {
        var state = _a.state;
        var creator = index.getRenderingRef();
        if (multiverse.has(creator)) {
            var universe = multiverse.get(creator);
            universe.state = state;
            universe.wormholes.forEach(function (opening) { updateConsumer(opening, state); });
        }
        return children;
    }
};

class Logger {
  constructor() {
    this.silent = false;
  }
  log(...args) {
    if (!this.silent && !withComponentRegistry.isUndefined(console))
      console.log('[Vime tip]:', ...args);
  }
  warn(...args) {
    if (!this.silent && !withComponentRegistry.isUndefined(console))
      console.error('[Vime warn]:', ...args);
  }
}

const players = new Set();
function withAutopause(player) {
  const el = index.getElement(player);
  withComponentRegistry.createStencilHook(player, () => {
    players.add(el);
  }, () => {
    players.delete(el);
  });
}
function autopause(player) {
  const el = index.getElement(player);
  players.forEach(p => {
    if (p !== el && p.autopause)
      p.paused = true;
  });
}

/* eslint-disable func-names */
function withPlayerEvents(player) {
  const el = index.getElement(player);
  const cache = new Map();
  function initCache() {
    Object.keys(PlayerProps.initialState).forEach(prop => {
      cache.set(prop, player[prop]);
    });
  }
  withComponentRegistry.createStencilHook(player, () => {
    initCache();
  }, () => {
    cache.clear();
  });
  const { componentDidRender } = player;
  player.componentDidRender = function () {
    componentDidRender === null || componentDidRender === void 0 ? void 0 : componentDidRender();
    const props = Array.from(cache.keys());
    for (let i = 0; i < props.length; i += 1) {
      const prop = props[i];
      const oldValue = cache.get(prop);
      const newValue = player[prop];
      if (oldValue !== newValue) {
        PlayerEvents.firePlayerEvent(el, prop, newValue, oldValue);
        cache.set(prop, newValue);
      }
    }
  };
}

var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
// These changes need to be called immediately to avoid the browser blocking the request.
const immediateAdapterCall = new Set(['currentTime', 'paused']);
function withPlayerScheduler(player) {
  const el = index.getElement(player);
  const disposal = new withComponentRegistry.Disposal();
  const cache = new Map();
  function initCache() {
    Object.keys(PlayerProps.initialState).forEach(prop => {
      cache.set(prop, player[prop]);
    });
  }
  // Queue of adapter calls to be run when the media is ready for playback.
  let adapterCalls = [];
  function flushAdapterCalls() {
    return __awaiter$1(this, void 0, void 0, function* () {
      const adapter = yield player.adapter;
      if (withComponentRegistry.isUndefined(adapter))
        return;
      for (let i = 0; i < adapterCalls.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        yield adapterCalls[i](adapter);
      }
      adapterCalls = [];
    });
  }
  let hasMediaChanged = false;
  function onMediaChange(e) {
    e === null || e === void 0 ? void 0 : e.stopImmediatePropagation();
    // Don't reset first time otherwise props intialized by the user will be reset.
    if (!hasMediaChanged) {
      hasMediaChanged = true;
      return;
    }
    adapterCalls = [];
    index.writeTask(() => {
      Object.keys(PlayerProps.initialState)
        .filter(PlayerProps.shouldPropResetOnMediaChange)
        .forEach(prop => {
        player[prop] = PlayerProps.initialState[prop];
      });
    });
  }
  function onStateChange(event) {
    var _a;
    return __awaiter$1(this, void 0, void 0, function* () {
      event.stopImmediatePropagation();
      const { by, prop, value } = event.detail;
      if (!PlayerProps.isWritableProp(prop)) {
        (_a = player.logger) === null || _a === void 0 ? void 0 : _a.warn(`${by.nodeName} tried to change \`${prop}\` but it is readonly.`);
        return;
      }
      if (!player.playbackStarted && immediateAdapterCall.has(prop)) {
        const adapter = yield player.adapter;
        if (prop === 'paused' && !value) {
          adapter === null || adapter === void 0 ? void 0 : adapter.play();
        }
        if (prop === 'currentTime') {
          adapter === null || adapter === void 0 ? void 0 : adapter.play();
          adapter === null || adapter === void 0 ? void 0 : adapter.setCurrentTime(value);
        }
      }
      index.writeTask(() => {
        player[prop] = value;
      });
    });
  }
  // Called by ProviderConnect.
  const { onProviderDisconnect } = player;
  player.onProviderDisconnect = function () {
    onMediaChange();
    if (onProviderDisconnect)
      onProviderDisconnect.call(player);
  };
  withComponentRegistry.createStencilHook(player, () => {
    initCache();
    disposal.add(withComponentRegistry.listen(el, PlayerEvents.LOAD_START_EVENT, onMediaChange));
    disposal.add(withComponentRegistry.listen(el, PlayerDispatcher.STATE_CHANGE_EVENT, onStateChange));
  }, () => {
    cache.clear();
    disposal.empty();
  });
  withComponentRegistry.wrapStencilHook(player, 'componentWillRender', () => __awaiter$1(this, void 0, void 0, function* () {
    if (player.playbackReady && adapterCalls.length > 0)
      yield flushAdapterCalls();
  }));
  function isAdapterCallRequired(prop, value) {
    var _a;
    return value !== ((_a = player[ProviderConnect.PROVIDER_CACHE_KEY]) === null || _a === void 0 ? void 0 : _a.get(prop));
  }
  return function safeAdapterCall(prop, method) {
    return __awaiter$1(this, void 0, void 0, function* () {
      if (!isAdapterCallRequired(prop, player[prop]))
        return;
      const value = player[prop];
      const safeCall = (adapter) => __awaiter$1(this, void 0, void 0, function* () {
        var _a;
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          yield ((_a = adapter === null || adapter === void 0 ? void 0 : adapter[method]) === null || _a === void 0 ? void 0 : _a.call(adapter, value));
        }
        catch (e) {
          el.dispatchEvent(new CustomEvent('vmError', { detail: e }));
        }
      });
      if (player.playbackReady) {
        yield safeCall(yield player.adapter);
      }
      else {
        adapterCalls.push(safeCall);
      }
    });
  };
}

const playerCss = ".player{box-sizing:border-box;direction:ltr;font-family:var(--vm-player-font-family);-moz-osx-font-smoothing:auto;-webkit-font-smoothing:subpixel-antialiased;-webkit-tap-highlight-color:transparent;font-variant-numeric:tabular-nums;font-weight:500;line-height:1.7;width:100%;display:block;max-width:100%;min-width:275px;min-height:40px;position:relative;text-shadow:none;outline:0;transition:box-shadow 0.3s ease;box-shadow:var(--vm-player-box-shadow);border-radius:var(--vm-player-border-radius)}.player.idle{cursor:none}.player.audio{background-color:transparent !important}.player.video{height:0;overflow:hidden;background-color:var(--vm-player-bg, #000)}.player.fullscreen{margin:0;border-radius:0;width:100%;height:100%;padding-bottom:0 !important}.blocker{position:absolute;top:0;left:0;width:100%;height:100%;display:inline-block;z-index:var(--vm-blocker-z-index)}";

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
let idCount = 0;
const Player = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.vmThemeChange = index.createEvent(this, "vmThemeChange", 7);
    this.vmPausedChange = index.createEvent(this, "vmPausedChange", 7);
    this.vmPlay = index.createEvent(this, "vmPlay", 7);
    this.vmPlayingChange = index.createEvent(this, "vmPlayingChange", 7);
    this.vmSeekingChange = index.createEvent(this, "vmSeekingChange", 7);
    this.vmSeeked = index.createEvent(this, "vmSeeked", 7);
    this.vmBufferingChange = index.createEvent(this, "vmBufferingChange", 7);
    this.vmDurationChange = index.createEvent(this, "vmDurationChange", 7);
    this.vmCurrentTimeChange = index.createEvent(this, "vmCurrentTimeChange", 7);
    this.vmReady = index.createEvent(this, "vmReady", 7);
    this.vmPlaybackReady = index.createEvent(this, "vmPlaybackReady", 7);
    this.vmPlaybackStarted = index.createEvent(this, "vmPlaybackStarted", 7);
    this.vmPlaybackEnded = index.createEvent(this, "vmPlaybackEnded", 7);
    this.vmBufferedChange = index.createEvent(this, "vmBufferedChange", 7);
    this.vmError = index.createEvent(this, "vmError", 7);
    this.vmLoadStart = index.createEvent(this, "vmLoadStart", 7);
    this.vmCurrentProviderChange = index.createEvent(this, "vmCurrentProviderChange", 7);
    this.vmCurrentSrcChange = index.createEvent(this, "vmCurrentSrcChange", 7);
    this.vmCurrentPosterChange = index.createEvent(this, "vmCurrentPosterChange", 7);
    this.vmMediaTitleChange = index.createEvent(this, "vmMediaTitleChange", 7);
    this.vmControlsChange = index.createEvent(this, "vmControlsChange", 7);
    this.vmPlaybackRateChange = index.createEvent(this, "vmPlaybackRateChange", 7);
    this.vmPlaybackRatesChange = index.createEvent(this, "vmPlaybackRatesChange", 7);
    this.vmPlaybackQualityChange = index.createEvent(this, "vmPlaybackQualityChange", 7);
    this.vmPlaybackQualitiesChange = index.createEvent(this, "vmPlaybackQualitiesChange", 7);
    this.vmMutedChange = index.createEvent(this, "vmMutedChange", 7);
    this.vmVolumeChange = index.createEvent(this, "vmVolumeChange", 7);
    this.vmViewTypeChange = index.createEvent(this, "vmViewTypeChange", 7);
    this.vmMediaTypeChange = index.createEvent(this, "vmMediaTypeChange", 7);
    this.vmLiveChange = index.createEvent(this, "vmLiveChange", 7);
    this.vmTouchChange = index.createEvent(this, "vmTouchChange", 7);
    this.vmLanguageChange = index.createEvent(this, "vmLanguageChange", 7);
    this.vmI18nChange = index.createEvent(this, "vmI18nChange", 7);
    this.vmTranslationsChange = index.createEvent(this, "vmTranslationsChange", 7);
    this.vmLanguagesChange = index.createEvent(this, "vmLanguagesChange", 7);
    this.vmFullscreenChange = index.createEvent(this, "vmFullscreenChange", 7);
    this.vmPiPChange = index.createEvent(this, "vmPiPChange", 7);
    this.vmTextTracksChange = index.createEvent(this, "vmTextTracksChange", 7);
    this.vmCurrentTextTrackChange = index.createEvent(this, "vmCurrentTextTrackChange", 7);
    this.vmTextTrackVisibleChange = index.createEvent(this, "vmTextTrackVisibleChange", 7);
    this.vmAudioTracksChange = index.createEvent(this, "vmAudioTracksChange", 7);
    this.vmCurrentAudioTrackChange = index.createEvent(this, "vmCurrentAudioTrackChange", 7);
    this.disposal = new withComponentRegistry.Disposal();
    /**
     * ------------------------------------------------------
     * Props
     * ------------------------------------------------------
     */
    /** @internal @readonly */
    this.logger = new Logger();
    /** @inheritDoc */
    this.icons = 'vime';
    /** @inheritDoc */
    this.paused = true;
    /** @inheritDoc @readonly */
    this.playing = false;
    /** @inheritDoc @readonly */
    this.duration = -1;
    /** @inheritDoc */
    this.currentTime = 0;
    /** @inheritDoc */
    this.autoplay = false;
    /** @inheritDoc @readonly */
    this.ready = false;
    /** @inheritDoc @readonly */
    this.playbackReady = false;
    /** @inheritDoc */
    this.loop = false;
    /** @inheritDoc */
    this.muted = false;
    /** @inheritDoc @readonly */
    this.buffered = 0;
    /** @inheritDoc */
    this.playbackRate = 1;
    this.lastRateCheck = 1;
    /** @inheritDoc @readonly */
    this.playbackRates = [1];
    /** @inheritDoc @readonly */
    this.playbackQualities = [];
    /** @inheritDoc @readonly */
    this.seeking = false;
    /** @inheritDoc */
    this.debug = false;
    /** @inheritDoc @readonly */
    this.playbackStarted = false;
    /** @inheritDoc @readonly */
    this.playbackEnded = false;
    /** @inheritDoc @readonly */
    this.buffering = false;
    /** @inheritDoc */
    this.controls = false;
    /** @inheritDoc */
    this.isControlsActive = false;
    /** @inheritDoc @readonly */
    this.isSettingsActive = false;
    /** @inheritDoc */
    this.volume = 50;
    /** @inheritDoc @readonly */
    this.isFullscreenActive = false;
    /** @inheritDoc */
    this.aspectRatio = '16:9';
    /** @inheritDoc @readonly */
    this.isAudioView = false;
    /** @inheritDoc @readonly */
    this.isVideoView = false;
    /** @inheritDoc @readonly */
    this.isAudio = false;
    /** @inheritDoc @readonly */
    this.isVideo = false;
    /** @inheritDoc @readonly */
    this.isLive = false;
    /** @inheritDoc @readonly */
    this.isMobile = false;
    /** @inheritDoc @readonly */
    this.isTouch = false;
    /** @inheritDoc @readonly */
    this.isPiPActive = false;
    /** @inheritDoc @readonly */
    this.textTracks = [];
    /** @inheritDoc @readonly */
    this.currentTextTrack = -1;
    /** @inheritDoc @readonly */
    this.isTextTrackVisible = true;
    /** @inheritDoc */
    this.shouldRenderNativeTextTracks = true;
    /** @inheritDoc @readonly */
    this.audioTracks = [];
    /** @inheritDoc @readonly */
    this.currentAudioTrack = -1;
    /** @inheritDoc */
    this.autopause = true;
    /** @inheritDoc */
    this.playsinline = false;
    /** @inheritDoc */
    this.language = 'en';
    /** @inheritDoc */
    this.translations = { en: PlayerProps.en };
    /** @inheritDoc @readonly */
    this.languages = ['en'];
    /** @inheritDoc @readonly */
    this.i18n = PlayerProps.en;
    withComponentRegistry.withFindPlayer(this);
    withComponentRegistry.withComponentRegistrar(this);
    withAutopause(this);
    ProviderConnect.withProviderHost(this);
    withPlayerEvents(this);
    this.safeAdapterCall = withPlayerScheduler(this);
  }
  get adapter() {
    var _a;
    return (_a = this.provider) === null || _a === void 0 ? void 0 : _a.getAdapter();
  }
  onContainerChange() {
    var _a;
    (_a = this.fullscreenController) === null || _a === void 0 ? void 0 : _a.destroy();
    if (withComponentRegistry.isUndefined(this.container))
      return;
    this.fullscreenController = new FullscreenController.FullscreenController(this.container);
    this.fullscreenController.on('change', isActive => {
      this.isFullscreenActive = isActive;
      if (isActive)
        this.rotateDevice();
    });
    this.fullscreenController.on('error', error => {
      this.vmError.emit(error);
    });
  }
  onPausedChange() {
    if (this.paused) {
      this.playing = false;
    }
    else {
      autopause(this);
    }
    this.safeAdapterCall('paused', !this.paused ? 'play' : 'pause');
  }
  onDurationChange() {
    this.isLive = this.duration === Infinity;
  }
  onCurrentTimeChange() {
    const duration = this.playbackReady ? this.duration : Infinity;
    this.currentTime = Math.max(0, Math.min(this.currentTime, duration));
    this.safeAdapterCall('currentTime', 'setCurrentTime');
  }
  onPlaybackReadyChange() {
    if (!this.ready)
      this.ready = true;
  }
  onMutedChange() {
    this.safeAdapterCall('muted', 'setMuted');
  }
  onPlaybackRateChange(newRate, prevRate) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
      if (newRate === this.lastRateCheck)
        return;
      if (!(yield ((_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.canSetPlaybackRate) === null || _b === void 0 ? void 0 : _b.call(_a)))) {
        this.logger.log('provider cannot change `playbackRate`.');
        this.lastRateCheck = prevRate;
        this.playbackRate = prevRate;
        return;
      }
      if (!this.playbackRates.includes(newRate)) {
        this.logger.log(`invalid \`playbackRate\` of ${newRate}, ` +
          `valid values are [${this.playbackRates.join(', ')}]`);
        this.lastRateCheck = prevRate;
        this.playbackRate = prevRate;
        return;
      }
      this.lastRateCheck = newRate;
      this.safeAdapterCall('playbackRate', 'setPlaybackRate');
    });
  }
  onPlaybackQualityChange(newQuality, prevQuality) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
      if (withComponentRegistry.isUndefined(newQuality) || newQuality === this.lastQualityCheck)
        return;
      if (!(yield ((_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.canSetPlaybackQuality) === null || _b === void 0 ? void 0 : _b.call(_a)))) {
        this.logger.log('provider cannot change `playbackQuality`.');
        this.lastQualityCheck = prevQuality;
        this.playbackQuality = prevQuality;
        return;
      }
      if (!this.playbackQualities.includes(newQuality)) {
        this.logger.log(`invalid \`playbackQuality\` of ${newQuality}, ` +
          `valid values are [${this.playbackQualities.join(', ')}]`);
        this.lastQualityCheck = prevQuality;
        this.playbackQuality = prevQuality;
        return;
      }
      this.lastQualityCheck = newQuality;
      this.safeAdapterCall('playbackQuality', 'setPlaybackQuality');
    });
  }
  onDebugChange() {
    this.logger.silent = !this.debug;
  }
  onVolumeChange() {
    return __awaiter(this, void 0, void 0, function* () {
      this.volume = Math.max(0, Math.min(this.volume, 100));
      this.safeAdapterCall('volume', 'setVolume');
    });
  }
  onViewTypeChange() {
    this.isAudioView = this.viewType === ViewType.ViewType.Audio;
    this.isVideoView = this.viewType === ViewType.ViewType.Video;
  }
  onMediaTypeChange() {
    this.isAudio = this.mediaType === MediaType.MediaType.Audio;
    this.isVideo = this.mediaType === MediaType.MediaType.Video;
  }
  onLanguageChange(_, prevLanguage) {
    if (!this.languages.includes(this.language)) {
      this.logger.log(`invalid \`language\` of ${this.language}, ` +
        `valid values are [${this.languages.join(', ')}]`);
      this.language = prevLanguage;
      return;
    }
    this.i18n = this.translations[this.language];
  }
  onTranslationsChange() {
    Object.assign(this.translations, { en: PlayerProps.en });
    this.languages = Object.keys(this.translations);
    this.i18n = this.translations[this.language];
  }
  onError(event) {
    this.logger.warn(event.detail);
  }
  /**
   * ------------------------------------------------------
   * Methods
   * ------------------------------------------------------
   */
  /** @inheritDoc */
  getProvider() {
    return __awaiter(this, void 0, void 0, function* () {
      return this.provider;
    });
  }
  /** @internal */
  getAdapter() {
    return __awaiter(this, void 0, void 0, function* () {
      return this.adapter;
    });
  }
  /** @inheritDoc */
  play() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      return (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.play();
    });
  }
  /** @inheritDoc */
  pause() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      return (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.pause();
    });
  }
  /** @inheritDoc */
  canPlay(type) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
      return (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.canPlay(type)) !== null && _b !== void 0 ? _b : false;
    });
  }
  /** @inheritDoc */
  canAutoplay() {
    return __awaiter(this, void 0, void 0, function* () {
      return support.canAutoplay();
    });
  }
  /** @inheritDoc */
  canMutedAutoplay() {
    return __awaiter(this, void 0, void 0, function* () {
      return support.canAutoplay(true);
    });
  }
  /** @inheritDoc */
  canSetPlaybackRate() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
      return (_c = (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.canSetPlaybackRate) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : false;
    });
  }
  /** @inheritDoc */
  canSetPlaybackQuality() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
      return (_c = (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.canSetPlaybackQuality) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : false;
    });
  }
  /** @inheritDoc */
  canSetFullscreen() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
      return (this.fullscreenController.isSupported ||
        ((_c = (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.canSetFullscreen) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : false));
    });
  }
  /** @inheritDoc */
  enterFullscreen(options) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.isVideoView) {
        throw Error('Cannot enter fullscreen on an audio player view.');
      }
      if (this.fullscreenController.isSupported) {
        return this.fullscreenController.requestFullscreen();
      }
      const adapter = yield this.adapter;
      const canProviderSetFullscreen = (_b = (yield ((_a = adapter === null || adapter === void 0 ? void 0 : adapter.canSetFullscreen) === null || _a === void 0 ? void 0 : _a.call(adapter)))) !== null && _b !== void 0 ? _b : false;
      if (canProviderSetFullscreen) {
        return (_c = adapter === null || adapter === void 0 ? void 0 : adapter.enterFullscreen) === null || _c === void 0 ? void 0 : _c.call(adapter, options);
      }
      throw Error('Fullscreen API is not available.');
    });
  }
  /** @inheritDoc */
  exitFullscreen() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
      if (this.fullscreenController.isSupported) {
        return this.fullscreenController.exitFullscreen();
      }
      return (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.exitFullscreen) === null || _b === void 0 ? void 0 : _b.call(_a);
    });
  }
  /** @inheritDoc */
  canSetPiP() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
      return (_c = (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.canSetPiP) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : false;
    });
  }
  /** @inheritDoc */
  enterPiP() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.isVideoView)
        throw Error('Cannot enter PiP mode on an audio player view.');
      if (!(yield this.canSetPiP()))
        throw Error('Picture-in-Picture API is not available.');
      return (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.enterPiP) === null || _b === void 0 ? void 0 : _b.call(_a);
    });
  }
  /** @inheritDoc */
  exitPiP() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
      return (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.exitPiP) === null || _b === void 0 ? void 0 : _b.call(_a);
    });
  }
  /** @inheritDoc */
  canSetAudioTrack() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      return !withComponentRegistry.isUndefined((_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.setCurrentAudioTrack);
    });
  }
  /** @inheritDoc */
  setCurrentAudioTrack(trackId) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
      (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.setCurrentAudioTrack) === null || _b === void 0 ? void 0 : _b.call(_a, trackId);
    });
  }
  /** @inheritDoc */
  canSetTextTrack() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      return !withComponentRegistry.isUndefined((_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.setCurrentTextTrack);
    });
  }
  /** @inheritDoc */
  setCurrentTextTrack(trackId) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
      (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.setCurrentTextTrack) === null || _b === void 0 ? void 0 : _b.call(_a, trackId);
    });
  }
  /** @inheritDoc */
  canSetTextTrackVisibility() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      return !withComponentRegistry.isUndefined((_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.setTextTrackVisibility);
    });
  }
  /** @inheritDoc */
  setTextTrackVisibility(isVisible) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
      (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.setTextTrackVisibility) === null || _b === void 0 ? void 0 : _b.call(_a, isVisible);
    });
  }
  /** @inheritDoc */
  extendLanguage(language, translation) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      const translations = Object.assign(Object.assign({}, this.translations), { [language]: Object.assign(Object.assign({}, ((_a = this.translations[language]) !== null && _a !== void 0 ? _a : {})), translation) });
      this.translations = translations;
    });
  }
  connectedCallback() {
    this.onPausedChange();
    this.onCurrentTimeChange();
    this.onVolumeChange();
    this.onMutedChange();
    this.onDebugChange();
    this.onContainerChange();
    this.onTranslationsChange();
    this.onLanguageChange(this.language, PlayerProps.initialState.language);
    this.disposal.add(support.onMobileChange(isMobile => {
      this.isMobile = isMobile;
    }));
    this.disposal.add(support.onTouchInputChange(isTouch => {
      this.isTouch = isTouch;
    }));
  }
  componentWillLoad() {
    Universe.create(this, this.getPlayerState());
  }
  disconnectedCallback() {
    var _a;
    (_a = this.fullscreenController) === null || _a === void 0 ? void 0 : _a.destroy();
    this.disposal.empty();
  }
  rotateDevice() {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.isMobile || !support.canRotateScreen())
        return;
      try {
        if (this.isFullscreenActive) {
          yield window.screen.orientation.lock('landscape');
        }
        else {
          yield window.screen.orientation.unlock();
        }
      }
      catch (err) {
        this.vmError.emit(err);
      }
    });
  }
  getPlayerState() {
    const state = {};
    const props = Object.keys(PlayerProps.initialState);
    for (let i = 0; i < props.length; i += 1) {
      state[props[i]] = this[props[i]];
    }
    return state;
  }
  calcAspectRatio() {
    const [width, height] = /\d{1,2}:\d{1,2}/.test(this.aspectRatio)
      ? this.aspectRatio.split(':')
      : [16, 9];
    return (100 / Number(width)) * Number(height);
  }
  /**
   * Returns the inner container.
   */
  getContainer() {
    return __awaiter(this, void 0, void 0, function* () {
      return this.container;
    });
  }
  /** @internal Exposed for E2E testing. */
  callAdapter(method, value) {
    return __awaiter(this, void 0, void 0, function* () {
      return (yield this.adapter)[method](value);
    });
  }
  hasCustomControls() {
    return withComponentRegistry.isComponentRegistered(this, 'vm-controls');
  }
  genId() {
    var _a;
    const id = (_a = this.host) === null || _a === void 0 ? void 0 : _a.id;
    if (withComponentRegistry.isString(id) && id.length > 0)
      return id;
    idCount += 1;
    return `vm-player-${idCount}`;
  }
  render() {
    const label = `${this.isAudioView ? 'Audio Player' : 'Video Player'}` +
      `${!withComponentRegistry.isUndefined(this.mediaTitle) ? ` - ${this.mediaTitle}` : ''}`;
    const canShowCustomUI = !support.IS_IOS ||
      !this.isVideoView ||
      (this.playsinline && !this.isFullscreenActive);
    if (!canShowCustomUI) {
      this.controls = true;
    }
    const isIdle = canShowCustomUI &&
      this.hasCustomControls() &&
      this.isVideoView &&
      !this.paused &&
      !this.isControlsActive;
    const isBlockerVisible = !this.controls && canShowCustomUI && this.isVideoView;
    return (index.h(index.Host, { id: this.genId(), idle: isIdle, mobile: this.isMobile, touch: this.isTouch, live: this.isLive, audio: this.isAudioView, video: this.isVideoView, pip: this.isPiPActive, fullscreen: this.isFullscreenActive }, index.h("div", { "aria-label": label, "aria-hidden": !this.ready ? 'true' : 'false', "aria-busy": !this.playbackReady ? 'true' : 'false', class: {
        player: true,
        idle: isIdle,
        audio: this.isAudioView,
        video: this.isVideoView,
        fullscreen: this.isFullscreenActive,
      }, style: {
        paddingBottom: this.isVideoView
          ? `${this.calcAspectRatio()}%`
          : undefined,
      }, ref: el => {
        index.writeTask(() => {
          this.container = el;
        });
      } }, isBlockerVisible && index.h("div", { class: "blocker" }), index.h(Universe.Provider, { state: this.getPlayerState() }, index.h("slot", null)))));
  }
  get host() { return index.getElement(this); }
  static get watchers() { return {
    "container": ["onContainerChange"],
    "paused": ["onPausedChange"],
    "duration": ["onDurationChange"],
    "currentTime": ["onCurrentTimeChange"],
    "playbackReady": ["onPlaybackReadyChange"],
    "muted": ["onMutedChange"],
    "playbackRate": ["onPlaybackRateChange"],
    "playbackQuality": ["onPlaybackQualityChange"],
    "debug": ["onDebugChange"],
    "volume": ["onVolumeChange"],
    "viewType": ["onViewTypeChange"],
    "isAudioView": ["onViewTypeChange"],
    "isVideoView": ["onViewTypeChange"],
    "mediaType": ["onMediaTypeChange"],
    "language": ["onLanguageChange"],
    "translations": ["onTranslationsChange"]
  }; }
};
Player.style = playerCss;

exports.vm_player = Player;

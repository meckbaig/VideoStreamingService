import { r as registerInstance, c as createEvent, h } from './index-f5fd0f81.js';
import { a as decodeJSON } from './network-1fe1550f.js';
import { c as withComponentRegistry, k as deferredPromise, u as isNumber, e as isUndefined, h as isString } from './withComponentRegistry-28311671.js';
import { M as MediaType } from './MediaType-aec4c150.js';
import { V as ViewType } from './ViewType-6da43616.js';
import { w as withProviderConnect, c as createProviderDispatcher } from './ProviderConnect-42dc4f0d.js';
import { w as withProviderContext } from './withProviderContext-a9e7f1bc.js';
import './support-b6811262.js';
import './Provider-2e7e8366.js';
import './PlayerProps-2c57fcea.js';
import './withPlayerContext-4c52f564.js';
import './PlayerEvents-5c5704d6.js';

/**
 * @see https://developer.vimeo.com/player/sdk/reference#events-for-playback-controls
 */
var VimeoEvent;
(function (VimeoEvent) {
  VimeoEvent["Play"] = "play";
  VimeoEvent["Pause"] = "pause";
  VimeoEvent["Seeking"] = "seeking";
  VimeoEvent["Seeked"] = "seeked";
  VimeoEvent["TimeUpdate"] = "timeupdate";
  VimeoEvent["VolumeChange"] = "volumechange";
  VimeoEvent["DurationChange"] = "durationchange";
  VimeoEvent["FullscreenChange"] = "fullscreenchange";
  VimeoEvent["CueChange"] = "cuechange";
  VimeoEvent["Progress"] = "progress";
  VimeoEvent["Error"] = "error";
  VimeoEvent["PlaybackRateChange"] = "playbackratechange";
  VimeoEvent["Loaded"] = "loaded";
  VimeoEvent["BufferStart"] = "bufferstart";
  VimeoEvent["BufferEnd"] = "bufferend";
  VimeoEvent["TextTrackChange"] = "texttrackchange";
  VimeoEvent["Waiting"] = "waiting";
  VimeoEvent["Ended"] = "ended";
})(VimeoEvent || (VimeoEvent = {}));

const vimeoCss = ":host{z-index:var(--vm-media-z-index)}vm-embed{position:absolute;top:0;left:0;width:100%;height:100%}vm-embed.hideControls{display:block;width:100%;height:auto;position:relative}";

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
const videoInfoCache = new Map();
const Vimeo = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.vmLoadStart = createEvent(this, "vmLoadStart", 7);
    this.vmError = createEvent(this, "vmError", 7);
    this.defaultInternalState = {};
    this.volume = 50;
    this.hasLoaded = false;
    this.internalState = {
      paused: true,
      playing: false,
      seeking: false,
      currentTime: 0,
      buffered: 0,
      playbackStarted: false,
      playRequest: false,
    };
    this.embedSrc = '';
    this.mediaTitle = '';
    /**
     * Whether to display the video owner's name.
     */
    this.byline = true;
    /**
     * Whether to display the video owner's portrait.
     */
    this.portrait = true;
    /**
     * Turns off automatically determining the aspect ratio of the current video.
     */
    this.noAutoAspectRatio = false;
    /**
     * Whether cookies should be enabled on the embed.
     */
    this.cookies = true;
    /** @internal */
    this.language = 'en';
    /** @internal */
    this.aspectRatio = '16:9';
    /** @internal */
    this.autoplay = false;
    /** @internal */
    this.controls = false;
    /** @internal */
    this.loop = false;
    /** @internal */
    this.muted = false;
    /** @internal */
    this.playsinline = false;
    withComponentRegistry(this);
    withProviderConnect(this);
    withProviderContext(this);
  }
  onVideoIdChange() {
    this.cancelTimeUpdates();
    if (!this.videoId) {
      this.embedSrc = '';
      return;
    }
    this.embedSrc = `${this.getOrigin()}/video/${this.videoId}`;
    this.pendingDurationCall = deferredPromise();
    this.pendingMediaTitleCall = deferredPromise();
    this.fetchVideoInfo = this.getVideoInfo();
  }
  onCustomPosterChange() {
    this.dispatch('currentPoster', this.poster);
  }
  connectedCallback() {
    this.dispatch = createProviderDispatcher(this);
    this.dispatch('viewType', ViewType.Video);
    this.onVideoIdChange();
    this.defaultInternalState = Object.assign({}, this.internalState);
  }
  componentWillLoad() {
    this.initialMuted = this.muted;
  }
  disconnectedCallback() {
    this.cancelTimeUpdates();
    this.pendingPlayRequest = undefined;
  }
  getOrigin() {
    return 'https://player.vimeo.com';
  }
  getPreconnections() {
    return [
      this.getOrigin(),
      'https://i.vimeocdn.com',
      'https://f.vimeocdn.com',
      'https://fresnel.vimeocdn.com',
    ];
  }
  remoteControl(command, arg) {
    return this.embed.postMessage({
      method: command,
      value: arg,
    });
  }
  buildParams() {
    return {
      byline: this.byline,
      color: this.color,
      portrait: this.portrait,
      autopause: false,
      transparent: false,
      autoplay: this.autoplay,
      muted: this.initialMuted,
      playsinline: this.playsinline,
      dnt: !this.cookies,
    };
  }
  getVideoInfo() {
    return __awaiter(this, void 0, void 0, function* () {
      if (videoInfoCache.has(this.videoId))
        return videoInfoCache.get(this.videoId);
      return window
        .fetch(`https://vimeo.com/api/oembed.json?url=${this.embedSrc}`)
        .then(response => response.json())
        .then(data => {
        var _a;
        const thumnailRegex = /vimeocdn.com\/video\/(.*)?_/;
        const thumbnailId = (_a = data === null || data === void 0 ? void 0 : data.thumbnail_url) === null || _a === void 0 ? void 0 : _a.match(thumnailRegex)[1];
        const poster = `https://i.vimeocdn.com/video/${thumbnailId}_1920x1080.jpg`;
        const info = { poster, width: data === null || data === void 0 ? void 0 : data.width, height: data === null || data === void 0 ? void 0 : data.height };
        videoInfoCache.set(this.videoId, info);
        return info;
      });
    });
  }
  onTimeChange(time) {
    if (this.internalState.currentTime === time)
      return;
    this.dispatch('currentTime', time);
    // This is how we detect `seeking` early.
    if (Math.abs(this.internalState.currentTime - time) > 1.5) {
      this.internalState.seeking = true;
      this.dispatch('seeking', true);
      if (this.internalState.playing && this.internalState.buffered < time) {
        this.dispatch('buffering', true);
      }
      // Player doesn't resume playback once seeked.
      window.clearTimeout(this.pendingPlayRequest);
      if (!this.internalState.paused) {
        this.internalState.playRequest = true;
      }
      this.remoteControl(this.internalState.playbackStarted
        ? "pause" /* Pause */
        : "play" /* Play */);
    }
    this.internalState.currentTime = time;
  }
  cancelTimeUpdates() {
    if (isNumber(this.timeRAF))
      window.cancelAnimationFrame(this.timeRAF);
  }
  requestTimeUpdates() {
    this.remoteControl("getCurrentTime" /* GetCurrentTime */);
    this.timeRAF = window.requestAnimationFrame(() => {
      this.requestTimeUpdates();
    });
  }
  onSeeked() {
    if (!this.internalState.seeking)
      return;
    this.dispatch('seeking', false);
    this.internalState.seeking = false;
    if (this.internalState.playRequest) {
      window.setTimeout(() => {
        this.remoteControl("play" /* Play */);
      }, 150);
    }
  }
  onVimeoMethod(method, arg) {
    var _a, _b;
    switch (method) {
      case "getCurrentTime" /* GetCurrentTime */:
        if (!this.internalState.seeking)
          this.onTimeChange(arg);
        break;
      case "getDuration" /* GetDuration */:
        (_a = this.pendingDurationCall) === null || _a === void 0 ? void 0 : _a.resolve(arg);
        break;
      case "getVideoTitle" /* GetVideoTitle */:
        (_b = this.pendingMediaTitleCall) === null || _b === void 0 ? void 0 : _b.resolve(arg);
        break;
    }
  }
  onLoaded() {
    var _a, _b;
    if (this.hasLoaded)
      return;
    this.pendingPlayRequest = undefined;
    this.internalState = Object.assign({}, this.defaultInternalState);
    this.dispatch('currentSrc', this.embedSrc);
    this.dispatch('mediaType', MediaType.Video);
    this.remoteControl("getDuration" /* GetDuration */);
    this.remoteControl("getVideoTitle" /* GetVideoTitle */);
    Promise.all([
      this.fetchVideoInfo,
      (_a = this.pendingDurationCall) === null || _a === void 0 ? void 0 : _a.promise,
      (_b = this.pendingMediaTitleCall) === null || _b === void 0 ? void 0 : _b.promise,
    ]).then(([info, duration, mediaTitle]) => {
      var _a, _b, _c;
      this.requestTimeUpdates();
      this.dispatch('aspectRatio', `${(_a = info === null || info === void 0 ? void 0 : info.width) !== null && _a !== void 0 ? _a : 16}:${(_b = info === null || info === void 0 ? void 0 : info.height) !== null && _b !== void 0 ? _b : 9}`);
      this.dispatch('currentPoster', (_c = this.poster) !== null && _c !== void 0 ? _c : info === null || info === void 0 ? void 0 : info.poster);
      this.dispatch('duration', duration !== null && duration !== void 0 ? duration : -1);
      this.dispatch('mediaTitle', mediaTitle);
      this.dispatch('playbackReady', true);
    });
    this.hasLoaded = true;
  }
  onVimeoEvent(event, payload) {
    switch (event) {
      case "ready" /* Ready */:
        Object.values(VimeoEvent).forEach(e => {
          this.remoteControl("addEventListener" /* AddEventListener */, e);
        });
        break;
      case "loaded" /* Loaded */:
        this.onLoaded();
        break;
      case "play" /* Play */:
        // Incase of autoplay which might skip `Loaded` event.
        this.onLoaded();
        this.internalState.paused = false;
        this.dispatch('paused', false);
        break;
      case "playProgress" /* PlayProgress */:
        if (!this.internalState.playing) {
          this.dispatch('playing', true);
          this.internalState.playing = true;
          this.internalState.playbackStarted = true;
          this.pendingPlayRequest = window.setTimeout(() => {
            this.internalState.playRequest = false;
            this.pendingPlayRequest = undefined;
          }, 1000);
        }
        this.dispatch('buffering', false);
        this.onSeeked();
        break;
      case "pause" /* Pause */:
        this.internalState.paused = true;
        this.internalState.playing = false;
        this.dispatch('paused', true);
        this.dispatch('buffering', false);
        break;
      case "loadProgress" /* LoadProgress */:
        this.internalState.buffered = payload.seconds;
        this.dispatch('buffered', payload.seconds);
        break;
      case "bufferstart" /* BufferStart */:
        this.dispatch('buffering', true);
        // Attempt to detect `play` events early.
        if (this.internalState.paused) {
          this.internalState.paused = false;
          this.dispatch('paused', false);
          this.dispatch('playbackStarted', true);
        }
        break;
      case "bufferend" /* BufferEnd */:
        this.dispatch('buffering', false);
        if (this.internalState.paused)
          this.onSeeked();
        break;
      case "volumechange" /* VolumeChange */:
        if (payload.volume > 0) {
          const newVolume = Math.floor(payload.volume * 100);
          this.dispatch('muted', false);
          if (this.volume !== newVolume) {
            this.volume = newVolume;
            this.dispatch('volume', this.volume);
          }
        }
        else {
          this.dispatch('muted', true);
        }
        break;
      case "durationchange" /* DurationChange */:
        this.dispatch('duration', payload.duration);
        break;
      case "playbackratechange" /* PlaybackRateChange */:
        this.dispatch('playbackRate', payload.playbackRate);
        break;
      case "fullscreenchange" /* FullscreenChange */:
        this.dispatch('isFullscreenActive', payload.fullscreen);
        break;
      case "finish" /* Finish */:
        if (this.loop) {
          this.remoteControl("setCurrentTime" /* SetCurrentTime */, 0);
          setTimeout(() => {
            this.remoteControl("play" /* Play */);
          }, 200);
        }
        else {
          this.dispatch('playbackEnded', true);
        }
        break;
      case "error" /* Error */:
        this.vmError.emit(payload);
        break;
    }
  }
  onEmbedSrcChange() {
    this.hasLoaded = false;
    this.vmLoadStart.emit();
    this.dispatch('viewType', ViewType.Video);
  }
  onEmbedMessage(event) {
    const message = event.detail;
    if (!isUndefined(message.event))
      this.onVimeoEvent(message.event, message.data);
    if (!isUndefined(message.method))
      this.onVimeoMethod(message.method, message.value);
  }
  adjustPosition() {
    if (this.controls) {
      return {};
    }
    const [aw, ah] = this.aspectRatio.split(':').map(r => parseInt(r, 10));
    const height = 240;
    const padding = (100 / aw) * ah;
    const offset = (height - padding) / (height / 50);
    return {
      paddingBottom: `${height}%`,
      transform: `translateY(-${offset + 0.02}%)`,
    };
  }
  /** @internal */
  getAdapter() {
    return __awaiter(this, void 0, void 0, function* () {
      const canPlayRegex = /vimeo(?:\.com|)\/([0-9]{9,})/;
      const fileRegex = /vimeo\.com\/external\/[0-9]+\..+/;
      return {
        getInternalPlayer: () => __awaiter(this, void 0, void 0, function* () { return this.embed; }),
        play: () => __awaiter(this, void 0, void 0, function* () {
          this.remoteControl("play" /* Play */);
        }),
        pause: () => __awaiter(this, void 0, void 0, function* () {
          this.remoteControl("pause" /* Pause */);
        }),
        canPlay: (type) => __awaiter(this, void 0, void 0, function* () { return isString(type) && !fileRegex.test(type) && canPlayRegex.test(type); }),
        setCurrentTime: (time) => __awaiter(this, void 0, void 0, function* () {
          if (time !== this.internalState.currentTime) {
            this.remoteControl("setCurrentTime" /* SetCurrentTime */, time);
          }
        }),
        setMuted: (muted) => __awaiter(this, void 0, void 0, function* () {
          if (!muted)
            this.volume = this.volume > 0 ? this.volume : 30;
          this.remoteControl("setVolume" /* SetVolume */, muted ? 0 : this.volume / 100);
        }),
        setVolume: (volume) => __awaiter(this, void 0, void 0, function* () {
          if (!this.muted) {
            this.remoteControl("setVolume" /* SetVolume */, volume / 100);
          }
          else {
            // Confirm volume was set.
            this.dispatch('volume', volume);
          }
        }),
        // @TODO how to check if Vimeo pro?
        canSetPlaybackRate: () => __awaiter(this, void 0, void 0, function* () { return false; }),
        setPlaybackRate: (rate) => __awaiter(this, void 0, void 0, function* () {
          this.remoteControl("setPlaybackRate" /* SetPlaybackRate */, rate);
        }),
      };
    });
  }
  render() {
    return (h("vm-embed", { class: { hideControls: !this.controls }, style: this.adjustPosition(), embedSrc: this.embedSrc, mediaTitle: this.mediaTitle, origin: this.getOrigin(), params: this.buildParams(), decoder: decodeJSON, preconnections: this.getPreconnections(), onVmEmbedMessage: this.onEmbedMessage.bind(this), onVmEmbedSrcChange: this.onEmbedSrcChange.bind(this), ref: (el) => {
        this.embed = el;
      } }));
  }
  static get watchers() { return {
    "videoId": ["onVideoIdChange"],
    "poster": ["onCustomPosterChange"]
  }; }
};
Vimeo.style = vimeoCss;

export { Vimeo as vm_vimeo };

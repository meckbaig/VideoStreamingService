var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
import { Component, Event, h, Method, Prop, State, Watch, } from '@stencil/core';
import { decodeQueryString } from '../../../utils/network';
import { deferredPromise } from '../../../utils/promise';
import { isString } from '../../../utils/unit';
import { MediaType } from '../../core/player/MediaType';
import { ViewType } from '../../core/player/ViewType';
import { withComponentRegistry } from '../../core/player/withComponentRegistry';
import { withProviderConnect } from '../ProviderConnect';
import { createProviderDispatcher, } from '../ProviderDispatcher';
import { withProviderContext } from '../withProviderContext';
const videoInfoCache = new Map();
/**
 * Enables loading, playing and controlling videos from [Dailymotion](https://www.dailymotion.com).
 *
 * > You don't interact with this component for passing player properties, controlling playback,
 * listening to player events and so on, that is all done through the `vime-player` component.
 */
export class Dailymotion {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.defaultInternalState = {};
    this.internalState = {
      currentTime: 0,
      volume: 0,
      muted: false,
      isAdsPlaying: false,
      playbackReady: false,
    };
    this.embedSrc = '';
    this.mediaTitle = '';
    /**
     * Whether to automatically play the next video in the queue.
     */
    this.shouldAutoplayQueue = false;
    /**
     * Whether to show the 'Up Next' queue.
     */
    this.showUpNextQueue = false;
    /**
     * Whether to show buttons for sharing the video.
     */
    this.showShareButtons = false;
    /**
     * Whether to display the Dailymotion logo.
     */
    this.showDailymotionLogo = false;
    /**
     * Whether to show video information (title and owner) on the start screen.
     */
    this.showVideoInfo = true;
    /** @internal */
    this.language = 'en';
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
    this.internalState = Object.assign({}, this.defaultInternalState);
    if (!this.videoId) {
      this.embedSrc = '';
      return;
    }
    this.embedSrc = `${this.getOrigin()}/embed/video/${this.videoId}?api=1`;
    this.fetchVideoInfo = this.getVideoInfo();
    this.pendingMediaTitleCall = deferredPromise();
  }
  onControlsChange() {
    if (this.internalState.playbackReady) {
      this.remoteControl("controls" /* Controls */, this.controls);
    }
  }
  onCustomPosterChange() {
    this.dispatch('currentPoster', this.poster);
  }
  connectedCallback() {
    this.dispatch = createProviderDispatcher(this);
    this.dispatch('viewType', ViewType.Video);
    this.onVideoIdChange();
    this.internalState.muted = this.muted;
    this.defaultInternalState = Object.assign({}, this.internalState);
  }
  componentWillLoad() {
    this.initialMuted = this.muted;
  }
  getOrigin() {
    return 'https://www.dailymotion.com';
  }
  getPreconnections() {
    return [this.getOrigin(), 'https://static1.dmcdn.net'];
  }
  remoteControl(command, arg) {
    return this.embed.postMessage({
      command,
      parameters: arg ? [arg] : [],
    });
  }
  buildParams() {
    return {
      autoplay: this.autoplay,
      mute: this.initialMuted,
      controls: this.controls,
      'queue-autoplay-next': this.shouldAutoplayQueue,
      'queue-enable': this.showUpNextQueue,
      'sharing-enable': this.showShareButtons,
      syndication: this.syndication,
      'ui-highlight': this.color,
      'ui-logo': this.showDailymotionLogo,
      'ui-start-screen-info': this.showVideoInfo,
    };
  }
  getVideoInfo() {
    return __awaiter(this, void 0, void 0, function* () {
      if (videoInfoCache.has(this.videoId))
        return videoInfoCache.get(this.videoId);
      const apiEndpoint = 'https://api.dailymotion.com';
      return window
        .fetch(`${apiEndpoint}/video/${this.videoId}?fields=duration,thumbnail_1080_url`)
        .then(response => response.json())
        .then(data => {
        const poster = data.thumbnail_1080_url;
        const duration = parseFloat(data.duration);
        videoInfoCache.set(this.videoId, { poster, duration });
        return { poster, duration };
      });
    });
  }
  onEmbedSrcChange() {
    this.vmLoadStart.emit();
    this.dispatch('viewType', ViewType.Video);
  }
  onEmbedMessage(event) {
    var _a, _b;
    const msg = event.detail;
    switch (msg.event) {
      case "playback_ready" /* PlaybackReady */:
        this.onControlsChange();
        this.dispatch('currentSrc', this.embedSrc);
        this.dispatch('mediaType', MediaType.Video);
        Promise.all([
          this.fetchVideoInfo,
          (_a = this.pendingMediaTitleCall) === null || _a === void 0 ? void 0 : _a.promise,
        ]).then(([info, mediaTitle]) => {
          var _a, _b;
          this.dispatch('duration', (_a = info === null || info === void 0 ? void 0 : info.duration) !== null && _a !== void 0 ? _a : -1);
          this.dispatch('currentPoster', (_b = this.poster) !== null && _b !== void 0 ? _b : info === null || info === void 0 ? void 0 : info.poster);
          this.dispatch('mediaTitle', mediaTitle);
          this.dispatch('playbackReady', true);
        });
        break;
      case "videochange" /* VideoChange */:
        (_b = this.pendingMediaTitleCall) === null || _b === void 0 ? void 0 : _b.resolve(msg.title);
        break;
      case "start" /* Start */:
        this.dispatch('paused', false);
        this.dispatch('playbackStarted', true);
        this.dispatch('buffering', true);
        break;
      case "video_start" /* VideoStart */:
        // Commands don't go through until ads have finished, so we store them and then replay them
        // once the video starts.
        this.remoteControl("muted" /* Muted */, this.internalState.muted);
        this.remoteControl("volume" /* Volume */, this.internalState.volume);
        if (this.internalState.currentTime > 0) {
          this.remoteControl("seek" /* Seek */, this.internalState.currentTime);
        }
        break;
      case "play" /* Play */:
        this.dispatch('paused', false);
        break;
      case "pause" /* Pause */:
        this.dispatch('paused', true);
        this.dispatch('playing', false);
        this.dispatch('buffering', false);
        break;
      case "playing" /* Playing */:
        this.dispatch('playing', true);
        this.dispatch('buffering', false);
        break;
      case "video_end" /* VideoEnd */:
        if (this.loop) {
          setTimeout(() => {
            this.remoteControl("play" /* Play */);
          }, 300);
        }
        else {
          this.dispatch('playbackEnded', true);
        }
        break;
      case "timeupdate" /* TimeUpdate */:
        this.dispatch('currentTime', parseFloat(msg.time));
        break;
      case "volumechange" /* VolumeChange */:
        this.dispatch('muted', msg.muted === 'true');
        this.dispatch('volume', Math.floor(parseFloat(msg.volume) * 100));
        break;
      case "seeking" /* Seeking */:
        this.dispatch('currentTime', parseFloat(msg.time));
        this.dispatch('seeking', true);
        break;
      case "seeked" /* Seeked */:
        this.dispatch('currentTime', parseFloat(msg.time));
        this.dispatch('seeking', false);
        break;
      case "waiting" /* Waiting */:
        this.dispatch('buffering', true);
        break;
      case "progress" /* Progress */:
        this.dispatch('buffered', parseFloat(msg.time));
        break;
      case "durationchange" /* DurationChange */:
        this.dispatch('duration', parseFloat(msg.duration));
        break;
      case "qualitiesavailable" /* QualitiesAvailable */:
        this.dispatch('playbackQualities', msg.qualities.map((q) => `${q}p`));
        break;
      case "qualitychange" /* QualityChange */:
        this.dispatch('playbackQuality', `${msg.quality}p`);
        break;
      case "fullscreenchange" /* FullscreenChange */:
        this.dispatch('isFullscreenActive', msg.fullscreen === 'true');
        break;
      case "error" /* Error */:
        this.vmError.emit(msg.error);
        break;
    }
  }
  /** @internal */
  getAdapter() {
    return __awaiter(this, void 0, void 0, function* () {
      const canPlayRegex = /(?:dai\.ly|dailymotion|dailymotion\.com)\/(?:video\/|embed\/|)(?:video\/|)((?:\w)+)/;
      return {
        getInternalPlayer: () => __awaiter(this, void 0, void 0, function* () { return this.embed; }),
        play: () => __awaiter(this, void 0, void 0, function* () {
          this.remoteControl("play" /* Play */);
        }),
        pause: () => __awaiter(this, void 0, void 0, function* () {
          this.remoteControl("pause" /* Pause */);
        }),
        canPlay: (type) => __awaiter(this, void 0, void 0, function* () { return isString(type) && canPlayRegex.test(type); }),
        setCurrentTime: (time) => __awaiter(this, void 0, void 0, function* () {
          if (time !== this.internalState.currentTime) {
            this.internalState.currentTime = time;
            this.remoteControl("seek" /* Seek */, time);
          }
        }),
        setMuted: (muted) => __awaiter(this, void 0, void 0, function* () {
          this.internalState.muted = muted;
          this.remoteControl("muted" /* Muted */, muted);
        }),
        setVolume: (volume) => __awaiter(this, void 0, void 0, function* () {
          this.internalState.volume = volume / 100;
          this.dispatch('volume', volume);
          this.remoteControl("volume" /* Volume */, volume / 100);
        }),
        canSetPlaybackQuality: () => __awaiter(this, void 0, void 0, function* () { return true; }),
        setPlaybackQuality: (quality) => __awaiter(this, void 0, void 0, function* () {
          this.remoteControl("quality" /* Quality */, quality.slice(0, -1));
        }),
        canSetFullscreen: () => __awaiter(this, void 0, void 0, function* () { return true; }),
        enterFullscreen: () => __awaiter(this, void 0, void 0, function* () {
          this.remoteControl("fullscreen" /* Fullscreen */, true);
        }),
        exitFullscreen: () => __awaiter(this, void 0, void 0, function* () {
          this.remoteControl("fullscreen" /* Fullscreen */, false);
        }),
      };
    });
  }
  render() {
    return (h("vm-embed", { embedSrc: this.embedSrc, mediaTitle: this.mediaTitle, origin: this.getOrigin(), params: this.buildParams(), decoder: decodeQueryString, preconnections: this.getPreconnections(), onVmEmbedMessage: this.onEmbedMessage.bind(this), onVmEmbedSrcChange: this.onEmbedSrcChange.bind(this), ref: (el) => {
        this.embed = el;
      } }));
  }
  static get is() { return "vm-dailymotion"; }
  static get encapsulation() { return "shadow"; }
  static get originalStyleUrls() { return {
    "$": ["dailymotion.css"]
  }; }
  static get styleUrls() { return {
    "$": ["dailymotion.css"]
  }; }
  static get properties() { return {
    "videoId": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      },
      "required": true,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "The Dailymotion resource ID of the video to load."
      },
      "attribute": "video-id",
      "reflect": false
    },
    "shouldAutoplayQueue": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "boolean",
        "resolved": "boolean",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "Whether to automatically play the next video in the queue."
      },
      "attribute": "should-autoplay-queue",
      "reflect": false,
      "defaultValue": "false"
    },
    "showUpNextQueue": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "boolean",
        "resolved": "boolean",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "Whether to show the 'Up Next' queue."
      },
      "attribute": "show-up-next-queue",
      "reflect": false,
      "defaultValue": "false"
    },
    "showShareButtons": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "boolean",
        "resolved": "boolean",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "Whether to show buttons for sharing the video."
      },
      "attribute": "show-share-buttons",
      "reflect": false,
      "defaultValue": "false"
    },
    "color": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string | undefined",
        "references": {}
      },
      "required": false,
      "optional": true,
      "docs": {
        "tags": [],
        "text": "Change the default highlight color used in the controls (hex value without the leading #).\nColor set in the Partner HQ will override this prop."
      },
      "attribute": "color",
      "reflect": false
    },
    "syndication": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string | undefined",
        "references": {}
      },
      "required": false,
      "optional": true,
      "docs": {
        "tags": [],
        "text": "Forwards your syndication key to the player."
      },
      "attribute": "syndication",
      "reflect": false
    },
    "showDailymotionLogo": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "boolean",
        "resolved": "boolean",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "Whether to display the Dailymotion logo."
      },
      "attribute": "show-dailymotion-logo",
      "reflect": false,
      "defaultValue": "false"
    },
    "showVideoInfo": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "boolean",
        "resolved": "boolean",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "Whether to show video information (title and owner) on the start screen."
      },
      "attribute": "show-video-info",
      "reflect": false,
      "defaultValue": "true"
    },
    "language": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [{
            "text": undefined,
            "name": "internal"
          }],
        "text": ""
      },
      "attribute": "language",
      "reflect": false,
      "defaultValue": "'en'"
    },
    "autoplay": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "boolean",
        "resolved": "boolean",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [{
            "text": undefined,
            "name": "internal"
          }],
        "text": ""
      },
      "attribute": "autoplay",
      "reflect": false,
      "defaultValue": "false"
    },
    "controls": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "boolean",
        "resolved": "boolean",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [{
            "text": undefined,
            "name": "internal"
          }],
        "text": ""
      },
      "attribute": "controls",
      "reflect": false,
      "defaultValue": "false"
    },
    "poster": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string | undefined",
        "references": {}
      },
      "required": false,
      "optional": true,
      "docs": {
        "tags": [],
        "text": "The absolute URL of a custom poster to be used for the current video."
      },
      "attribute": "poster",
      "reflect": false
    },
    "logger": {
      "type": "unknown",
      "mutable": false,
      "complexType": {
        "original": "Logger",
        "resolved": "Logger | undefined",
        "references": {
          "Logger": {
            "location": "import",
            "path": "../../core/player/PlayerLogger"
          }
        }
      },
      "required": false,
      "optional": true,
      "docs": {
        "tags": [{
            "text": undefined,
            "name": "internal"
          }],
        "text": ""
      }
    },
    "loop": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "boolean",
        "resolved": "boolean",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [{
            "text": undefined,
            "name": "internal"
          }],
        "text": ""
      },
      "attribute": "loop",
      "reflect": false,
      "defaultValue": "false"
    },
    "muted": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "boolean",
        "resolved": "boolean",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [{
            "text": undefined,
            "name": "internal"
          }],
        "text": ""
      },
      "attribute": "muted",
      "reflect": false,
      "defaultValue": "false"
    },
    "playsinline": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "boolean",
        "resolved": "boolean",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [{
            "text": undefined,
            "name": "internal"
          }],
        "text": ""
      },
      "attribute": "playsinline",
      "reflect": false,
      "defaultValue": "false"
    }
  }; }
  static get states() { return {
    "embedSrc": {},
    "mediaTitle": {}
  }; }
  static get events() { return [{
      "method": "vmLoadStart",
      "name": "vmLoadStart",
      "bubbles": true,
      "cancelable": true,
      "composed": true,
      "docs": {
        "tags": [{
            "text": undefined,
            "name": "internal"
          }],
        "text": ""
      },
      "complexType": {
        "original": "void",
        "resolved": "void",
        "references": {}
      }
    }, {
      "method": "vmError",
      "name": "vmError",
      "bubbles": true,
      "cancelable": true,
      "composed": true,
      "docs": {
        "tags": [],
        "text": "Emitted when an error has occurred."
      },
      "complexType": {
        "original": "string | undefined",
        "resolved": "string | undefined",
        "references": {}
      }
    }]; }
  static get methods() { return {
    "getAdapter": {
      "complexType": {
        "signature": "() => Promise<{ getInternalPlayer: () => Promise<HTMLVmEmbedElement>; play: () => Promise<void>; pause: () => Promise<void>; canPlay: (type: any) => Promise<boolean>; setCurrentTime: (time: number) => Promise<void>; setMuted: (muted: boolean) => Promise<void>; setVolume: (volume: number) => Promise<void>; canSetPlaybackQuality: () => Promise<boolean>; setPlaybackQuality: (quality: string) => Promise<void>; canSetFullscreen: () => Promise<boolean>; enterFullscreen: () => Promise<void>; exitFullscreen: () => Promise<void>; }>",
        "parameters": [],
        "references": {
          "Promise": {
            "location": "global"
          },
          "HTMLVmEmbedElement": {
            "location": "global"
          }
        },
        "return": "Promise<{ getInternalPlayer: () => Promise<HTMLVmEmbedElement>; play: () => Promise<void>; pause: () => Promise<void>; canPlay: (type: any) => Promise<boolean>; setCurrentTime: (time: number) => Promise<void>; setMuted: (muted: boolean) => Promise<void>; setVolume: (volume: number) => Promise<void>; canSetPlaybackQuality: () => Promise<boolean>; setPlaybackQuality: (quality: string) => Promise<void>; canSetFullscreen: () => Promise<boolean>; enterFullscreen: () => Promise<void>; exitFullscreen: () => Promise<void>; }>"
      },
      "docs": {
        "text": "",
        "tags": [{
            "name": "internal",
            "text": undefined
          }]
      }
    }
  }; }
  static get watchers() { return [{
      "propName": "videoId",
      "methodName": "onVideoIdChange"
    }, {
      "propName": "controls",
      "methodName": "onControlsChange"
    }, {
      "propName": "poster",
      "methodName": "onCustomPosterChange"
    }]; }
}

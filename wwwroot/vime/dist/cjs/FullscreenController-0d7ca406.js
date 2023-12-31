'use strict';

const withComponentRegistry = require('./withComponentRegistry-90ec334c.js');

var key = {
    fullscreenEnabled: 0,
    fullscreenElement: 1,
    requestFullscreen: 2,
    exitFullscreen: 3,
    fullscreenchange: 4,
    fullscreenerror: 5,
    fullscreen: 6
};
var webkit = [
    'webkitFullscreenEnabled',
    'webkitFullscreenElement',
    'webkitRequestFullscreen',
    'webkitExitFullscreen',
    'webkitfullscreenchange',
    'webkitfullscreenerror',
    '-webkit-full-screen',
];
var moz = [
    'mozFullScreenEnabled',
    'mozFullScreenElement',
    'mozRequestFullScreen',
    'mozCancelFullScreen',
    'mozfullscreenchange',
    'mozfullscreenerror',
    '-moz-full-screen',
];
var ms = [
    'msFullscreenEnabled',
    'msFullscreenElement',
    'msRequestFullscreen',
    'msExitFullscreen',
    'MSFullscreenChange',
    'MSFullscreenError',
    '-ms-fullscreen',
];
// so it doesn't throw if no window or document
var document = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : {};
var vendor = (('fullscreenEnabled' in document && Object.keys(key)) ||
    (webkit[0] in document && webkit) ||
    (moz[0] in document && moz) ||
    (ms[0] in document && ms) ||
    []);
var fscreen = {
    requestFullscreen: function (element) { return element[vendor[key.requestFullscreen]](); },
    requestFullscreenFunction: function (element) { return element[vendor[key.requestFullscreen]]; },
    get exitFullscreen() { return document[vendor[key.exitFullscreen]].bind(document); },
    get fullscreenPseudoClass() { return ":" + vendor[key.fullscreen]; },
    addEventListener: function (type, handler, options) { return document.addEventListener(vendor[key[type]], handler, options); },
    removeEventListener: function (type, handler, options) { return document.removeEventListener(vendor[key[type]], handler, options); },
    get fullscreenEnabled() { return Boolean(document[vendor[key.fullscreenEnabled]]); },
    set fullscreenEnabled(val) { },
    get fullscreenElement() { return document[vendor[key.fullscreenElement]]; },
    set fullscreenElement(val) { },
    get onfullscreenchange() { return document[("on" + vendor[key.fullscreenchange]).toLowerCase()]; },
    set onfullscreenchange(handler) { return document[("on" + vendor[key.fullscreenchange]).toLowerCase()] = handler; },
    get onfullscreenerror() { return document[("on" + vendor[key.fullscreenerror]).toLowerCase()]; },
    set onfullscreenerror(handler) { return document[("on" + vendor[key.fullscreenerror]).toLowerCase()] = handler; },
};

function mitt(n){return {all:n=n||new Map,on:function(t,e){var i=n.get(t);i?i.push(e):n.set(t,[e]);},off:function(t,e){var i=n.get(t);i&&(e?i.splice(i.indexOf(e)>>>0,1):n.set(t,[]));},emit:function(t,e){var i=n.get(t);i&&i.slice().map(function(n){n(e);}),(i=n.get("*"))&&i.slice().map(function(n){n(t,e);});}}}

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
/**
 * Unfortunately fullscreen isn't straight forward due to cross-browser inconsistencies. This
 * class abstract the logic for handling fullscreen across browsers.
 */
class FullscreenController {
  constructor(host) {
    this.host = host;
    this.disposal = new withComponentRegistry.Disposal();
    this.emitter = mitt();
  }
  /**
   * Whether fullscreen mode can be requested, generally is an API available to do so.
   */
  get isSupported() {
    return this.isSupportedNatively;
  }
  /**
   * Whether the native Fullscreen API is enabled/available.
   */
  get isSupportedNatively() {
    return fscreen.fullscreenEnabled;
  }
  /**
   * Whether the host element is in fullscreen mode.
   */
  get isFullscreen() {
    return this.isNativeFullscreen;
  }
  /**
   * Whether the host element is in fullscreen mode via the native Fullscreen API.
   */
  get isNativeFullscreen() {
    if (fscreen.fullscreenElement === this.host)
      return true;
    try {
      // Throws in iOS Safari...
      return this.host.matches(
      // Property `fullscreenPseudoClass` is missing from `@types/fscreen`.
      fscreen
        .fullscreenPseudoClass);
    }
    catch (error) {
      return false;
    }
  }
  on(type, handler) {
    // @ts-expect-error - not typed yet.
    this.emitter.on(type, handler);
  }
  off(type, handler) {
    // @ts-expect-error - not typed yet.
    this.emitter.off(type, handler);
  }
  /**
   * Dispose of any event listeners and exit fullscreen (if active).
   */
  destroy() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.isFullscreen)
        yield this.exitFullscreen();
      this.disposal.empty();
      this.emitter.all.clear();
    });
  }
  addFullscreenChangeEventListener(handler) {
    if (!this.isSupported)
      return withComponentRegistry.noop;
    return withComponentRegistry.listen(fscreen, 'fullscreenchange', handler);
  }
  addFullscreenErrorEventListener(handler) {
    if (!this.isSupported)
      return withComponentRegistry.noop;
    return withComponentRegistry.listen(fscreen, 'fullscreenerror', handler);
  }
  requestFullscreen() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.isFullscreen)
        return;
      this.throwIfNoFullscreenSupport();
      // TODO: Check if PiP is active, if so make sure to exit - need PipController.
      this.disposal.add(this.addFullscreenChangeEventListener(this.handleFullscreenChange.bind(this)));
      this.disposal.add(this.addFullscreenErrorEventListener(this.handleFullscreenError.bind(this)));
      return this.makeEnterFullscreenRequest();
    });
  }
  makeEnterFullscreenRequest() {
    return __awaiter(this, void 0, void 0, function* () {
      return fscreen.requestFullscreen(this.host);
    });
  }
  handleFullscreenChange() {
    if (!this.isFullscreen)
      this.disposal.empty();
    this.emitter.emit('change', this.isFullscreen);
  }
  handleFullscreenError(event) {
    this.emitter.emit('error', event);
  }
  exitFullscreen() {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.isFullscreen)
        return;
      this.throwIfNoFullscreenSupport();
      return this.makeExitFullscreenRequest();
    });
  }
  makeExitFullscreenRequest() {
    return __awaiter(this, void 0, void 0, function* () {
      return fscreen.exitFullscreen();
    });
  }
  throwIfNoFullscreenSupport() {
    if (this.isSupported)
      return;
    throw Error('Fullscreen API is not enabled or supported in this environment.');
  }
}

exports.FullscreenController = FullscreenController;
exports.mitt = mitt;

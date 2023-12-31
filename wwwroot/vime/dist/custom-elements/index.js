import { getElement, getRenderingRef, writeTask, h, attachShadow, Host, createEvent, Fragment, proxyCustomElement } from '@stencil/core/internal/client';
export { setAssetPath, setPlatformOptions } from '@stencil/core/internal/client';

/**
 * Listen to an event on the given DOM node. Returns a callback to remove the event listener.
 */
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function fireEventAndRetry(el, event, onFail, interval = 300, maxRetries = 10) {
  let timeout;
  let attempt = 0;
  let found = false;
  function retry() {
    if (found)
      return;
    timeout = setTimeout(() => {
      if (attempt === maxRetries) {
        onFail === null || onFail === void 0 ? void 0 : onFail();
        return;
      }
      el.dispatchEvent(event);
      attempt += 1;
      retry();
    }, interval);
  }
  retry();
  return () => {
    window.clearTimeout(timeout);
    found = true;
  };
}
const isColliding = (a, b, translateAx = 0, translateAy = 0, translateBx = 0, translateBy = 0) => {
  const aRect = a.getBoundingClientRect();
  const bRect = b.getBoundingClientRect();
  return (aRect.left + translateAx < bRect.right + translateBx &&
    aRect.right + translateAx > bRect.left + translateBx &&
    aRect.top + translateAy < bRect.bottom + translateBy &&
    aRect.bottom + translateAy > bRect.top + translateBy);
};

/**
 * No-operation (noop).
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noop = (..._) => {
  // ...
};
/**
 * Checks if `value` is `null`.
 *
 * @param value - The value to check.
 */
const isNull = (value) => value === null;
/**
 * Checks if `value` is `undefined`.
 *
 * @param value - The value to check.
 */
const isUndefined = (value) => typeof value === 'undefined';
/**
 * Checks if `value` is `null` or `undefined`.
 *
 * @param value - The value to check.
 */
const isNil = (value) => isNull(value) || isUndefined(value);
/**
 * Returns the constructor of the given `value`.
 *
 * @param value - The value to return the constructor of.
 */
const getConstructor = (value) => 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
!isNil(value) ? value.constructor : undefined;
/**
 * Checks if `value` is classified as a `Object` object.
 *
 * @param value - The value to check.
 */
const isObject = (value) => getConstructor(value) === Object;
/**
 * Checks if `value` is classified as a `Number` object.
 *
 * @param value - The value to check.
 */
const isNumber = (value) => getConstructor(value) === Number && !Number.isNaN(value);
/**
 * Checks if `value` is classified as a `String` object.
 *
 * @param value - The value to check.
 */
const isString = (value) => getConstructor(value) === String;
/**
 * Checks if `value` is classified as a `Boolean` object.
 *
 * @param value - The value to check.
 */
const isBoolean = (value) => getConstructor(value) === Boolean;
/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @param value - The value to check.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
const isFunction = (value) => getConstructor(value) === Function;
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @param value - The value to check.
 */
const isArray = (value) => Array.isArray(value);
/**
 * Checks if `value` is an instanceof the given `constructor`.
 *
 * @param value - The value to check.
 * @param constructor - The constructor to check against.
 */
const isInstanceOf = (value, constructor) => Boolean(value && constructor && value instanceof constructor);

/**
 * Creates an empty Promise and defers resolving/rejecting it.
 */
const deferredPromise = () => {
  let resolve = noop;
  let reject = noop;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

function wrapStencilHook(component, lifecycle, hook) {
  const prevHook = component[lifecycle];
  component[lifecycle] = function () {
    hook();
    return prevHook ? prevHook.call(component) : undefined;
  };
}
function createStencilHook(component, onConnect, onDisconnect) {
  let hasLoaded = false;
  if (!isUndefined(onConnect)) {
    wrapStencilHook(component, 'componentWillLoad', () => {
      onConnect();
      hasLoaded = true;
    });
    wrapStencilHook(component, 'connectedCallback', () => {
      if (hasLoaded)
        onConnect();
    });
  }
  if (!isUndefined(onDisconnect)) {
    wrapStencilHook(component, 'disconnectedCallback', () => {
      onDisconnect();
    });
  }
}

const FIND_PLAYER_EVENT = 'vmFindPlayer';
function withFindPlayer(player) {
  const el = getElement(player);
  let off;
  createStencilHook(player, () => {
    off = listen(el, FIND_PLAYER_EVENT, (event) => {
      event.stopPropagation();
      event.detail(el);
    });
  }, () => {
    off === null || off === void 0 ? void 0 : off();
  });
}
/**
 * Finds the closest ancestor player element by firing the `vmFindPlayer` event, and waiting
 * for the player to catch it. This function retries finding the player (`maxRetries`) until it
 * gives up and fails.
 *
 * @param ref - A HTMLElement that is within the player's subtree.
 * @param interval - The length of the timeout before trying again in milliseconds.
 * @param maxRetries - The number of times to retry firing the event.
 */
const findPlayer = (ref, interval = 300, maxRetries = 10) => {
  const el = (isInstanceOf(ref, HTMLElement)
    ? ref
    : getElement(ref));
  const search = deferredPromise();
  // eslint-disable-next-line prefer-const
  let stopFiring;
  const event = new CustomEvent(FIND_PLAYER_EVENT, {
    bubbles: true,
    composed: true,
    detail: player => {
      search.resolve(player);
      stopFiring();
    },
  });
  stopFiring = fireEventAndRetry(el, event, () => {
    search.reject(`Could not find player for ${el.nodeName}`);
  }, interval, maxRetries);
  return search.promise;
};

var MediaType;
(function (MediaType) {
  MediaType["Audio"] = "audio";
  MediaType["Video"] = "video";
})(MediaType || (MediaType = {}));

const STATE_CHANGE_EVENT = 'vmStateChange';
/**
 * Creates a dispatcher on the given `ref`, to send updates to the closest ancestor player via
 * the custom `vmStateChange` event.
 *
 * @param ref An element to dispatch the state change events from.
 */
const createDispatcher = (ref) => (prop, value) => {
  const el = isInstanceOf(ref, HTMLElement) ? ref : getElement(ref);
  const event = new CustomEvent(STATE_CHANGE_EVENT, {
    bubbles: true,
    composed: true,
    detail: { by: el, prop, value },
  });
  el.dispatchEvent(event);
};

const en = {
  play: 'Play',
  pause: 'Pause',
  playback: 'Playback',
  scrubber: 'Scrubber',
  scrubberLabel: '{currentTime} of {duration}',
  played: 'Played',
  duration: 'Duration',
  buffered: 'Buffered',
  close: 'Close',
  currentTime: 'Current time',
  live: 'LIVE',
  volume: 'Volume',
  mute: 'Mute',
  unmute: 'Unmute',
  audio: 'Audio',
  default: 'Default',
  captions: 'Captions',
  subtitlesOrCc: 'Subtitles/CC',
  enableCaptions: 'Enable subtitles/captions',
  disableCaptions: 'Disable subtitles/captions',
  auto: 'Auto',
  fullscreen: 'Fullscreen',
  enterFullscreen: 'Enter fullscreen',
  exitFullscreen: 'Exit fullscreen',
  settings: 'Settings',
  seekForward: 'Seek forward',
  seekBackward: 'Seek backward',
  seekTotal: 'Seek total',
  normal: 'Normal',
  none: 'None',
  playbackRate: 'Playback Rate',
  playbackQuality: 'Playback Quality',
  loop: 'Loop',
  disabled: 'Disabled',
  off: 'Off',
  enabled: 'Enabled',
  pip: 'Picture-in-Picture',
  enterPiP: 'Miniplayer',
  exitPiP: 'Expand',
};

const initialState = {
  theme: undefined,
  paused: true,
  playing: false,
  duration: -1,
  currentProvider: undefined,
  mediaTitle: undefined,
  currentSrc: undefined,
  currentPoster: undefined,
  textTracks: [],
  currentTextTrack: -1,
  audioTracks: [],
  currentAudioTrack: -1,
  isTextTrackVisible: true,
  shouldRenderNativeTextTracks: true,
  icons: 'vime',
  currentTime: 0,
  autoplay: false,
  ready: false,
  playbackReady: false,
  loop: false,
  muted: false,
  buffered: 0,
  playbackRate: 1,
  playbackRates: [1],
  playbackQuality: undefined,
  playbackQualities: [],
  seeking: false,
  debug: false,
  playbackStarted: false,
  playbackEnded: false,
  buffering: false,
  controls: false,
  isControlsActive: false,
  volume: 50,
  isFullscreenActive: false,
  aspectRatio: '16:9',
  viewType: undefined,
  isAudioView: false,
  isVideoView: false,
  mediaType: undefined,
  isAudio: false,
  isVideo: false,
  isMobile: false,
  isTouch: false,
  isSettingsActive: false,
  isLive: false,
  isPiPActive: false,
  autopause: true,
  playsinline: false,
  language: 'en',
  languages: ['en'],
  translations: { en },
  i18n: en,
};
const writableProps = new Set([
  'autoplay',
  'autopause',
  'aspectRatio',
  'controls',
  'theme',
  'debug',
  'paused',
  'currentTime',
  'language',
  'loop',
  'translations',
  'playbackQuality',
  'muted',
  'playbackRate',
  'playsinline',
  'volume',
  'isSettingsActive',
  'isControlsActive',
  'shouldRenderNativeTextTracks',
]);
const isWritableProp = (prop) => writableProps.has(prop);
/**
 * Player properties that should be reset when the media is changed.
 */
const resetableProps = new Set([
  'paused',
  'currentTime',
  'duration',
  'buffered',
  'seeking',
  'playing',
  'buffering',
  'playbackReady',
  'textTracks',
  'currentTextTrack',
  'audioTracks',
  'currentAudioTrack',
  'mediaTitle',
  'currentSrc',
  'currentPoster',
  'playbackRate',
  'playbackRates',
  'playbackStarted',
  'playbackEnded',
  'playbackQuality',
  'playbackQualities',
  'mediaType',
]);
const shouldPropResetOnMediaChange = (prop) => resetableProps.has(prop);

var ViewType;
(function (ViewType) {
  ViewType["Audio"] = "audio";
  ViewType["Video"] = "video";
})(ViewType || (ViewType = {}));

class Disposal {
  constructor(dispose = []) {
    this.dispose = dispose;
  }
  add(callback) {
    this.dispose.push(callback);
  }
  empty() {
    this.dispose.forEach(fn => fn());
    this.dispose = [];
  }
}

var __awaiter$y = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const PLAYER_KEY = Symbol('vmPlayerKey');
const COMPONENT_NAME_KEY = Symbol('vmNameKey');
const REGISTRY_KEY = Symbol('vmRegistryKey');
const REGISTRATION_KEY = Symbol('vmRegistrationKey');
const REGISTER_COMPONENT_EVENT = 'vmComponentRegister';
const COMPONENT_REGISTERED_EVENT = 'vmComponentRegistered';
const COMPONENT_DEREGISTERED_EVENT = 'vmComponentDeregistered';
const getRegistrant = (ref) => isInstanceOf(ref, HTMLElement)
  ? ref
  : getElement(ref);
/**
 * Handles registering/deregistering the given `component` in the player registry. All registries
 * are bound per player subtree.
 *
 * @param ref - A Stencil component instance or HTMLElement.
 */
function withComponentRegistry(ref, name) {
  const registryId = Symbol('vmRegistryId');
  const registrant = getRegistrant(ref);
  registrant[COMPONENT_NAME_KEY] = name !== null && name !== void 0 ? name : registrant.nodeName.toLowerCase();
  registrant[REGISTRATION_KEY] = registryId;
  const buildEvent = (eventName) => new CustomEvent(eventName, {
    bubbles: true,
    composed: true,
    detail: registrant,
  });
  const registerEvent = buildEvent(REGISTER_COMPONENT_EVENT);
  createStencilHook(ref, () => {
    registrant.dispatchEvent(registerEvent);
  });
}
function withComponentRegistrar(player) {
  const el = getElement(player);
  const registry = new Map();
  const disposal = new Disposal();
  // TODO properly type this later.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  el[REGISTRY_KEY] = registry;
  function onDeregister(registrant) {
    delete registrant[PLAYER_KEY];
    delete registrant[REGISTRY_KEY];
    registry.delete(registrant[REGISTRATION_KEY]);
    el.dispatchEvent(new CustomEvent(COMPONENT_DEREGISTERED_EVENT, { detail: registrant }));
  }
  function onRegister(e) {
    const ref = e.detail;
    const registrant = getRegistrant(ref);
    registrant[PLAYER_KEY] = el;
    registrant[REGISTRY_KEY] = registry;
    registry.set(registrant[REGISTRATION_KEY], registrant);
    el.dispatchEvent(new CustomEvent(COMPONENT_REGISTERED_EVENT, { detail: registrant }));
    createStencilHook(ref, undefined, () => onDeregister(registrant));
  }
  createStencilHook(player, () => {
    disposal.add(listen(el, REGISTER_COMPONENT_EVENT, onRegister));
  }, () => {
    registry.clear();
    disposal.empty();
    delete player[REGISTRY_KEY];
  });
}
/**
 * Checks whether any component with the given `name` exists in the registry. All registries
 * are bound per player subtree.
 *
 * @param ref - A Stencil component instance or HTMLElement.
 * @param name - The name of the component to search for.
 */
function isComponentRegistered(ref, name) {
  var _a;
  const registrant = getRegistrant(ref);
  const registry = registrant[REGISTRY_KEY];
  return Array.from((_a = registry === null || registry === void 0 ? void 0 : registry.values()) !== null && _a !== void 0 ? _a : []).some(r => r[COMPONENT_NAME_KEY] === name);
}
/**
 * Returns the player for the given `ref`. This will only work after the component has been
 * registered, prefer using `findPlayer`.
 *
 * @param ref - A Stencil component instance or HTMLElement.
 */
function getPlayerFromRegistry(ref) {
  const registrant = getRegistrant(ref);
  return registrant[PLAYER_KEY];
}
/**
 * Returns a collection of components from the registry for the given `ref`. All registries
 * are bound per player subtree.
 *
 * @param ref - A Stencil component instance or HTMLElement.
 * @param name - The name of the components to search for in the registry.
 */
function getComponentFromRegistry(ref, name) {
  var _a, _b;
  const registrant = getRegistrant(ref);
  return Array.from((_b = (_a = registrant[REGISTRY_KEY]) === null || _a === void 0 ? void 0 : _a.values()) !== null && _b !== void 0 ? _b : []).filter(r => r[COMPONENT_NAME_KEY] === name);
}
/**
 * Watches the current registry on the given `ref` for changes. All registries are bound per
 * player subtree.
 *
 * @param ref - A Stencil component instance or HTMLElement.
 * @param name - The name of the component to watch for.
 * @param onChange - A callback that is called when a component is registered/deregistered.
 */
function watchComponentRegistry(ref, name, onChange) {
  var _a;
  return __awaiter$y(this, void 0, void 0, function* () {
    const player = yield findPlayer(ref);
    const disposal = new Disposal();
    const registry = getRegistrant(ref)[REGISTRY_KEY];
    function listener(e) {
      if (e.detail[COMPONENT_NAME_KEY] === name)
        onChange === null || onChange === void 0 ? void 0 : onChange(getComponentFromRegistry(player, name));
    }
    // Hydrate.
    Array.from((_a = registry === null || registry === void 0 ? void 0 : registry.values()) !== null && _a !== void 0 ? _a : []).forEach(reg => listener(new CustomEvent('', { detail: reg })));
    if (!isUndefined(player)) {
      disposal.add(listen(player, COMPONENT_REGISTERED_EVENT, listener));
      disposal.add(listen(player, COMPONENT_DEREGISTERED_EVENT, listener));
    }
    createStencilHook(ref, () => {
      // no-op
    }, () => {
      disposal.empty();
    });
    return () => {
      disposal.empty();
    };
  });
}

var createDeferredPromise = function () {
    var resolve;
    var promise = new Promise(function (res) { resolve = res; });
    return { promise: promise, resolve: resolve };
};

var openWormhole = function (Component, props, isBlocking) {
    if (isBlocking === void 0) { isBlocking = true; }
    var isConstructor = (Component.constructor.name === 'Function');
    var Proto = isConstructor ? Component.prototype : Component;
    var componentWillLoad = Proto.componentWillLoad;
    Proto.componentWillLoad = function () {
        var _this = this;
        var el = getElement(this);
        var onOpen = createDeferredPromise();
        var event = new CustomEvent('openWormhole', {
            bubbles: true,
            composed: true,
            detail: {
                consumer: this,
                fields: props,
                updater: function (prop, value) {
                    var target = (prop in el) ? el : _this;
                    target[prop] = value;
                },
                onOpen: onOpen,
            },
        });
        el.dispatchEvent(event);
        var willLoad = function () {
            if (componentWillLoad) {
                return componentWillLoad.call(_this);
            }
        };
        return isBlocking ? onOpen.promise.then(function () { return willLoad(); }) : (willLoad());
    };
};

var multiverse = new Map();
var updateConsumer = function (_a, state) {
    var fields = _a.fields, updater = _a.updater;
    fields.forEach(function (field) { updater(field, state[field]); });
};
var Universe = {
    create: function (creator, initialState) {
        var el = getElement(creator);
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
        var creator = getRenderingRef();
        if (multiverse.has(creator)) {
            var universe = multiverse.get(creator);
            universe.state = state;
            universe.wormholes.forEach(function (opening) { updateConsumer(opening, state); });
        }
        return children;
    }
};

const LOAD_START_EVENT = 'vmLoadStart';
// Events that toggle state and the prop is named `is{PropName}...`.
const isToggleStateEvent = new Set([
  'isFullscreenActive',
  'isControlsActive',
  'isTextTrackVisible',
  'isPiPActive',
  'isLive',
  'isTouch',
  'isAudio',
  'isVideo',
  'isAudioView',
  'isVideoView',
]);
// Events that are emitted without the 'Change' postfix.
const hasShortenedEventName = new Set([
  'ready',
  'playbackStarted',
  'playbackEnded',
  'playbackReady',
]);
const getEventName = (prop) => {
  // Example: isFullscreenActive -> vmFullscreenChange
  if (isToggleStateEvent.has(prop)) {
    return `vm${prop.replace('is', '').replace('Active', '')}Change`;
  }
  // Example: playbackStarted -> vmPlaybackStarted
  if (hasShortenedEventName.has(prop)) {
    return `vm${prop.charAt(0).toUpperCase()}${prop.slice(1)}`;
  }
  // Example: currentTime -> vmCurrentTimeChange
  return `vm${prop.charAt(0).toUpperCase()}${prop.slice(1)}Change`;
};
function firePlayerEvent(el, prop, newValue, oldValue) {
  const events = [];
  events.push(new CustomEvent(getEventName(prop), { detail: newValue }));
  if (prop === 'paused' && !newValue)
    events.push(new CustomEvent('vmPlay'));
  if (prop === 'seeking' && oldValue && !newValue)
    events.push(new CustomEvent('vmSeeked'));
  events.forEach(event => {
    el.dispatchEvent(event);
  });
}

var __awaiter$x = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
/**
 * Binds props between an instance of a given component class and it's closest ancestor player.
 *
 * @param component A Stencil component instance.
 * @param props A set of props to watch and update on the given component instance.
 */
const withPlayerContext = (component, props) => openWormhole(component, props);
/**
 * Finds the closest ancestor player to the given `ref` and watches the given props for changes. On
 * a prop change the given `updater` fn is called.
 *
 * @param ref A element within any player's subtree.
 * @param props A set of props to watch and call the `updater` fn with.
 * @param updater This function is called with the prop/value of any watched properties.
 */
const usePlayerContext = (ref, props, updater, playerRef) => __awaiter$x(void 0, void 0, void 0, function* () {
  const player = playerRef !== null && playerRef !== void 0 ? playerRef : (yield findPlayer(ref));
  const listeners = !isUndefined(player)
    ? props.map(prop => {
      const event = getEventName(prop);
      return listen(player, event, () => {
        updater(prop, player[prop]);
      });
    })
    : [];
  return () => {
    listeners.forEach(off => off());
  };
});

var Provider;
(function (Provider) {
  Provider["Audio"] = "audio";
  Provider["Video"] = "video";
  Provider["HLS"] = "hls";
  Provider["Dash"] = "dash";
  Provider["YouTube"] = "youtube";
  Provider["Vimeo"] = "vimeo";
  Provider["Dailymotion"] = "dailymotion";
})(Provider || (Provider = {}));

const audioRegex = /\.(m4a|mp4a|mpga|mp2|mp2a|mp3|m2a|m3a|wav|weba|aac|oga|spx)($|\?)/i;
const videoRegex = /\.(mp4|og[gv]|webm|mov|m4v)($|\?)/i;
const hlsRegex = /\.(m3u8)($|\?)/i;
const hlsTypeRegex = /^application\/(x-mpegURL|vnd\.apple\.mpegURL)$/i;
const dashRegex = /\.(mpd)($|\?)/i;

const PROVIDER_CHANGE_EVENT = 'vmProviderChange';
/**
 * Creates a dispatcher on the given `ref`, to send updates to the closest ancestor player via
 * the custom `vmProviderChange` event.
 *
 * @param ref A component reference to dispatch the state change events from.
 */
const createProviderDispatcher = (ref) => (prop, value) => {
  const el = isInstanceOf(ref, HTMLElement) ? ref : getElement(ref);
  const event = new CustomEvent(PROVIDER_CHANGE_EVENT, {
    bubbles: true,
    composed: true,
    detail: { by: el, prop, value },
  });
  el.dispatchEvent(event);
};

const providerWritableProps = new Set([
  'ready',
  'playing',
  'playbackReady',
  'playbackStarted',
  'playbackEnded',
  'seeking',
  'buffered',
  'buffering',
  'duration',
  'viewType',
  'mediaTitle',
  'mediaType',
  'currentSrc',
  'currentPoster',
  'playbackRates',
  'playbackQualities',
  'textTracks',
  'currentTextTrack',
  'isTextTrackVisible',
  'audioTracks',
  'currentAudioTrack',
  'isPiPActive',
  'isFullscreenActive',
]);
const isProviderWritableProp = (prop) => isWritableProp(prop) || providerWritableProps.has(prop);

var __awaiter$w = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const PROVIDER_CACHE_KEY = Symbol('vmProviderCache');
const PROVIDER_CONNECT_EVENT = 'vmMediaProviderConnect';
const PROVIDER_DISCONNECT_EVENT = 'vmMediaProviderDisconnect';
function buildProviderConnectEvent(name, host) {
  return new CustomEvent(name, {
    bubbles: true,
    composed: true,
    detail: host,
  });
}
function withProviderHost(connector) {
  const el = getElement(connector);
  const disposal = new Disposal();
  const cache = new Map();
  connector[PROVIDER_CACHE_KEY] = cache;
  function initCache() {
    Object.keys(connector).forEach(prop => {
      cache.set(prop, connector[prop]);
    });
  }
  function onDisconnect() {
    writeTask(() => __awaiter$w(this, void 0, void 0, function* () {
      var _a;
      connector.ready = false;
      connector.provider = undefined;
      cache.clear();
      (_a = connector.onProviderDisconnect) === null || _a === void 0 ? void 0 : _a.call(connector);
      el.dispatchEvent(buildProviderConnectEvent(PROVIDER_DISCONNECT_EVENT));
    }));
  }
  function onConnect(event) {
    event.stopImmediatePropagation();
    initCache();
    const hostRef = event.detail;
    const host = getElement(event.detail);
    if (connector.provider === host)
      return;
    const name = host === null || host === void 0 ? void 0 : host.nodeName.toLowerCase().replace('vm-', '');
    writeTask(() => __awaiter$w(this, void 0, void 0, function* () {
      connector.provider = host;
      connector.currentProvider = Object.values(Provider).find(provider => name === provider);
      createStencilHook(hostRef, undefined, () => onDisconnect());
    }));
  }
  function onChange(event) {
    var _a;
    event.stopImmediatePropagation();
    const { by, prop, value } = event.detail;
    if (!isProviderWritableProp(prop)) {
      (_a = connector.logger) === null || _a === void 0 ? void 0 : _a.warn(`${by.nodeName} tried to change \`${prop}\` but it is readonly.`);
      return;
    }
    writeTask(() => {
      cache.set(prop, value);
      connector[prop] = value;
    });
  }
  createStencilHook(connector, () => {
    disposal.add(listen(el, PROVIDER_CONNECT_EVENT, onConnect));
    disposal.add(listen(el, PROVIDER_CHANGE_EVENT, onChange));
  }, () => {
    disposal.empty();
    cache.clear();
  });
}
function withProviderConnect(ref) {
  const connectEvent = buildProviderConnectEvent(PROVIDER_CONNECT_EVENT, ref);
  createStencilHook(ref, () => {
    getElement(ref).dispatchEvent(connectEvent);
  });
}

var __awaiter$v = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const Audio = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    /**
     * @internal Whether an external SDK will attach itself to the media player and control it.
     */
    this.willAttach = false;
    /** @inheritdoc */
    this.preload = 'metadata';
    withComponentRegistry(this);
    if (!this.willAttach)
      withProviderConnect(this);
  }
  /** @internal */
  getAdapter() {
    var _a, _b;
    return __awaiter$v(this, void 0, void 0, function* () {
      const adapter = (_b = (yield ((_a = this.fileProvider) === null || _a === void 0 ? void 0 : _a.getAdapter()))) !== null && _b !== void 0 ? _b : {};
      adapter.canPlay = (type) => __awaiter$v(this, void 0, void 0, function* () { return isString(type) && audioRegex.test(type); });
      return adapter;
    });
  }
  render() {
    return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    h("vm-file", { noConnect: true, willAttach: this.willAttach, crossOrigin: this.crossOrigin, preload: this.preload, disableRemotePlayback: this.disableRemotePlayback, mediaTitle: this.mediaTitle, viewType: ViewType.Audio, ref: (el) => {
        this.fileProvider = el;
      } }, h("slot", null)));
  }
};

const captionControlCss = ":host([hidden]){display:none}";

var __awaiter$u = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const CaptionControl = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
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
    return __awaiter$u(this, void 0, void 0, function* () {
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
  static get style() { return captionControlCss; }
};

/* eslint-disable func-names */
const watch$1 = new Set();
const controls = new Set();
// watchedEl -> (controlsEl -> controlsHeight) saved on collision. Basically keeps track of
// every collision with all controls for each watched element.
const collisions = new Map();
function update() {
  writeTask(() => {
    controls.forEach(controlsEl => {
      const controlsHeight = parseFloat(window.getComputedStyle(controlsEl).height);
      watch$1.forEach(watchedEl => {
        const watchedElCollisions = collisions.get(watchedEl);
        const hasCollided = isColliding(watchedEl, controlsEl);
        const willCollide = isColliding(watchedEl, controlsEl, 0, controlsHeight) ||
          isColliding(watchedEl, controlsEl, 0, -controlsHeight);
        watchedElCollisions.set(controlsEl, hasCollided || willCollide ? controlsHeight : 0);
      });
    });
    // Update after assessing all collisions so there are no glitchy movements.
    watch$1.forEach(watchedEl => {
      const watchedElCollisions = collisions.get(watchedEl);
      watchedEl.style.setProperty('--vm-controls-height', `${Math.max(0, Math.max(...watchedElCollisions.values()))}px`);
    });
  });
}
function registerControlsForCollisionDetection(component) {
  const el = getElement(component);
  function getInnerEl() {
    return el.shadowRoot.querySelector('.controls');
  }
  createStencilHook(component, () => {
    const innerEl = getInnerEl();
    if (!isNull(innerEl)) {
      controls.add(innerEl);
      update();
    }
  }, () => {
    controls.delete(getInnerEl());
    update();
  });
  wrapStencilHook(component, 'componentDidLoad', () => {
    controls.add(getInnerEl());
    update();
  });
  wrapStencilHook(component, 'componentDidRender', update);
}
function withControlsCollisionDetection(component) {
  const el = getElement(component);
  createStencilHook(component, () => {
    watch$1.add(el);
    collisions.set(el, new Map());
    update();
  }, () => {
    watch$1.delete(el);
    collisions.delete(el);
  });
}

const captionsCss = ":host{position:absolute;left:0;bottom:0;width:100%;pointer-events:none;z-index:var(--vm-captions-z-index)}.captions{width:100%;text-align:center;color:var(--vm-captions-text-color);font-size:var(--vm-captions-font-size);padding:$control-spacing;display:none;pointer-events:none;transition:transform 0.4s ease-in-out, opacity 0.3s ease-in-out}.captions.enabled{display:inline-block}.captions.hidden{display:none !important}.captions.inactive{opacity:0;visibility:hidden}.captions.fontMd{font-size:var(--vm-captions-font-size-medium)}.captions.fontLg{font-size:var(--vm-captions-font-size-large)}.captions.fontXl{font-size:var(--vm-captions-font-size-xlarge)}.cue{display:inline-block;background:var(--vm-captions-cue-bg-color);border-radius:var(--vm-captions-cue-border-radius);box-decoration-break:clone;line-height:185%;padding:var(--vm-captions-cue-padding);white-space:pre-wrap;pointer-events:none}.cue>div{display:inline}.cue:empty{display:none}";

var __awaiter$t = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const Captions = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.sizeDisposal = new Disposal();
    this.textDisposal = new Disposal();
    this.isEnabled = false;
    this.fontSize = 'sm';
    /**
     * Whether the captions should be visible or not.
     */
    this.hidden = false;
    /** @internal */
    this.isControlsActive = false;
    /** @internal */
    this.isVideoView = false;
    /** @internal */
    this.playbackStarted = false;
    /** @internal */
    this.textTracks = [];
    /** @internal */
    this.currentTextTrack = -1;
    /** @internal */
    this.isTextTrackVisible = true;
    withComponentRegistry(this);
    withControlsCollisionDetection(this);
    withPlayerContext(this, [
      'isVideoView',
      'playbackStarted',
      'isControlsActive',
      'textTracks',
      'currentTextTrack',
      'isTextTrackVisible',
    ]);
  }
  onEnabledChange() {
    this.isEnabled = this.playbackStarted && this.isVideoView;
  }
  onTextTracksChange() {
    const textTrack = this.textTracks[this.currentTextTrack];
    const renderCues = () => {
      var _a;
      const activeCues = Array.from((_a = textTrack.activeCues) !== null && _a !== void 0 ? _a : []);
      this.renderCurrentCue(activeCues[0]);
    };
    this.textDisposal.empty();
    if (!isNil(textTrack)) {
      renderCues();
      this.textDisposal.add(listen(textTrack, 'cuechange', renderCues));
    }
  }
  connectedCallback() {
    this.dispatch = createDispatcher(this);
    this.dispatch('shouldRenderNativeTextTracks', false);
    this.onTextTracksChange();
    this.onPlayerResize();
  }
  disconnectedCallback() {
    this.textDisposal.empty();
    this.sizeDisposal.empty();
    this.dispatch('shouldRenderNativeTextTracks', true);
  }
  onPlayerResize() {
    return __awaiter$t(this, void 0, void 0, function* () {
      const player = yield findPlayer(this);
      if (isUndefined(player))
        return;
      const container = (yield player.getContainer());
      const resizeObs = new ResizeObserver(entries => {
        const entry = entries[0];
        const { width } = entry.contentRect;
        if (width >= 1360) {
          this.fontSize = 'xl';
        }
        else if (width >= 1024) {
          this.fontSize = 'lg';
        }
        else if (width >= 768) {
          this.fontSize = 'md';
        }
        else {
          this.fontSize = 'sm';
        }
      });
      resizeObs.observe(container);
    });
  }
  renderCurrentCue(cue) {
    if (isNil(cue)) {
      this.cue = '';
      return;
    }
    const div = document.createElement('div');
    div.append(cue.getCueAsHTML());
    this.cue = div.innerHTML.trim();
  }
  render() {
    return (h("div", { style: {
        transform: `translateY(calc(${this.isControlsActive ? 'var(--vm-controls-height)' : '24px'} * -1))`,
      }, class: {
        captions: true,
        enabled: this.isEnabled,
        hidden: this.hidden,
        fontMd: this.fontSize === 'md',
        fontLg: this.fontSize === 'lg',
        fontXl: this.fontSize === 'xl',
        inactive: !this.isTextTrackVisible,
      } }, h("span", { class: "cue" }, this.cue)));
  }
  static get watchers() { return {
    "isVideoView": ["onEnabledChange"],
    "playbackStarted": ["onEnabledChange"],
    "textTracks": ["onTextTracksChange"],
    "currentTextTrack": ["onTextTracksChange"]
  }; }
  static get style() { return captionsCss; }
};

const clickToPlayCss = ":host{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:var(--vm-click-to-play-z-index)}.clickToPlay{display:none;width:100%;height:100%;pointer-events:none}.clickToPlay.enabled{display:inline-block;pointer-events:auto}";

var __awaiter$s = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const ClickToPlay = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    /**
     * By default this is disabled on mobile to not interfere with playback, set this to `true` to
     * enable it.
     */
    this.useOnMobile = false;
    /** @internal */
    this.paused = true;
    /** @internal */
    this.isVideoView = false;
    /** @internal */
    this.isMobile = false;
    withComponentRegistry(this);
    withPlayerContext(this, ['paused', 'isVideoView', 'isMobile']);
  }
  connectedCallback() {
    this.dispatch = createDispatcher(this);
  }
  /** @internal */
  forceClick() {
    return __awaiter$s(this, void 0, void 0, function* () {
      this.onClick();
    });
  }
  onClick() {
    this.dispatch('paused', !this.paused);
  }
  render() {
    return (h("div", { class: {
        clickToPlay: true,
        enabled: this.isVideoView && (!this.isMobile || this.useOnMobile),
      }, onClick: this.onClick.bind(this) }));
  }
  static get style() { return clickToPlayCss; }
};

const controlCss = "button{display:flex;align-items:center;flex-direction:row;border:var(--vm-control-border);cursor:pointer;flex-shrink:0;font-size:var(--vm-control-icon-size);color:var(--vm-control-color);background:var(--vm-control-bg, transparent);border-radius:var(--vm-control-border-radius);padding:var(--vm-control-padding);position:relative;pointer-events:auto;transition:all 0.3s ease;transform:scale(var(--vm-control-scale, 1));touch-action:manipulation;box-sizing:border-box}button.hidden{display:none}button:focus{outline:0}button.tapHighlight{background:var(--vm-control-tap-highlight)}button.notTouch:focus,button.notTouch:hover,button.notTouch[aria-expanded='true']{background:var(--vm-control-focus-bg);color:var(--vm-control-focus-color);transform:scale(calc(var(--vm-control-scale, 1) + 0.06))}";

var __awaiter$r = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const Control = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.vmInteractionChange = createEvent(this, "vmInteractionChange", 7);
    this.vmFocus = createEvent(this, "vmFocus", 7);
    this.vmBlur = createEvent(this, "vmBlur", 7);
    this.keyboardDisposal = new Disposal();
    this.showTapHighlight = false;
    /**
     * Whether the control should be displayed or not.
     */
    this.hidden = false;
    /** @internal */
    this.isTouch = false;
    withComponentRegistry(this);
    withPlayerContext(this, ['isTouch']);
  }
  onKeysChange() {
    return __awaiter$r(this, void 0, void 0, function* () {
      this.keyboardDisposal.empty();
      if (isUndefined(this.keys))
        return;
      const player = yield findPlayer(this);
      const codes = this.keys.split('/');
      if (isUndefined(player))
        return;
      this.keyboardDisposal.add(listen(player, 'keydown', (event) => {
        if (codes.includes(event.key)) {
          this.button.click();
        }
      }));
    });
  }
  connectedCallback() {
    this.findTooltip();
    this.onKeysChange();
  }
  componentWillLoad() {
    this.findTooltip();
  }
  disconnectedCallback() {
    this.keyboardDisposal.empty();
  }
  /**
   * Focuses the control.
   */
  focusControl() {
    var _a;
    return __awaiter$r(this, void 0, void 0, function* () {
      (_a = this.button) === null || _a === void 0 ? void 0 : _a.focus();
    });
  }
  /**
   * Removes focus from the control.
   */
  blurControl() {
    var _a;
    return __awaiter$r(this, void 0, void 0, function* () {
      (_a = this.button) === null || _a === void 0 ? void 0 : _a.blur();
    });
  }
  onTouchStart() {
    this.showTapHighlight = true;
  }
  onTouchEnd() {
    setTimeout(() => {
      this.showTapHighlight = false;
    }, 100);
  }
  findTooltip() {
    const tooltip = this.host.querySelector('vm-tooltip');
    if (!isNull(tooltip))
      this.describedBy = tooltip.id;
    return tooltip;
  }
  onShowTooltip() {
    const tooltip = this.findTooltip();
    if (!isNull(tooltip))
      tooltip.active = true;
    this.vmInteractionChange.emit(true);
  }
  onHideTooltip() {
    const tooltip = this.findTooltip();
    if (!isNull(tooltip))
      tooltip.active = false;
    this.button.blur();
    this.vmInteractionChange.emit(false);
  }
  onFocus() {
    this.vmFocus.emit();
    this.onShowTooltip();
  }
  onBlur() {
    this.vmBlur.emit();
    this.onHideTooltip();
  }
  onMouseEnter() {
    this.onShowTooltip();
  }
  onMouseLeave() {
    this.onHideTooltip();
  }
  render() {
    const isMenuExpanded = this.expanded ? 'true' : 'false';
    const isPressed = this.pressed ? 'true' : 'false';
    return (h("button", { class: {
        hidden: this.hidden,
        notTouch: !this.isTouch,
        tapHighlight: this.showTapHighlight,
      }, id: this.identifier, type: "button", "aria-label": this.label, "aria-haspopup": !isUndefined(this.menu) ? 'true' : undefined, "aria-controls": this.menu, "aria-expanded": !isUndefined(this.menu) ? isMenuExpanded : undefined, "aria-pressed": !isUndefined(this.pressed) ? isPressed : undefined, "aria-hidden": this.hidden ? 'true' : 'false', "aria-describedby": this.describedBy, onTouchStart: this.onTouchStart.bind(this), onTouchEnd: this.onTouchEnd.bind(this), onFocus: this.onFocus.bind(this), onBlur: this.onBlur.bind(this), onMouseEnter: this.onMouseEnter.bind(this), onMouseLeave: this.onMouseLeave.bind(this), ref: (el) => {
        this.button = el;
      } }, h("slot", null)));
  }
  get host() { return this; }
  static get watchers() { return {
    "keys": ["onKeysChange"]
  }; }
  static get style() { return controlCss; }
};

const controlGroupCss = ":host{width:100%}.controlGroup{position:relative;width:100%;display:flex;flex-wrap:wrap;flex-direction:inherit;align-items:inherit;justify-content:inherit;box-sizing:border-box}.controlGroup.spaceTop{margin-top:var(--vm-control-group-spacing)}.controlGroup.spaceBottom{margin-bottom:var(--vm-control-group-spacing)}::slotted(*){margin-left:var(--vm-controls-spacing)}::slotted(*:first-child){margin-left:0}";

const ControlNewLine = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
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
  get host() { return this; }
  static get style() { return controlGroupCss; }
};

const controlSpacerCss = ":host{flex:1}";

const ControlSpacer = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    withComponentRegistry(this);
  }
  static get style() { return controlSpacerCss; }
};

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

var __awaiter$q = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const Controls = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
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
    return __awaiter$q(this, void 0, void 0, function* () {
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
  static get style() { return controlsCss; }
};

const currentTimeCss = ":host{display:flex;align-items:center;justify-content:center}";

const CurrentTime = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
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
  static get style() { return currentTimeCss; }
};

var _a, _b;
const IS_CLIENT = typeof window !== 'undefined';
const UA = IS_CLIENT ? (_a = window.navigator) === null || _a === void 0 ? void 0 : _a.userAgent.toLowerCase() : '';
const IS_IOS = /iphone|ipad|ipod|ios|CriOS|FxiOS/.test(UA);
const IS_ANDROID = /android/.test(UA);
const IS_MOBILE = IS_CLIENT && (IS_IOS || IS_ANDROID);
const IS_IPHONE = IS_CLIENT && /(iPhone|iPod)/gi.test((_b = window.navigator) === null || _b === void 0 ? void 0 : _b.platform);
/firefox/.test(UA);
const IS_CHROME = IS_CLIENT && window.chrome;
IS_CLIENT &&
  !IS_CHROME &&
  (window.safari || IS_IOS || /(apple|safari)/.test(UA));
const onMobileChange = (callback) => {
  if (!IS_CLIENT || isUndefined(window.ResizeObserver)) {
    callback(IS_MOBILE);
    return noop;
  }
  function onResize() {
    callback(window.innerWidth <= 480 || IS_MOBILE);
  }
  callback(window.innerWidth <= 480 || IS_MOBILE);
  return listen(window, 'resize', onResize);
};
const onTouchInputChange = (callback) => {
  if (!IS_CLIENT)
    return noop;
  let lastTouchTime = 0;
  const offTouchListener = listen(document, 'touchstart', () => {
    lastTouchTime = new Date().getTime();
    callback(true);
  }, true);
  const offMouseListener = listen(document, 'mousemove', () => {
    // Filter emulated events coming from touch events
    if (new Date().getTime() - lastTouchTime < 500)
      return;
    callback(false);
  }, true);
  return () => {
    offTouchListener();
    offMouseListener();
  };
};
/**
 * Checks if the screen orientation can be changed.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation
 */
const canRotateScreen = () => IS_CLIENT && window.screen.orientation && !!window.screen.orientation.lock;
/**
 * Checks if the native HTML5 video player can enter picture-in-picture (PIP) mode when using
 * the Chrome browser.
 *
 * @see  https://developers.google.com/web/updates/2018/10/watch-video-using-picture-in-picture
 */
const canUsePiPInChrome = () => {
  if (!IS_CLIENT)
    return false;
  const video = document.createElement('video');
  return !!document.pictureInPictureEnabled && !video.disablePictureInPicture;
};
/**
 * Checks if the native HTML5 video player can enter picture-in-picture (PIP) mode when using
 * the desktop Safari browser, iOS Safari appears to "support" PiP through the check, however PiP
 * does not function.
 *
 * @see https://developer.apple.com/documentation/webkitjs/adding_picture_in_picture_to_your_safari_media_controls
 */
const canUsePiPInSafari = () => {
  if (!IS_CLIENT)
    return false;
  const video = document.createElement('video');
  return (isFunction(video.webkitSupportsPresentationMode) &&
    isFunction(video.webkitSetPresentationMode) &&
    !IS_IPHONE);
};
// Checks if the native HTML5 video player can enter PIP.
const canUsePiP = () => canUsePiPInChrome() || canUsePiPInSafari();
/**
 * To detect autoplay, we create a video element and call play on it, if it is `paused` after
 * a `play()` call, autoplay is supported. Although this unintuitive, it works across browsers
 * and is currently the lightest way to detect autoplay without using a data source.
 *
 * @see https://github.com/ampproject/amphtml/blob/9bc8756536956780e249d895f3e1001acdee0bc0/src/utils/video.js#L25
 */
const canAutoplay = (muted = true, playsinline = true) => {
  if (!IS_CLIENT)
    return Promise.resolve(false);
  const video = document.createElement('video');
  if (muted) {
    video.setAttribute('muted', '');
    video.muted = true;
  }
  if (playsinline) {
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
  }
  video.setAttribute('height', '0');
  video.setAttribute('width', '0');
  video.style.position = 'fixed';
  video.style.top = '0';
  video.style.width = '0';
  video.style.height = '0';
  video.style.opacity = '0';
  // Promise wrapped this way to catch both sync throws and async rejections.
  // More info: https://github.com/tc39/proposal-promise-try
  new Promise(resolve => resolve(video.play())).catch(noop);
  return Promise.resolve(!video.paused);
};

/**
 * Attempt to parse json into a POJO.
 */
function tryParseJSON(json) {
  if (!isString(json))
    return undefined;
  try {
    return JSON.parse(json);
  }
  catch (e) {
    return undefined;
  }
}
/**
 * Check if the given input is json or a plain object.
 */
const isObjOrJSON = (input) => !isNil(input) &&
  (isObject(input) || (isString(input) && input.startsWith('{')));
/**
 * If an object return otherwise try to parse it as json.
 */
const objOrParseJSON = (input) => isObject(input) ? input : tryParseJSON(input);
/**
 * Load image avoiding xhr/fetch CORS issues. Server status can't be obtained this way
 * unfortunately, so this uses "naturalWidth" to determine if the image has been loaded. By
 * default it checks if it is at least 1px.
 */
const loadImage = (src, minWidth = 1) => new Promise((resolve, reject) => {
  const image = new Image();
  const handler = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete image.onload;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete image.onerror;
    image.naturalWidth >= minWidth ? resolve(image) : reject(image);
  };
  Object.assign(image, { onload: handler, onerror: handler, src });
});
const loadScript = (src, onLoad, onError = noop) => {
  var _a;
  const script = document.createElement('script');
  script.src = src;
  script.onload = onLoad;
  script.onerror = onError;
  const firstScriptTag = document.getElementsByTagName('script')[0];
  (_a = firstScriptTag.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(script, firstScriptTag);
};
/**
 * Tries to parse json and return a object.
 */
const decodeJSON = (data) => {
  if (!isObjOrJSON(data))
    return undefined;
  return objOrParseJSON(data);
};
/**
 * Attempts to safely decode a URI component, on failure it returns the given fallback.
 */
const tryDecodeURIComponent = (component, fallback = '') => {
  if (!IS_CLIENT)
    return fallback;
  try {
    return window.decodeURIComponent(component);
  }
  catch (e) {
    return fallback;
  }
};
/**
 * Returns a simple key/value map and duplicate keys are merged into an array.
 *
 * @see https://github.com/ampproject/amphtml/blob/c7c46cec71bac92f5c5da31dcc6366c18577f566/src/url-parse-query-string.js#L31
 */
const QUERY_STRING_REGEX = /(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g;
const parseQueryString = (qs) => {
  const params = Object.create(null);
  if (isUndefined(qs))
    return params;
  let match;
  // eslint-disable-next-line no-cond-assign
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  while ((match = QUERY_STRING_REGEX.exec(qs))) {
    const name = tryDecodeURIComponent(match[1], match[1]).replace('[]', '');
    const value = isString(match[2])
      ? tryDecodeURIComponent(match[2].replace(/\+/g, ' '), match[2])
      : '';
    const currValue = params[name];
    if (currValue && !isArray(currValue))
      params[name] = [currValue];
    currValue ? params[name].push(value) : (params[name] = value);
  }
  return params;
};
/**
 * Serializes the given params into a query string.
 */
const serializeQueryString = (params) => {
  const qs = [];
  const appendQueryParam = (param, v) => {
    qs.push(`${encodeURIComponent(param)}=${encodeURIComponent(v)}`);
  };
  Object.keys(params).forEach(param => {
    const value = params[param];
    if (isNil(value))
      return;
    if (isArray(value)) {
      value.forEach((v) => appendQueryParam(param, v));
    }
    else {
      appendQueryParam(param, value);
    }
  });
  return qs.join('&');
};
/**
 * Notifies the browser to start establishing a connection with the given URL.
 */
const preconnect = (url, rel = 'preconnect', as) => {
  if (!IS_CLIENT)
    return false;
  const link = document.createElement('link');
  link.rel = rel;
  link.href = url;
  if (!isUndefined(as))
    link.as = as;
  link.crossOrigin = 'true';
  document.head.append(link);
  return true;
};
/**
 * Safely appends the given query string to the given URL.
 */
const appendQueryStringToURL = (url, qs) => {
  if (isUndefined(qs) || qs.length === 0)
    return url;
  const mainAndQuery = url.split('?', 2);
  return (mainAndQuery[0] +
    (!isUndefined(mainAndQuery[1]) ? `?${mainAndQuery[1]}&${qs}` : `?${qs}`));
};
/**
 * Serializes the given params into a query string and appends them to the given URL.
 */
const appendParamsToURL = (url, params) => appendQueryStringToURL(url, isObject(params)
  ? serializeQueryString(params)
  : params);
/**
 * Tries to convert a query string into a object.
 */
const decodeQueryString = (qs) => {
  if (!isString(qs))
    return undefined;
  return parseQueryString(qs);
};
const pendingSDKRequests = {};
/**
 * Loads an SDK into the global window namespace.
 *
 * @see https://github.com/CookPete/react-player/blob/master/src/utils.js#L77
 */
const loadSDK = (url, sdkGlobalVar, sdkReadyVar, isLoaded = () => true, loadScriptFn = loadScript) => {
  const getGlobal = (key) => {
    if (!isUndefined(window[key]))
      return window[key];
    if (window.exports && window.exports[key])
      return window.exports[key];
    if (window.module && window.module.exports && window.module.exports[key]) {
      return window.module.exports[key];
    }
    return undefined;
  };
  const existingGlobal = getGlobal(sdkGlobalVar);
  if (existingGlobal && isLoaded(existingGlobal)) {
    return Promise.resolve(existingGlobal);
  }
  return new Promise((resolve, reject) => {
    if (!isUndefined(pendingSDKRequests[url])) {
      pendingSDKRequests[url].push({ resolve, reject });
      return;
    }
    pendingSDKRequests[url] = [{ resolve, reject }];
    const onLoaded = (sdk) => {
      pendingSDKRequests[url].forEach(request => request.resolve(sdk));
    };
    if (!isUndefined(sdkReadyVar)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const previousOnReady = window[sdkReadyVar];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window[sdkReadyVar] = function () {
        if (!isUndefined(previousOnReady))
          previousOnReady();
        onLoaded(getGlobal(sdkGlobalVar));
      };
    }
    loadScriptFn(url, () => {
      if (isUndefined(sdkReadyVar))
        onLoaded(getGlobal(sdkGlobalVar));
    }, e => {
      pendingSDKRequests[url].forEach(request => {
        request.reject(e);
      });
      delete pendingSDKRequests[url];
    });
  });
};

const withProviderContext = (provider, additionalProps = []) => withPlayerContext(provider, [
  'autoplay',
  'controls',
  'language',
  'muted',
  'logger',
  'loop',
  'aspectRatio',
  'playsinline',
  ...additionalProps,
]);

const dailymotionCss = ":host{z-index:var(--vm-media-z-index)}";

var __awaiter$p = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const videoInfoCache$1 = new Map();
const Dailymotion = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.vmLoadStart = createEvent(this, "vmLoadStart", 7);
    this.vmError = createEvent(this, "vmError", 7);
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
    return __awaiter$p(this, void 0, void 0, function* () {
      if (videoInfoCache$1.has(this.videoId))
        return videoInfoCache$1.get(this.videoId);
      const apiEndpoint = 'https://api.dailymotion.com';
      return window
        .fetch(`${apiEndpoint}/video/${this.videoId}?fields=duration,thumbnail_1080_url`)
        .then(response => response.json())
        .then(data => {
        const poster = data.thumbnail_1080_url;
        const duration = parseFloat(data.duration);
        videoInfoCache$1.set(this.videoId, { poster, duration });
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
    return __awaiter$p(this, void 0, void 0, function* () {
      const canPlayRegex = /(?:dai\.ly|dailymotion|dailymotion\.com)\/(?:video\/|embed\/|)(?:video\/|)((?:\w)+)/;
      return {
        getInternalPlayer: () => __awaiter$p(this, void 0, void 0, function* () { return this.embed; }),
        play: () => __awaiter$p(this, void 0, void 0, function* () {
          this.remoteControl("play" /* Play */);
        }),
        pause: () => __awaiter$p(this, void 0, void 0, function* () {
          this.remoteControl("pause" /* Pause */);
        }),
        canPlay: (type) => __awaiter$p(this, void 0, void 0, function* () { return isString(type) && canPlayRegex.test(type); }),
        setCurrentTime: (time) => __awaiter$p(this, void 0, void 0, function* () {
          if (time !== this.internalState.currentTime) {
            this.internalState.currentTime = time;
            this.remoteControl("seek" /* Seek */, time);
          }
        }),
        setMuted: (muted) => __awaiter$p(this, void 0, void 0, function* () {
          this.internalState.muted = muted;
          this.remoteControl("muted" /* Muted */, muted);
        }),
        setVolume: (volume) => __awaiter$p(this, void 0, void 0, function* () {
          this.internalState.volume = volume / 100;
          this.dispatch('volume', volume);
          this.remoteControl("volume" /* Volume */, volume / 100);
        }),
        canSetPlaybackQuality: () => __awaiter$p(this, void 0, void 0, function* () { return true; }),
        setPlaybackQuality: (quality) => __awaiter$p(this, void 0, void 0, function* () {
          this.remoteControl("quality" /* Quality */, quality.slice(0, -1));
        }),
        canSetFullscreen: () => __awaiter$p(this, void 0, void 0, function* () { return true; }),
        enterFullscreen: () => __awaiter$p(this, void 0, void 0, function* () {
          this.remoteControl("fullscreen" /* Fullscreen */, true);
        }),
        exitFullscreen: () => __awaiter$p(this, void 0, void 0, function* () {
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
  static get watchers() { return {
    "videoId": ["onVideoIdChange"],
    "controls": ["onControlsChange"],
    "poster": ["onCustomPosterChange"]
  }; }
  static get style() { return dailymotionCss; }
};

const dashCss = ":host{z-index:var(--vm-media-z-index)}";

var __awaiter$o = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const Dash = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.vmLoadStart = createEvent(this, "vmLoadStart", 7);
    this.vmError = createEvent(this, "vmError", 7);
    this.textTracksDisposal = new Disposal();
    this.hasAttached = false;
    /**
     * The NPM package version of the `dashjs` library to download and use.
     */
    this.version = 'latest';
    /**
     * The `dashjs` configuration.
     */
    this.config = {};
    /** @internal */
    this.autoplay = false;
    /** @inheritdoc */
    this.preload = 'metadata';
    /**
     * Are text tracks enabled by default.
     */
    this.enableTextTracksByDefault = true;
    /** @internal */
    this.shouldRenderNativeTextTracks = true;
    /** @internal */
    this.isTextTrackVisible = true;
    /** @internal */
    this.currentTextTrack = -1;
    withComponentRegistry(this);
    withProviderConnect(this);
    withPlayerContext(this, [
      'autoplay',
      'shouldRenderNativeTextTracks',
      'isTextTrackVisible',
      'currentTextTrack',
    ]);
  }
  onSrcChange() {
    var _a;
    if (!this.hasAttached)
      return;
    this.vmLoadStart.emit();
    (_a = this.dash) === null || _a === void 0 ? void 0 : _a.attachSource(this.src);
  }
  onShouldRenderNativeTextTracks() {
    var _a;
    if (this.shouldRenderNativeTextTracks) {
      this.textTracksDisposal.empty();
    }
    else {
      this.hideCurrentTextTrack();
    }
    (_a = this.dash) === null || _a === void 0 ? void 0 : _a.enableForcedTextStreaming(!this.shouldRenderNativeTextTracks);
  }
  onTextTrackChange() {
    var _a, _b;
    if (!this.shouldRenderNativeTextTracks || isUndefined(this.dash))
      return;
    this.dash.setTextTrack(!this.isTextTrackVisible ? -1 : this.currentTextTrack);
    if (!this.isTextTrackVisible) {
      const track = Array.from((_b = (_a = this.mediaEl) === null || _a === void 0 ? void 0 : _a.textTracks) !== null && _b !== void 0 ? _b : [])[this.currentTextTrack];
      if ((track === null || track === void 0 ? void 0 : track.mode) === 'hidden')
        this.dispatch('currentTextTrack', -1);
    }
  }
  connectedCallback() {
    this.dispatch = createProviderDispatcher(this);
    if (this.mediaEl)
      this.setupDash();
  }
  disconnectedCallback() {
    this.textTracksDisposal.empty();
    this.destroyDash();
  }
  setupDash() {
    return __awaiter$o(this, void 0, void 0, function* () {
      try {
        const url = this.libSrc ||
          `https://cdn.jsdelivr.net/npm/dashjs@${this.version}/dist/dash.all.min.js`;
        const DashSDK = (yield loadSDK(url, 'dashjs'));
        this.dash = DashSDK.MediaPlayer(this.config).create();
        this.dash.initialize(this.mediaEl, null, this.autoplay);
        this.dash.setTextDefaultEnabled(this.enableTextTracksByDefault);
        this.dash.enableForcedTextStreaming(!this.shouldRenderNativeTextTracks);
        this.dash.on(DashSDK.MediaPlayer.events.PLAYBACK_METADATA_LOADED, () => {
          this.dispatch('mediaType', MediaType.Video);
          this.dispatch('currentSrc', this.src);
          this.dispatchLevels();
          this.listenToTextTracksForChanges();
          this.dispatch('playbackReady', true);
        });
        this.dash.on(DashSDK.MediaPlayer.events.TRACK_CHANGE_RENDERED, () => {
          if (!this.shouldRenderNativeTextTracks)
            this.hideCurrentTextTrack();
        });
        this.dash.on(DashSDK.MediaPlayer.events.ERROR, (e) => {
          this.vmError.emit(e);
        });
        this.hasAttached = true;
      }
      catch (e) {
        this.vmError.emit(e);
      }
    });
  }
  destroyDash() {
    var _a;
    return __awaiter$o(this, void 0, void 0, function* () {
      (_a = this.dash) === null || _a === void 0 ? void 0 : _a.reset();
      this.hasAttached = false;
    });
  }
  onMediaElChange(event) {
    return __awaiter$o(this, void 0, void 0, function* () {
      this.destroyDash();
      if (isUndefined(event.detail))
        return;
      this.mediaEl = event.detail;
      yield this.setupDash();
    });
  }
  levelToPlaybackQuality(level) {
    return level === -1 ? 'Auto' : `${level.height}p`;
  }
  findLevelIndexFromQuality(quality) {
    return this.dash
      .getBitrateInfoListFor('video')
      .findIndex((level) => this.levelToPlaybackQuality(level) === quality);
  }
  dispatchLevels() {
    try {
      const levels = this.dash.getBitrateInfoListFor('video');
      if ((levels === null || levels === void 0 ? void 0 : levels.length) > 0) {
        this.dispatch('playbackQualities', [
          'Auto',
          ...levels.map(this.levelToPlaybackQuality),
        ]);
        this.dispatch('playbackQuality', 'Auto');
      }
    }
    catch (e) {
      this.vmError.emit(e);
    }
  }
  listenToTextTracksForChanges() {
    var _a, _b, _c;
    this.textTracksDisposal.empty();
    if (isUndefined(this.mediaEl) || this.shouldRenderNativeTextTracks)
      return;
    // Init current track.
    const currentTrack = (_c = ((_b = (_a = this.dash) === null || _a === void 0 ? void 0 : _a.getCurrentTrackFor('text')) === null || _b === void 0 ? void 0 : _b.index) - 1) !== null && _c !== void 0 ? _c : -1;
    this.currentTextTrack = currentTrack;
    this.dispatch('currentTextTrack', currentTrack);
    this.textTracksDisposal.add(listen(this.mediaEl.textTracks, 'change', this.onTextTracksChange.bind(this)));
  }
  getTextTracks() {
    var _a, _b;
    return Array.from((_b = (_a = this.mediaEl) === null || _a === void 0 ? void 0 : _a.textTracks) !== null && _b !== void 0 ? _b : []);
  }
  hideCurrentTextTrack() {
    const textTracks = this.getTextTracks();
    if (textTracks[this.currentTextTrack] && this.isTextTrackVisible) {
      textTracks[this.currentTextTrack].mode = 'hidden';
    }
  }
  onTextTracksChange() {
    this.hideCurrentTextTrack();
    this.dispatch('textTracks', this.getTextTracks());
    this.dispatch('isTextTrackVisible', this.isTextTrackVisible);
    this.dispatch('currentTextTrack', this.currentTextTrack);
  }
  /** @internal */
  getAdapter() {
    var _a, _b;
    return __awaiter$o(this, void 0, void 0, function* () {
      const adapter = (_b = (yield ((_a = this.videoProvider) === null || _a === void 0 ? void 0 : _a.getAdapter()))) !== null && _b !== void 0 ? _b : {};
      const canVideoProviderPlay = adapter.canPlay;
      return Object.assign(Object.assign({}, adapter), { getInternalPlayer: () => __awaiter$o(this, void 0, void 0, function* () { return this.dash; }), canPlay: (type) => __awaiter$o(this, void 0, void 0, function* () {
          var _c;
          return (isString(type) && dashRegex.test(type)) ||
            ((_c = canVideoProviderPlay === null || canVideoProviderPlay === void 0 ? void 0 : canVideoProviderPlay(type)) !== null && _c !== void 0 ? _c : false);
        }), canSetPlaybackQuality: () => __awaiter$o(this, void 0, void 0, function* () {
          var _d, _e;
          try {
            return ((_e = (_d = this.dash) === null || _d === void 0 ? void 0 : _d.getBitrateInfoListFor('video')) === null || _e === void 0 ? void 0 : _e.length) > 0;
          }
          catch (e) {
            this.vmError.emit(e);
            return false;
          }
        }), setPlaybackQuality: (quality) => __awaiter$o(this, void 0, void 0, function* () {
          if (!isUndefined(this.dash)) {
            const index = this.findLevelIndexFromQuality(quality);
            this.dash.updateSettings({
              streaming: {
                abr: {
                  autoSwitchBitrate: {
                    video: index === -1,
                  },
                },
              },
            });
            if (index >= 0)
              this.dash.setQualityFor('video', index);
            // Update the provider cache.
            this.dispatch('playbackQuality', quality);
          }
        }), setCurrentTextTrack: (trackId) => __awaiter$o(this, void 0, void 0, function* () {
          var _f;
          if (this.shouldRenderNativeTextTracks) {
            adapter.setCurrentTextTrack(trackId);
          }
          else {
            this.currentTextTrack = trackId;
            (_f = this.dash) === null || _f === void 0 ? void 0 : _f.setTextTrack(trackId);
            this.onTextTracksChange();
          }
        }), setTextTrackVisibility: (isVisible) => __awaiter$o(this, void 0, void 0, function* () {
          var _g;
          if (this.shouldRenderNativeTextTracks) {
            adapter.setTextTrackVisibility(isVisible);
          }
          else {
            this.isTextTrackVisible = isVisible;
            (_g = this.dash) === null || _g === void 0 ? void 0 : _g.enableText(isVisible);
            this.onTextTracksChange();
          }
        }) });
    });
  }
  render() {
    return (h("vm-video", { willAttach: true, crossOrigin: this.crossOrigin, preload: this.preload, poster: this.poster, controlsList: this.controlsList, autoPiP: this.autoPiP, disablePiP: this.disablePiP, hasCustomTextManager: !this.shouldRenderNativeTextTracks, disableRemotePlayback: this.disableRemotePlayback, mediaTitle: this.mediaTitle, ref: (el) => {
        this.videoProvider = el;
      } }));
  }
  static get watchers() { return {
    "src": ["onSrcChange"],
    "hasAttached": ["onSrcChange"],
    "shouldRenderNativeTextTracks": ["onShouldRenderNativeTextTracks"],
    "isTextTrackVisible": ["onTextTrackChange"],
    "currentTextTrack": ["onTextTrackChange"]
  }; }
  static get style() { return dashCss; }
};

const dblClickFullscreenCss = ":host{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:var(--vm-dbl-click-fullscreen-z-index)}.dblClickFullscreen{display:none;width:100%;height:100%;pointer-events:none}.dblClickFullscreen.enabled{display:inline-block;pointer-events:auto}";

var __awaiter$n = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const DblClickFullscreen = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.canSetFullscreen = false;
    /**
     * By default this is disabled on mobile to not interfere with playback, set this to `true` to
     * enable it.
     */
    this.useOnMobile = false;
    /** @internal */
    this.isFullscreenActive = true;
    /** @internal */
    this.isVideoView = false;
    /** @internal */
    this.playbackReady = false;
    /** @internal */
    this.isMobile = false;
    this.clicks = 0;
    withComponentRegistry(this);
    withPlayerContext(this, [
      'playbackReady',
      'isFullscreenActive',
      'isVideoView',
      'isMobile',
    ]);
  }
  onPlaybackReadyChange() {
    return __awaiter$n(this, void 0, void 0, function* () {
      const player = yield findPlayer(this);
      if (isUndefined(player))
        return;
      this.canSetFullscreen = yield player.canSetFullscreen();
    });
  }
  onTriggerClickToPlay() {
    return __awaiter$n(this, void 0, void 0, function* () {
      const [clickToPlay] = getComponentFromRegistry(this, 'vm-click-to-play');
      yield (clickToPlay === null || clickToPlay === void 0 ? void 0 : clickToPlay.forceClick());
    });
  }
  onToggleFullscreen() {
    return __awaiter$n(this, void 0, void 0, function* () {
      const player = yield findPlayer(this);
      if (isUndefined(player))
        return;
      this.isFullscreenActive
        ? player.exitFullscreen()
        : player.enterFullscreen();
    });
  }
  onClick() {
    this.clicks += 1;
    if (this.clicks === 1) {
      setTimeout(() => {
        if (this.clicks === 1) {
          this.onTriggerClickToPlay();
        }
        else {
          this.onToggleFullscreen();
        }
        this.clicks = 0;
      }, 300);
    }
  }
  render() {
    return (h("div", { class: {
        dblClickFullscreen: true,
        enabled: this.playbackReady &&
          this.canSetFullscreen &&
          this.isVideoView &&
          (!this.isMobile || this.useOnMobile),
      }, onClick: this.onClick.bind(this) }));
  }
  static get watchers() { return {
    "playbackReady": ["onPlaybackReadyChange"]
  }; }
  static get style() { return dblClickFullscreenCss; }
};

const defaultControlsCss = ":host{display:contents;pointer-events:none;z-index:var(--vm-controls-z-index)}";

const DefaultControls = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
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
    this.isMobile = false;
    /** @internal */
    this.isLive = false;
    /** @internal */
    this.isAudioView = false;
    /** @internal */
    this.isVideoView = false;
    withComponentRegistry(this);
    withPlayerContext(this, [
      'theme',
      'isMobile',
      'isAudioView',
      'isVideoView',
      'isLive',
    ]);
  }
  buildAudioControls() {
    return (h("vm-controls", { fullWidth: true }, h("vm-playback-control", { tooltipDirection: "right" }), h("vm-volume-control", null), !this.isLive && h("vm-current-time", null), this.isLive && h("vm-control-spacer", null), !this.isLive && h("vm-scrubber-control", null), this.isLive && h("vm-live-indicator", null), !this.isLive && h("vm-end-time", null), !this.isLive && h("vm-settings-control", { tooltipDirection: "left" }), h("div", { style: { marginLeft: '0', paddingRight: '2px' } })));
  }
  buildMobileVideoControls() {
    return (h(Fragment, null, h("vm-scrim", { gradient: "up" }), h("vm-controls", { pin: "topLeft", fullWidth: true, activeDuration: this.activeDuration, waitForPlaybackStart: this.waitForPlaybackStart, hideWhenPaused: this.hideWhenPaused }, h("vm-control-spacer", null), h("vm-volume-control", null), !this.isLive && h("vm-caption-control", null), !this.isLive && h("vm-settings-control", null), this.isLive && h("vm-fullscreen-control", null)), h("vm-controls", { pin: "center", justify: "center", activeDuration: this.activeDuration, waitForPlaybackStart: this.waitForPlaybackStart, hideWhenPaused: this.hideWhenPaused }, h("vm-playback-control", { style: { '--vm-control-scale': '1.3' } })), !this.isLive && (h("vm-controls", { pin: "bottomLeft", fullWidth: true, activeDuration: this.activeDuration, waitForPlaybackStart: this.waitForPlaybackStart, hideWhenPaused: this.hideWhenPaused }, h("vm-control-group", null, h("vm-current-time", null), h("vm-control-spacer", null), h("vm-end-time", null), h("vm-fullscreen-control", null)), h("vm-control-group", { space: "top" }, h("vm-scrubber-control", null))))));
  }
  buildDesktopVideoControls() {
    return (h(Fragment, null, this.theme !== 'light' && h("vm-scrim", { gradient: "up" }), h("vm-controls", { fullWidth: true, pin: "bottomRight", activeDuration: this.activeDuration, waitForPlaybackStart: this.waitForPlaybackStart, hideWhenPaused: this.hideWhenPaused, hideOnMouseLeave: this.hideOnMouseLeave }, !this.isLive && (h("vm-control-group", null, h("vm-scrubber-control", null))), h("vm-control-group", { space: this.isLive ? 'none' : 'top' }, h("vm-playback-control", { tooltipDirection: "right" }), h("vm-volume-control", null), !this.isLive && h("vm-time-progress", null), h("vm-control-spacer", null), !this.isLive && h("vm-caption-control", null), this.isLive && h("vm-live-indicator", null), h("vm-pip-control", null), !this.isLive && h("vm-settings-control", null), h("vm-fullscreen-control", { tooltipDirection: "left" })))));
  }
  render() {
    if (this.isAudioView)
      return this.buildAudioControls();
    if (this.isVideoView && this.isMobile)
      return this.buildMobileVideoControls();
    if (this.isVideoView)
      return this.buildDesktopVideoControls();
    return null;
  }
  static get style() { return defaultControlsCss; }
};

const defaultSettingsCss = ":host{z-index:var(--vm-menu-z-index)}";

var __awaiter$m = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const DefaultSettings = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.textTracksDisposal = new Disposal();
    this.canSetPlaybackRate = false;
    this.canSetPlaybackQuality = false;
    this.canSetTextTrack = false;
    this.canSetAudioTrack = false;
    /**
     * Pins the settings to the defined position inside the video player. This has no effect when
     * the view is of type `audio`, it will always be `bottomRight`.
     */
    this.pin = 'bottomRight';
    /** @internal */
    this.i18n = {};
    /** @internal */
    this.playbackReady = false;
    /** @internal */
    this.playbackRate = 1;
    /** @internal */
    this.playbackRates = [1];
    /** @internal */
    this.isVideoView = false;
    /** @internal */
    this.playbackQualities = [];
    /** @internal */
    this.textTracks = [];
    /** @internal */
    this.currentTextTrack = -1;
    /** @internal */
    this.audioTracks = [];
    /** @internal */
    this.currentAudioTrack = -1;
    /** @internal */
    this.isTextTrackVisible = true;
    withComponentRegistry(this);
    withPlayerContext(this, [
      'i18n',
      'playbackReady',
      'playbackRate',
      'playbackRates',
      'playbackQuality',
      'playbackQualities',
      'isVideoView',
      'textTracks',
      'currentTextTrack',
      'isTextTrackVisible',
      'audioTracks',
      'currentAudioTrack',
    ]);
  }
  onPlaybackReady() {
    return __awaiter$m(this, void 0, void 0, function* () {
      const player = yield findPlayer(this);
      if (isUndefined(player))
        return;
      this.canSetPlaybackQuality = yield player.canSetPlaybackQuality();
      this.canSetPlaybackRate = yield player.canSetPlaybackRate();
    });
  }
  onAudioTracksChange() {
    var _a;
    return __awaiter$m(this, void 0, void 0, function* () {
      const player = getPlayerFromRegistry(this);
      this.canSetAudioTrack = (_a = (yield (player === null || player === void 0 ? void 0 : player.canSetAudioTrack()))) !== null && _a !== void 0 ? _a : false;
    });
  }
  onTextTracksChange() {
    var _a;
    return __awaiter$m(this, void 0, void 0, function* () {
      const player = getPlayerFromRegistry(this);
      this.canSetTextTrack = (_a = (yield (player === null || player === void 0 ? void 0 : player.canSetTextTrack()))) !== null && _a !== void 0 ? _a : false;
    });
  }
  connectedCallback() {
    this.dispatch = createDispatcher(this);
  }
  componentDidLoad() {
    this.onTextTracksChange();
  }
  disconnectedCallback() {
    this.textTracksDisposal.empty();
  }
  onPlaybackRateSelect(event) {
    const radio = event.target;
    this.dispatch('playbackRate', parseFloat(radio.value));
  }
  buildPlaybackRateSubmenu() {
    if (this.playbackRates.length <= 1 || !this.canSetPlaybackRate) {
      return (h("vm-menu-item", { label: this.i18n.playbackRate, hint: this.i18n.normal }));
    }
    const formatRate = (rate) => rate === 1 ? this.i18n.normal : `${rate}`;
    return (h("vm-submenu", { label: this.i18n.playbackRate, hint: formatRate(this.playbackRate) }, h("vm-menu-radio-group", { value: `${this.playbackRate}`, onVmCheck: this.onPlaybackRateSelect.bind(this) }, this.playbackRates.map(rate => (h("vm-menu-radio", { label: formatRate(rate), value: `${rate}` }))))));
  }
  onPlaybackQualitySelect(event) {
    const radio = event.target;
    this.dispatch('playbackQuality', radio.value);
  }
  buildPlaybackQualitySubmenu() {
    var _a;
    if (this.playbackQualities.length <= 1 || !this.canSetPlaybackQuality) {
      return (h("vm-menu-item", { label: this.i18n.playbackQuality, hint: (_a = this.playbackQuality) !== null && _a !== void 0 ? _a : this.i18n.auto }));
    }
    // @TODO this doesn't account for audio qualities yet.
    const getBadge = (quality) => {
      const verticalPixels = parseInt(quality.slice(0, -1), 10);
      if (verticalPixels >= 2160)
        return 'UHD';
      if (verticalPixels >= 1080)
        return 'HD';
      return undefined;
    };
    return (h("vm-submenu", { label: this.i18n.playbackQuality, hint: this.playbackQuality }, h("vm-menu-radio-group", { value: this.playbackQuality, onVmCheck: this.onPlaybackQualitySelect.bind(this) }, this.playbackQualities.map(quality => (h("vm-menu-radio", { label: quality, value: quality, badge: getBadge(quality) }))))));
  }
  onTextTrackSelect(event) {
    const radio = event.target;
    const trackId = parseInt(radio.value, 10);
    const player = getPlayerFromRegistry(this);
    if (trackId === -1) {
      player === null || player === void 0 ? void 0 : player.setTextTrackVisibility(false);
      return;
    }
    player === null || player === void 0 ? void 0 : player.setTextTrackVisibility(true);
    player === null || player === void 0 ? void 0 : player.setCurrentTextTrack(trackId);
  }
  buildTextTracksSubmenu() {
    var _a, _b, _c;
    if (this.textTracks.length <= 1 || !this.canSetTextTrack) {
      return (h("vm-menu-item", { label: this.i18n.subtitlesOrCc, hint: (_b = (_a = this.textTracks[this.currentTextTrack]) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : this.i18n.none }));
    }
    return (h("vm-submenu", { label: this.i18n.subtitlesOrCc, hint: this.isTextTrackVisible
        ? (_c = this.textTracks[this.currentTextTrack]) === null || _c === void 0 ? void 0 : _c.label
        : this.i18n.off }, h("vm-menu-radio-group", { value: `${!this.isTextTrackVisible ? -1 : this.currentTextTrack}`, onVmCheck: this.onTextTrackSelect.bind(this) }, [h("vm-menu-radio", { label: this.i18n.off, value: "-1" })].concat(this.textTracks.map((track, i) => (h("vm-menu-radio", { label: track.label, value: `${i}` })))))));
  }
  onAudioTrackSelect(event) {
    const radio = event.target;
    const trackId = parseInt(radio.value, 10);
    const player = getPlayerFromRegistry(this);
    player === null || player === void 0 ? void 0 : player.setCurrentAudioTrack(trackId);
  }
  buildAudioTracksMenu() {
    var _a, _b, _c;
    if (this.audioTracks.length <= 1 || !this.canSetAudioTrack) {
      return (h("vm-menu-item", { label: this.i18n.audio, hint: (_b = (_a = this.audioTracks[this.currentAudioTrack]) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : this.i18n.default }));
    }
    return (h("vm-submenu", { label: this.i18n.audio, hint: (_c = this.audioTracks[this.currentAudioTrack]) === null || _c === void 0 ? void 0 : _c.label }, h("vm-menu-radio-group", { value: `${this.currentAudioTrack}`, onVmCheck: this.onAudioTrackSelect.bind(this) }, this.audioTracks.map((track, i) => (h("vm-menu-radio", { label: track.label, value: `${i}` }))))));
  }
  render() {
    return (h("vm-settings", { pin: this.pin }, this.buildAudioTracksMenu(), this.buildPlaybackRateSubmenu(), this.buildPlaybackQualitySubmenu(), this.isVideoView && this.buildTextTracksSubmenu(), h("slot", null)));
  }
  static get watchers() { return {
    "playbackReady": ["onPlaybackReady", "onAudioTracksChange", "onTextTracksChange"],
    "audioTracks": ["onAudioTracksChange"],
    "textTracks": ["onTextTracksChange"]
  }; }
  static get style() { return defaultSettingsCss; }
};

const defaultUiCss = ":host{display:contents;pointer-events:none}";

const DefaultUI = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    /**
     * Whether clicking the player should not toggle playback.
     */
    this.noClickToPlay = false;
    /**
     * Whether double clicking the player should not toggle fullscreen mode.
     */
    this.noDblClickFullscreen = false;
    /**
     * Whether the custom captions UI should not be loaded.
     */
    this.noCaptions = false;
    /**
     * Whether the custom poster UI should not be loaded.
     */
    this.noPoster = false;
    /**
     * Whether the custom spinner UI should not be loaded.
     */
    this.noSpinner = false;
    /**
     * Whether the custom default controls should not be loaded.
     */
    this.noControls = false;
    /**
     * Whether the custom default settings menu should not be loaded.
     */
    this.noSettings = false;
    /**
     * Whether the default loading screen should not be loaded.
     */
    this.noLoadingScreen = false;
    withComponentRegistry(this);
  }
  render() {
    return (h("vm-ui", null, !this.noClickToPlay && h("vm-click-to-play", null), !this.noDblClickFullscreen && h("vm-dbl-click-fullscreen", null), !this.noCaptions && h("vm-captions", null), !this.noPoster && h("vm-poster", null), !this.noSpinner && h("vm-spinner", null), !this.noLoadingScreen && h("vm-loading-screen", null), !this.noControls && h("vm-default-controls", null), !this.noSettings && h("vm-default-settings", null), h("slot", null)));
  }
  static get style() { return defaultUiCss; }
};

class LazyLoader {
  constructor(el, attributes, onLoad) {
    var _a;
    this.el = el;
    this.attributes = attributes;
    this.onLoad = onLoad;
    this.hasLoaded = false;
    if (isNil(this.el))
      return;
    this.intersectionObs = this.canObserveIntersection()
      ? new IntersectionObserver(this.onIntersection.bind(this))
      : undefined;
    this.mutationObs = this.canObserveMutations()
      ? new MutationObserver(this.onMutation.bind(this))
      : undefined;
    (_a = this.mutationObs) === null || _a === void 0 ? void 0 : _a.observe(this.el, {
      childList: true,
      subtree: true,
      attributeFilter: this.attributes,
    });
    this.lazyLoad();
  }
  didLoad() {
    return this.hasLoaded;
  }
  destroy() {
    var _a, _b;
    (_a = this.intersectionObs) === null || _a === void 0 ? void 0 : _a.disconnect();
    (_b = this.mutationObs) === null || _b === void 0 ? void 0 : _b.disconnect();
  }
  canObserveIntersection() {
    return IS_CLIENT && window.IntersectionObserver;
  }
  canObserveMutations() {
    return IS_CLIENT && window.MutationObserver;
  }
  lazyLoad() {
    var _a;
    if (this.canObserveIntersection()) {
      (_a = this.intersectionObs) === null || _a === void 0 ? void 0 : _a.observe(this.el);
    }
    else {
      this.load();
    }
  }
  onIntersection(entries) {
    entries.forEach(entry => {
      if (entry.intersectionRatio > 0 || entry.isIntersecting) {
        this.load();
        this.intersectionObs.unobserve(entry.target);
      }
    });
  }
  onMutation() {
    if (this.hasLoaded)
      this.load();
  }
  getLazyElements() {
    const root = !isNil(this.el.shadowRoot) ? this.el.shadowRoot : this.el;
    return root.querySelectorAll('.lazy');
  }
  load() {
    window.requestAnimationFrame(() => {
      this.getLazyElements().forEach(this.loadEl.bind(this));
    });
  }
  loadEl(el) {
    var _a, _b;
    (_a = this.intersectionObs) === null || _a === void 0 ? void 0 : _a.unobserve(el);
    this.hasLoaded = true;
    (_b = this.onLoad) === null || _b === void 0 ? void 0 : _b.call(this, el);
  }
}

const embedCss = ":host{z-index:var(--vm-media-z-index)}iframe{position:absolute;top:0;left:0;border:0;width:100%;height:100%;user-select:none}";

var __awaiter$l = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
let idCount$4 = 0;
const connected = new Set();
const Embed = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.vmEmbedSrcChange = createEvent(this, "vmEmbedSrcChange", 3);
    this.vmEmbedMessage = createEvent(this, "vmEmbedMessage", 3);
    this.vmEmbedLoaded = createEvent(this, "vmEmbedLoaded", 3);
    this.srcWithParams = '';
    this.hasEnteredViewport = false;
    /**
     * A URL that will load the external player and media (Eg: https://www.youtube.com/embed/DyTCOwB0DVw).
     */
    this.embedSrc = '';
    /**
     * The title of the current media so it can be set on the inner `iframe` for screen readers.
     */
    this.mediaTitle = '';
    /**
     * The parameters to pass to the embedded player which are appended to the `embedSrc` prop. These
     * can be passed in as a query string or object.
     */
    this.params = '';
    /**
     * A collection of URLs to that the browser should immediately start establishing a connection
     * with.
     */
    this.preconnections = [];
    withComponentRegistry(this);
  }
  onEmbedSrcChange() {
    this.srcWithParams =
      isString(this.embedSrc) && this.embedSrc.length > 0
        ? appendParamsToURL(this.embedSrc, this.params)
        : undefined;
  }
  srcWithParamsChange() {
    if (isUndefined(this.srcWithParams)) {
      this.vmEmbedSrcChange.emit(this.srcWithParams);
      return;
    }
    if (!this.hasEnteredViewport && !connected.has(this.embedSrc)) {
      if (preconnect(this.srcWithParams))
        connected.add(this.embedSrc);
    }
    this.vmEmbedSrcChange.emit(this.srcWithParams);
  }
  preconnectionsChange() {
    if (this.hasEnteredViewport) {
      return;
    }
    this.preconnections
      .filter(connection => !connected.has(connection))
      .forEach(connection => {
      if (preconnect(connection))
        connected.add(connection);
    });
  }
  connectedCallback() {
    this.lazyLoader = new LazyLoader(this.host, ['data-src'], el => {
      const src = el.getAttribute('data-src');
      el.removeAttribute('src');
      if (!isNull(src))
        el.setAttribute('src', src);
    });
    this.onEmbedSrcChange();
    this.genIframeId();
  }
  disconnectedCallback() {
    this.lazyLoader.destroy();
  }
  onWindowMessage(e) {
    var _a, _b, _c;
    const originMatches = e.source === ((_a = this.iframe) === null || _a === void 0 ? void 0 : _a.contentWindow) &&
      (!isString(this.origin) || this.origin === e.origin);
    if (!originMatches)
      return;
    const message = (_c = (_b = this.decoder) === null || _b === void 0 ? void 0 : _b.call(this, e.data)) !== null && _c !== void 0 ? _c : e.data;
    if (message)
      this.vmEmbedMessage.emit(message);
  }
  /**
   * Posts a message to the embedded media player.
   */
  postMessage(message, target) {
    var _a, _b;
    return __awaiter$l(this, void 0, void 0, function* () {
      (_b = (_a = this.iframe) === null || _a === void 0 ? void 0 : _a.contentWindow) === null || _b === void 0 ? void 0 : _b.postMessage(JSON.stringify(message), target !== null && target !== void 0 ? target : '*');
    });
  }
  onLoad() {
    this.vmEmbedLoaded.emit();
  }
  genIframeId() {
    idCount$4 += 1;
    this.id = `vm-iframe-${idCount$4}`;
  }
  render() {
    return (h("iframe", { id: this.id, class: "lazy", title: this.mediaTitle, "data-src": this.srcWithParams, allowFullScreen: true, allow: "autoplay; encrypted-media; picture-in-picture;", onLoad: this.onLoad.bind(this), ref: (el) => {
        this.iframe = el;
      } }));
  }
  get host() { return this; }
  static get watchers() { return {
    "embedSrc": ["onEmbedSrcChange"],
    "params": ["onEmbedSrcChange"],
    "srcWithParams": ["srcWithParamsChange"],
    "preconnections": ["preconnectionsChange"]
  }; }
  static get style() { return embedCss; }
};

const endTimeCss = ":host{display:flex;align-items:center;justify-content:center}";

const EndTime = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
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
  static get style() { return endTimeCss; }
};

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
var document$1 = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : {};
var vendor = (('fullscreenEnabled' in document$1 && Object.keys(key)) ||
    (webkit[0] in document$1 && webkit) ||
    (moz[0] in document$1 && moz) ||
    (ms[0] in document$1 && ms) ||
    []);
var fscreen = {
    requestFullscreen: function (element) { return element[vendor[key.requestFullscreen]](); },
    requestFullscreenFunction: function (element) { return element[vendor[key.requestFullscreen]]; },
    get exitFullscreen() { return document$1[vendor[key.exitFullscreen]].bind(document$1); },
    get fullscreenPseudoClass() { return ":" + vendor[key.fullscreen]; },
    addEventListener: function (type, handler, options) { return document$1.addEventListener(vendor[key[type]], handler, options); },
    removeEventListener: function (type, handler, options) { return document$1.removeEventListener(vendor[key[type]], handler, options); },
    get fullscreenEnabled() { return Boolean(document$1[vendor[key.fullscreenEnabled]]); },
    set fullscreenEnabled(val) { },
    get fullscreenElement() { return document$1[vendor[key.fullscreenElement]]; },
    set fullscreenElement(val) { },
    get onfullscreenchange() { return document$1[("on" + vendor[key.fullscreenchange]).toLowerCase()]; },
    set onfullscreenchange(handler) { return document$1[("on" + vendor[key.fullscreenchange]).toLowerCase()] = handler; },
    get onfullscreenerror() { return document$1[("on" + vendor[key.fullscreenerror]).toLowerCase()]; },
    set onfullscreenerror(handler) { return document$1[("on" + vendor[key.fullscreenerror]).toLowerCase()] = handler; },
};

function mitt(n){return {all:n=n||new Map,on:function(t,e){var i=n.get(t);i?i.push(e):n.set(t,[e]);},off:function(t,e){var i=n.get(t);i&&(e?i.splice(i.indexOf(e)>>>0,1):n.set(t,[]));},emit:function(t,e){var i=n.get(t);i&&i.slice().map(function(n){n(e);}),(i=n.get("*"))&&i.slice().map(function(n){n(t,e);});}}}

var __awaiter$k = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
    this.disposal = new Disposal();
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
    return __awaiter$k(this, void 0, void 0, function* () {
      if (this.isFullscreen)
        yield this.exitFullscreen();
      this.disposal.empty();
      this.emitter.all.clear();
    });
  }
  addFullscreenChangeEventListener(handler) {
    if (!this.isSupported)
      return noop;
    return listen(fscreen, 'fullscreenchange', handler);
  }
  addFullscreenErrorEventListener(handler) {
    if (!this.isSupported)
      return noop;
    return listen(fscreen, 'fullscreenerror', handler);
  }
  requestFullscreen() {
    return __awaiter$k(this, void 0, void 0, function* () {
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
    return __awaiter$k(this, void 0, void 0, function* () {
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
    return __awaiter$k(this, void 0, void 0, function* () {
      if (!this.isFullscreen)
        return;
      this.throwIfNoFullscreenSupport();
      return this.makeExitFullscreenRequest();
    });
  }
  makeExitFullscreenRequest() {
    return __awaiter$k(this, void 0, void 0, function* () {
      return fscreen.exitFullscreen();
    });
  }
  throwIfNoFullscreenSupport() {
    if (this.isSupported)
      return;
    throw Error('Fullscreen API is not enabled or supported in this environment.');
  }
}

var __awaiter$j = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
/**
 * Extends the base `FullscreenController` with additional logic for handling fullscreen
 * on iOS Safari where the native Fullscreen API is not available (in this case it fallsback to
 * using the `VideoPresentationController`).
 */
class VideoFullscreenController extends FullscreenController {
  constructor(host, presentationController) {
    super(host);
    this.host = host;
    this.presentationController = presentationController;
  }
  get isFullscreen() {
    return this.presentationController.isFullscreenMode;
  }
  /**
   * Whether a fallback fullscreen API is available on Safari using presentation modes. This
   * is only used on iOS where the native fullscreen API is not available.
   *
   * @link https://developer.apple.com/documentation/webkitjs/htmlvideoelement/1631913-webkitpresentationmode
   */
  get isSupported() {
    return this.presentationController.isSupported;
  }
  makeEnterFullscreenRequest() {
    return __awaiter$j(this, void 0, void 0, function* () {
      return this.presentationController.setPresentationMode('fullscreen');
    });
  }
  makeExitFullscreenRequest() {
    return __awaiter$j(this, void 0, void 0, function* () {
      return this.presentationController.setPresentationMode('inline');
    });
  }
  addFullscreenChangeEventListener() {
    if (!this.isSupported)
      return noop;
    this.presentationController.on('change', this.handlePresentationModeChange.bind(this));
    return () => {
      this.presentationController.off('change', this.handlePresentationModeChange.bind(this));
    };
  }
  handlePresentationModeChange() {
    this.handleFullscreenChange();
  }
  addFullscreenErrorEventListener() {
    return noop;
  }
}

var __awaiter$i = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
/**
 * Contains the logic for handling presentation modes on Safari. This class is used by
 * the `VideoFullscreenController` as a fallback when the native Fullscreen API is not
 * available (ie: iOS Safari).
 */
class VideoPresentationController {
  constructor(host) {
    this.host = host;
    this.disposal = new Disposal();
    this.emitter = mitt();
    const disconnectedCallback = host.disconnectedCallback;
    host.disconnectedCallback = () => __awaiter$i(this, void 0, void 0, function* () {
      yield this.destroy();
      disconnectedCallback === null || disconnectedCallback === void 0 ? void 0 : disconnectedCallback.call(host);
    });
  }
  get videoElement() {
    var _a;
    if (((_a = this.host.mediaEl) === null || _a === void 0 ? void 0 : _a.tagName.toLowerCase()) === 'video') {
      return this.host.mediaEl;
    }
    return undefined;
  }
  /**
   * The current presentation mode, possible values include `inline`, `picture-in-picture` and
   * `fullscreen`. Only available in Safari.
   *
   * @default undefined
   * @link https://developer.apple.com/documentation/webkitjs/htmlvideoelement/1631913-webkitpresentationmode
   */
  get presentationMode() {
    var _a;
    return (_a = this.videoElement) === null || _a === void 0 ? void 0 : _a.webkitPresentationMode;
  }
  /**
   * Whether the current `presentationMode` is `inline`.
   */
  get isInlineMode() {
    return this.presentationMode === 'inline';
  }
  /**
   * Whether the current `presentationMode` is `picture-in-picture`.
   */
  get isPictureInPictureMode() {
    return this.presentationMode === 'inline';
  }
  /**
   * Whether the current `presentationMode` is `fullscreen`.
   */
  get isFullscreenMode() {
    return this.presentationMode === 'fullscreen';
  }
  /**
   * Whether the presentation mode API is available.
   *
   * @link https://developer.apple.com/documentation/webkitjs/htmlvideoelement/1628805-webkitsupportsfullscreen
   */
  get isSupported() {
    var _a, _b, _c;
    return (IS_IOS &&
      isFunction((_a = this.videoElement) === null || _a === void 0 ? void 0 : _a.webkitSetPresentationMode) &&
      ((_c = (_b = this.videoElement) === null || _b === void 0 ? void 0 : _b.webkitSupportsFullscreen) !== null && _c !== void 0 ? _c : false));
  }
  setPresentationMode(mode) {
    var _a, _b;
    (_b = (_a = this.videoElement) === null || _a === void 0 ? void 0 : _a.webkitSetPresentationMode) === null || _b === void 0 ? void 0 : _b.call(_a, mode);
  }
  on(type, handler) {
    // @ts-expect-error - not typed yet.
    this.emitter.on(type, handler);
  }
  off(type, handler) {
    // @ts-expect-error - not typed yet.
    this.emitter.off(type, handler);
  }
  destroy() {
    this.setPresentationMode('inline');
    this.disposal.empty();
  }
  addPresentationModeChangeEventListener() {
    if (!this.isSupported || isNil(this.videoElement))
      return noop;
    return listen(this.videoElement, 'webkitpresentationmodechanged', this.handlePresentationModeChange.bind(this));
  }
  handlePresentationModeChange() {
    this.emitter.emit('change', this.presentationMode);
  }
}

const fileCss = "audio.sc-vm-file,video.sc-vm-file{border-radius:inherit;vertical-align:middle;width:100%;outline:0}video.sc-vm-file{position:absolute;top:0;left:0;border:0;height:100%;user-select:none}";

var __awaiter$h = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const File = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.vmLoadStart = createEvent(this, "vmLoadStart", 7);
    this.vmError = createEvent(this, "vmError", 7);
    this.vmMediaElChange = createEvent(this, "vmMediaElChange", 7);
    this.vmSrcSetChange = createEvent(this, "vmSrcSetChange", 7);
    this.textTracksDisposal = new Disposal();
    this.wasPausedBeforeSeeking = true;
    this.currentSrcSet = [];
    this.mediaQueryDisposal = new Disposal();
    /** @internal Whether an external SDK will attach itself to the media player and control it. */
    this.willAttach = false;
    /** @inheritdoc */
    this.preload = 'metadata';
    /**
     * The playback rates that are available for this media.
     */
    this.playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
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
    /** @internal */
    this.noConnect = false;
    /** @internal */
    this.paused = true;
    /** @internal */
    this.currentTime = 0;
    /** @internal */
    this.volume = 0;
    /** @internal */
    this.playbackReady = false;
    /** @internal */
    this.playbackStarted = false;
    this.presentationController = new VideoPresentationController(this);
    this.fullscreenController = new VideoFullscreenController(this, this.presentationController);
    /** @internal */
    this.currentTextTrack = -1;
    /** @internal */
    this.hasCustomTextManager = false;
    /** @internal */
    this.isTextTrackVisible = true;
    /** @internal */
    this.shouldRenderNativeTextTracks = true;
    withComponentRegistry(this);
    withProviderConnect(this);
    withProviderContext(this, [
      'playbackReady',
      'playbackStarted',
      'currentTime',
      'volume',
      'paused',
      'currentTextTrack',
      'isTextTrackVisible',
      'shouldRenderNativeTextTracks',
    ]);
    watchComponentRegistry(this, 'vm-poster', regs => {
      [this.vmPoster] = regs;
    });
  }
  onMediaTitleChange() {
    this.dispatch('mediaTitle', this.mediaTitle);
  }
  onPosterChange() {
    var _a;
    if (!this.playbackStarted)
      (_a = this.mediaEl) === null || _a === void 0 ? void 0 : _a.load();
  }
  onViewTypeChange() {
    this.dispatch('viewType', this.viewType);
  }
  connectedCallback() {
    this.initLazyLoader();
    this.dispatch = createProviderDispatcher(this);
    this.onViewTypeChange();
    this.onPosterChange();
    this.onMediaTitleChange();
    this.addPresentationControllerListeners();
  }
  componentDidRender() {
    if (this.prevMediaEl !== this.mediaEl) {
      this.prevMediaEl = this.mediaEl;
      this.vmMediaElChange.emit(this.mediaEl);
      this.presentationController.addPresentationModeChangeEventListener();
    }
  }
  componentDidLoad() {
    this.onViewTypeChange();
  }
  disconnectedCallback() {
    var _a;
    this.mediaQueryDisposal.empty();
    this.textTracksDisposal.empty();
    this.cancelTimeUpdates();
    (_a = this.lazyLoader) === null || _a === void 0 ? void 0 : _a.destroy();
    this.wasPausedBeforeSeeking = true;
  }
  initLazyLoader() {
    this.lazyLoader = new LazyLoader(this.host, ['data-src', 'data-poster'], () => {
      if (isNil(this.mediaEl))
        return;
      const poster = this.mediaEl.getAttribute('data-poster');
      if (!isNull(poster))
        this.mediaEl.setAttribute('poster', poster);
      this.refresh();
      this.didSrcSetChange();
    });
  }
  refresh() {
    if (isNil(this.mediaEl))
      return;
    const { children } = this.mediaEl;
    for (let i = 0; i <= children.length - 1; i += 1) {
      const child = children[i];
      const src = child.getAttribute('data-src') ||
        child.getAttribute('src') ||
        child.getAttribute('data-vs');
      child.removeAttribute('src');
      if (isNull(src))
        continue;
      child.setAttribute('data-vs', src);
      child.setAttribute('src', src);
    }
  }
  didSrcSetChange() {
    if (isNil(this.mediaEl))
      return;
    const sources = Array.from(this.mediaEl.querySelectorAll('source'));
    const srcSet = sources.map(source => {
      var _a;
      return ({
        src: source.getAttribute('data-vs'),
        media: (_a = source.getAttribute('data-media')) !== null && _a !== void 0 ? _a : undefined,
        ref: source,
      });
    });
    const didChange = this.currentSrcSet.length !== srcSet.length ||
      srcSet.some((resource, i) => this.currentSrcSet[i].src !== resource.src);
    if (didChange) {
      this.currentSrcSet = srcSet;
      this.onSrcSetChange();
    }
  }
  onSrcSetChange() {
    var _a;
    this.textTracksDisposal.empty();
    this.mediaQueryDisposal.empty();
    this.vmLoadStart.emit();
    this.vmSrcSetChange.emit(this.currentSrcSet);
    if (!this.willAttach)
      (_a = this.mediaEl) === null || _a === void 0 ? void 0 : _a.load();
  }
  hasCustomPoster() {
    return !IS_IOS && !isUndefined(this.vmPoster);
  }
  cancelTimeUpdates() {
    if (isNumber(this.timeRAF))
      window.cancelAnimationFrame(this.timeRAF);
    this.timeRAF = undefined;
  }
  requestTimeUpdates() {
    var _a, _b;
    this.dispatch('currentTime', (_b = (_a = this.mediaEl) === null || _a === void 0 ? void 0 : _a.currentTime) !== null && _b !== void 0 ? _b : 0);
    this.timeRAF = window.requestAnimationFrame(() => {
      this.requestTimeUpdates();
    });
  }
  getMediaType() {
    const { currentSrc } = this.mediaEl;
    if (audioRegex.test(currentSrc))
      return MediaType.Audio;
    if (videoRegex.test(currentSrc) || hlsRegex.test(currentSrc))
      return MediaType.Video;
    return undefined;
  }
  onLoadedMetadata() {
    this.mediaEl.volume = this.volume / 100;
    this.listenToTextTracksForChanges();
    this.onTextTracksChange();
    this.onProgress();
    this.dispatch('currentPoster', this.poster);
    this.dispatch('duration', this.mediaEl.duration);
    this.dispatch('playbackRates', this.playbackRates);
    if (!this.willAttach) {
      this.dispatch('currentSrc', this.mediaEl.currentSrc);
      this.dispatch('mediaType', this.getMediaType());
      this.dispatch('playbackReady', true);
    }
  }
  onProgress() {
    const { buffered, duration } = this.mediaEl;
    const end = buffered.length === 0 ? 0 : buffered.end(buffered.length - 1);
    this.dispatch('buffered', end > duration ? duration : end);
  }
  onPlay() {
    this.requestTimeUpdates();
    this.dispatch('paused', false);
    if (!this.playbackStarted)
      this.dispatch('playbackStarted', true);
  }
  onPause() {
    this.cancelTimeUpdates();
    this.dispatch('paused', true);
    this.dispatch('buffering', false);
  }
  onPlaying() {
    this.dispatch('playing', true);
    this.dispatch('buffering', false);
  }
  onSeeking() {
    if (!this.wasPausedBeforeSeeking)
      this.wasPausedBeforeSeeking = this.mediaEl.paused;
    this.dispatch('currentTime', this.mediaEl.currentTime);
    this.dispatch('seeking', true);
  }
  onSeeked() {
    // Avoid calling `attemptToPlay` if seeking to 0 on 0.
    if (this.currentTime === 0 && !this.playbackStarted)
      return;
    this.dispatch('seeking', false);
    if (!this.playbackStarted || !this.wasPausedBeforeSeeking)
      this.attemptToPlay();
    this.wasPausedBeforeSeeking = true;
  }
  onRateChange() {
    this.dispatch('playbackRate', this.mediaEl.playbackRate);
  }
  onVolumeChange() {
    this.dispatch('muted', this.mediaEl.muted);
    this.dispatch('volume', this.mediaEl.volume * 100);
  }
  onDurationChange() {
    this.dispatch('duration', this.mediaEl.duration);
  }
  onWaiting() {
    this.dispatch('buffering', true);
  }
  onSuspend() {
    this.dispatch('buffering', false);
  }
  onEnded() {
    if (!this.loop)
      this.dispatch('playbackEnded', true);
  }
  onError() {
    this.vmError.emit(this.mediaEl.error);
  }
  attemptToPlay() {
    var _a;
    try {
      (_a = this.mediaEl) === null || _a === void 0 ? void 0 : _a.play();
    }
    catch (e) {
      this.vmError.emit(e);
    }
  }
  togglePiPInChrome(toggle) {
    var _a;
    return toggle
      ? (_a = this.mediaEl) === null || _a === void 0 ? void 0 : _a.requestPictureInPicture()
      : document.exitPictureInPicture();
  }
  togglePiPInSafari(toggle) {
    var _a, _b;
    const mode = toggle
      ? "picture-in-picture" /* PiP */
      : "inline" /* Inline */;
    if (!((_a = this.mediaEl) === null || _a === void 0 ? void 0 : _a.webkitSupportsPresentationMode(mode))) {
      throw new Error('PiP API is not available.');
    }
    return (_b = this.mediaEl) === null || _b === void 0 ? void 0 : _b.webkitSetPresentationMode(mode);
  }
  togglePiP(toggle) {
    return __awaiter$h(this, void 0, void 0, function* () {
      if (canUsePiPInChrome())
        return this.togglePiPInChrome(toggle);
      if (canUsePiPInSafari())
        return this.togglePiPInSafari(toggle);
      throw new Error('PiP API is not available.');
    });
  }
  onEnterPiP() {
    this.dispatch('isPiPActive', true);
  }
  onLeavePiP() {
    this.dispatch('isPiPActive', false);
  }
  addPresentationControllerListeners() {
    this.presentationController.on('change', mode => {
      this.dispatch('isPiPActive', mode === "picture-in-picture" /* PiP */);
      this.dispatch('isFullscreenActive', mode === "fullscreen" /* Fullscreen */);
    });
  }
  /** @internal */
  getAdapter() {
    return __awaiter$h(this, void 0, void 0, function* () {
      return {
        getInternalPlayer: () => __awaiter$h(this, void 0, void 0, function* () { return this.mediaEl; }),
        play: () => __awaiter$h(this, void 0, void 0, function* () { var _a; return (_a = this.mediaEl) === null || _a === void 0 ? void 0 : _a.play(); }),
        pause: () => __awaiter$h(this, void 0, void 0, function* () { var _b; return (_b = this.mediaEl) === null || _b === void 0 ? void 0 : _b.pause(); }),
        canPlay: (type) => __awaiter$h(this, void 0, void 0, function* () { return isString(type) && (audioRegex.test(type) || videoRegex.test(type)); }),
        setCurrentTime: (time) => __awaiter$h(this, void 0, void 0, function* () {
          if (this.mediaEl)
            this.mediaEl.currentTime = time;
        }),
        setMuted: (muted) => __awaiter$h(this, void 0, void 0, function* () {
          if (this.mediaEl)
            this.mediaEl.muted = muted;
        }),
        setVolume: (volume) => __awaiter$h(this, void 0, void 0, function* () {
          if (this.mediaEl)
            this.mediaEl.volume = volume / 100;
        }),
        canSetPlaybackRate: () => __awaiter$h(this, void 0, void 0, function* () { return true; }),
        setPlaybackRate: (rate) => __awaiter$h(this, void 0, void 0, function* () {
          if (this.mediaEl)
            this.mediaEl.playbackRate = rate;
        }),
        canSetPiP: () => __awaiter$h(this, void 0, void 0, function* () { return canUsePiP(); }),
        enterPiP: () => this.togglePiP(true),
        exitPiP: () => this.togglePiP(false),
        canSetFullscreen: () => __awaiter$h(this, void 0, void 0, function* () { return this.fullscreenController.isSupported; }),
        enterFullscreen: () => this.fullscreenController.requestFullscreen(),
        exitFullscreen: () => this.fullscreenController.exitFullscreen(),
        setCurrentTextTrack: (trackId) => __awaiter$h(this, void 0, void 0, function* () {
          if (trackId !== this.currentTextTrack)
            this.toggleTextTrackModes(trackId);
        }),
        setTextTrackVisibility: (isVisible) => __awaiter$h(this, void 0, void 0, function* () {
          this.isTextTrackVisible = isVisible;
          this.toggleTextTrackModes(this.currentTextTrack);
        }),
      };
    });
  }
  onHasCustomTextManagerChange() {
    if (this.hasCustomTextManager) {
      this.textTracksDisposal.empty();
    }
    else if (this.playbackReady) {
      this.listenToTextTracksForChanges();
    }
  }
  onShouldRenderNativeTextTracksChange() {
    if (this.hasCustomTextManager)
      return;
    this.toggleTextTrackModes(this.currentTextTrack);
  }
  onProviderConnect(event) {
    if (this.noConnect)
      event.stopImmediatePropagation();
  }
  onProviderDisconnect(event) {
    if (this.noConnect)
      event.stopImmediatePropagation();
  }
  getFilteredTextTracks() {
    const tracks = [];
    const textTrackList = Array.from(this.mediaEl.textTracks);
    for (let i = 0; i < textTrackList.length; i += 1) {
      const track = textTrackList[i];
      // Edge adds a track without a label; we don't want to use it.
      if ((track.kind === 'subtitles' || track.kind === 'captions') &&
        track.label) {
        tracks.push(textTrackList[i]);
      }
    }
    return tracks;
  }
  listenToTextTracksForChanges() {
    if (this.hasCustomTextManager)
      return;
    this.textTracksDisposal.empty();
    if (isUndefined(this.mediaEl))
      return;
    this.textTracksDisposal.add(listen(this.mediaEl.textTracks, 'change', this.onTextTracksChange.bind(this)));
  }
  onTextTracksChange() {
    var _a;
    const tracks = this.getFilteredTextTracks();
    let trackId = -1;
    for (let id = 0; id < tracks.length; id += 1) {
      if (tracks[id].mode === 'hidden') {
        // Do not break in case there is a following track with showing.
        trackId = id;
      }
      else if (tracks[id].mode === 'showing') {
        trackId = id;
        break;
      }
    }
    if (!this.shouldRenderNativeTextTracks &&
      ((_a = tracks[trackId]) === null || _a === void 0 ? void 0 : _a.mode) === 'showing') {
      tracks[trackId].mode = 'hidden';
      return;
    }
    if (this.shouldRenderNativeTextTracks) {
      this.isTextTrackVisible =
        trackId !== -1 && tracks[trackId].mode === 'showing';
      this.dispatch('isTextTrackVisible', this.isTextTrackVisible);
    }
    this.dispatch('textTracks', tracks);
    this.dispatch('currentTextTrack', this.shouldRenderNativeTextTracks && !this.isTextTrackVisible
      ? -1
      : trackId);
  }
  toggleTextTrackModes(newTrackId) {
    if (isNil(this.mediaEl))
      return;
    const { textTracks } = this.mediaEl;
    if (newTrackId === -1) {
      Array.from(textTracks).forEach(track => {
        track.mode = 'disabled';
      });
    }
    else {
      const oldTrack = textTracks[this.currentTextTrack];
      if (oldTrack)
        oldTrack.mode = 'disabled';
    }
    const nextTrack = textTracks[newTrackId];
    if (nextTrack) {
      nextTrack.mode =
        this.isTextTrackVisible && this.shouldRenderNativeTextTracks
          ? 'showing'
          : 'hidden';
    }
    this.dispatch('currentTextTrack', this.shouldRenderNativeTextTracks && !this.isTextTrackVisible
      ? -1
      : newTrackId);
    this.dispatch('isTextTrackVisible', this.isTextTrackVisible);
  }
  render() {
    const mediaProps = {
      autoplay: this.autoplay,
      muted: this.muted,
      playsinline: this.playsinline,
      playsInline: this.playsinline,
      'x5-playsinline': this.playsinline,
      'webkit-playsinline': this.playsinline,
      controls: this.controls,
      crossorigin: this.crossOrigin === '' ? 'anonymous' : this.crossOrigin,
      controlslist: this.controlsList,
      'data-poster': !this.hasCustomPoster() ? this.poster : undefined,
      loop: this.loop,
      preload: this.preload,
      disablePictureInPicture: this.disablePiP,
      autoPictureInPicture: this.autoPiP,
      disableRemotePlayback: this.disableRemotePlayback,
      'x-webkit-airplay': this.disableRemotePlayback ? 'deny' : 'allow',
      ref: (el) => {
        this.mediaEl = el;
      },
      onLoadedMetadata: this.onLoadedMetadata.bind(this),
      onProgress: this.onProgress.bind(this),
      onPlay: this.onPlay.bind(this),
      onPause: this.onPause.bind(this),
      onPlaying: this.onPlaying.bind(this),
      onSeeking: this.onSeeking.bind(this),
      onSeeked: this.onSeeked.bind(this),
      onRateChange: this.onRateChange.bind(this),
      onVolumeChange: this.onVolumeChange.bind(this),
      onDurationChange: this.onDurationChange.bind(this),
      onWaiting: this.onWaiting.bind(this),
      onSuspend: this.onSuspend.bind(this),
      onEnded: this.onEnded.bind(this),
      onError: this.onError.bind(this),
    };
    const audio = (h("audio", Object.assign({ class: "lazy" }, mediaProps), h("slot", null), "Your browser does not support the", h("code", null, "audio"), "element."));
    const video = (h("video", Object.assign({ class: "lazy" }, mediaProps, {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onenterpictureinpicture: this.onEnterPiP.bind(this), onleavepictureinpicture: this.onLeavePiP.bind(this)
    }), h("slot", null), "Your browser does not support the", h("code", null, "video"), "element."));
    return this.viewType === ViewType.Audio ? audio : video;
  }
  get host() { return this; }
  static get watchers() { return {
    "mediaTitle": ["onMediaTitleChange"],
    "poster": ["onPosterChange"],
    "viewType": ["onViewTypeChange"],
    "hasCustomTextManager": ["onHasCustomTextManagerChange"],
    "shouldRenderNativeTextTracks": ["onShouldRenderNativeTextTracksChange"]
  }; }
  static get style() { return fileCss; }
};

const fullscreenControlCss = ":host([hidden]){display:none}";

var __awaiter$g = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const FullscreenControl = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
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
    return __awaiter$g(this, void 0, void 0, function* () {
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
  static get style() { return fullscreenControlCss; }
};

var __awaiter$f = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const HLS = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.vmLoadStart = createEvent(this, "vmLoadStart", 7);
    this.vmError = createEvent(this, "vmError", 7);
    this.hasAttached = false;
    /**
     * The NPM package version of the `hls.js` library to download and use if HLS is not natively
     * supported.
     */
    this.version = 'latest';
    /** @inheritdoc */
    this.preload = 'metadata';
    /** @internal */
    this.playbackReady = false;
    withComponentRegistry(this);
    withProviderConnect(this);
    withPlayerContext(this, ['playbackReady']);
  }
  connectedCallback() {
    this.dispatch = createProviderDispatcher(this);
    if (this.mediaEl)
      this.setupHls();
  }
  disconnectedCallback() {
    this.destroyHls();
  }
  get src() {
    if (isNil(this.videoProvider))
      return undefined;
    const sources = this.videoProvider.querySelectorAll('source');
    const currSource = Array.from(sources).find(source => hlsRegex.test(source.src) || hlsTypeRegex.test(source.type));
    return currSource === null || currSource === void 0 ? void 0 : currSource.src;
  }
  setupHls() {
    return __awaiter$f(this, void 0, void 0, function* () {
      if (!isUndefined(this.hls))
        return;
      try {
        const url = this.libSrc ||
          `https://cdn.jsdelivr.net/npm/hls.js@${this.version}/dist/hls.min.js`;
        const Hls = (yield loadSDK(url, 'Hls'));
        if (!Hls.isSupported()) {
          this.vmError.emit('hls.js is not supported');
          return;
        }
        this.hls = new Hls(this.config);
        this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          this.hasAttached = true;
          this.onSrcChange();
        });
        this.hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
          this.dispatch('audioTracks', this.hls.audioTracks);
          this.dispatch('currentAudioTrack', this.hls.audioTrack);
        });
        this.hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, () => {
          this.dispatch('currentAudioTrack', this.hls.audioTrack);
        });
        this.hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                this.hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                this.hls.recoverMediaError();
                break;
              default:
                this.destroyHls();
                break;
            }
          }
          this.vmError.emit({ event, data });
        });
        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
          this.dispatch('mediaType', MediaType.Video);
          this.dispatch('currentSrc', this.src);
          this.dispatchLevels();
        });
        this.hls.on(Hls.Events.LEVEL_LOADED, (_, data) => {
          if (!this.playbackReady) {
            this.dispatch('duration', data.details.totalduration);
            this.dispatch('playbackReady', true);
          }
        });
        this.hls.attachMedia(this.mediaEl);
      }
      catch (e) {
        this.vmError.emit(e);
      }
    });
  }
  dispatchLevels() {
    if (!this.hls.levels || this.hls.levels.length === 0)
      return;
    this.dispatch('playbackQualities', [
      'Auto',
      ...this.hls.levels.map(this.levelToPlaybackQuality),
    ]);
    this.dispatch('playbackQuality', 'Auto');
  }
  levelToPlaybackQuality(level) {
    return level === -1 ? 'Auto' : `${level.height}p`;
  }
  findLevelIndexFromQuality(quality) {
    return this.hls.levels.findIndex((level) => this.levelToPlaybackQuality(level) === quality);
  }
  destroyHls() {
    var _a;
    (_a = this.hls) === null || _a === void 0 ? void 0 : _a.destroy();
    this.hasAttached = false;
  }
  onMediaElChange(event) {
    return __awaiter$f(this, void 0, void 0, function* () {
      this.destroyHls();
      if (isUndefined(event.detail))
        return;
      this.mediaEl = event.detail;
      // Need a small delay incase the media element changes rapidly and Hls.js can't reattach.
      setTimeout(() => __awaiter$f(this, void 0, void 0, function* () {
        yield this.setupHls();
      }), 50);
    });
  }
  onSrcChange() {
    var _a;
    return __awaiter$f(this, void 0, void 0, function* () {
      if (this.hasAttached && this.hls.url !== this.src) {
        this.vmLoadStart.emit();
        (_a = this.hls) === null || _a === void 0 ? void 0 : _a.loadSource(this.src);
      }
    });
  }
  /** @internal */
  getAdapter() {
    var _a, _b;
    return __awaiter$f(this, void 0, void 0, function* () {
      const adapter = (_b = (yield ((_a = this.videoProvider) === null || _a === void 0 ? void 0 : _a.getAdapter()))) !== null && _b !== void 0 ? _b : {};
      const canVideoProviderPlay = adapter.canPlay;
      return Object.assign(Object.assign({}, adapter), { getInternalPlayer: () => __awaiter$f(this, void 0, void 0, function* () { return this.hls; }), canPlay: (type) => __awaiter$f(this, void 0, void 0, function* () {
          var _c;
          return (isString(type) && hlsRegex.test(type)) ||
            ((_c = canVideoProviderPlay === null || canVideoProviderPlay === void 0 ? void 0 : canVideoProviderPlay(type)) !== null && _c !== void 0 ? _c : false);
        }), canSetPlaybackQuality: () => __awaiter$f(this, void 0, void 0, function* () { var _d, _e; return ((_e = (_d = this.hls) === null || _d === void 0 ? void 0 : _d.levels) === null || _e === void 0 ? void 0 : _e.length) > 0; }), setPlaybackQuality: (quality) => __awaiter$f(this, void 0, void 0, function* () {
          if (!isUndefined(this.hls)) {
            this.hls.currentLevel = this.findLevelIndexFromQuality(quality);
            // Update the provider cache.
            this.dispatch('playbackQuality', quality);
          }
        }), setCurrentAudioTrack: (trackId) => __awaiter$f(this, void 0, void 0, function* () {
          if (!isUndefined(this.hls)) {
            this.hls.audioTrack = trackId;
          }
        }) });
    });
  }
  render() {
    return (h("vm-video", { willAttach: true, crossOrigin: this.crossOrigin, preload: this.preload, poster: this.poster, controlsList: this.controlsList, autoPiP: this.autoPiP, disablePiP: this.disablePiP, disableRemotePlayback: this.disableRemotePlayback, mediaTitle: this.mediaTitle, ref: (el) => {
        this.videoProvider = el;
      } }, h("slot", null)));
  }
};

/**
 * INSPIRED BY: https://github.com/shoelace-style/shoelace/blob/next/src/components/icon-library/icon-library-registry.ts
 */
const ICONS_BASE_CDN_URL = 'https://cdn.jsdelivr.net/npm/@vime/core@latest/icons';
const registry = new Map(Object.entries({
  vime: iconName => `${ICONS_BASE_CDN_URL}/vime/vm-${iconName}.svg`,
  material: iconName => `${ICONS_BASE_CDN_URL}/material/md-${iconName}.svg`,
}));
const watch = new Set();
function withIconRegistry(component) {
  const el = getElement(component);
  createStencilHook(component, () => {
    watch.add(el);
  }, () => {
    watch.delete(el);
  });
}
const getIconLibraryResolver = (name) => registry.get(name);
function registerIconLibrary(name, resolver) {
  if (!isUndefined(resolver)) {
    registry.set(name, resolver);
  }
  // Redraw watched icons.
  watch.forEach(iconEl => {
    if (iconEl.library === name)
      iconEl.redraw();
  });
}
function deregisterIconLibrary(name) {
  registry.delete(name);
}

/**
 * INSPIRED BY: https://github.com/shoelace-style/shoelace/blob/next/src/components/icon/request.ts
 */
var __awaiter$e = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const iconFiles = new Map();
const requestIcon = (url) => {
  if (iconFiles.has(url))
    return iconFiles.get(url);
  const request = fetch(url).then((response) => __awaiter$e(void 0, void 0, void 0, function* () {
    if (response.ok) {
      const div = document.createElement('div');
      div.innerHTML = yield response.text();
      const svg = div.firstElementChild;
      return {
        ok: response.ok,
        status: response.status,
        svg: svg && svg.tagName.toLowerCase() === 'svg' ? svg.outerHTML : '',
      };
    }
    return {
      ok: response.ok,
      status: response.status,
    };
  }));
  iconFiles.set(url, request);
  return request;
};

const iconCss = ":host{display:inline-block;width:1em;height:1em;contain:strict;box-sizing:content-box !important}.icon,svg{display:block;height:100%;width:100%;transition:var(--vm-icon-transition);transform:var(--vm-icon-transform);fill:var(--vm-icon-fill, currentColor);stroke:var(--vm-icon-stroke)}";

/**
 * INSPIRED BY: https://github.com/shoelace-style/shoelace/blob/next/src/components/icon/icon.tsx
 */
var __awaiter$d = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const parser = new DOMParser();
const Icon = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.vmLoad = createEvent(this, "vmLoad", 7);
    this.vmError = createEvent(this, "vmError", 7);
    /** @internal */
    this.icons = 'material';
    withComponentRegistry(this);
    withIconRegistry(this);
  }
  handleChange() {
    this.setIcon();
  }
  connectedCallback() {
    withPlayerContext(this, ['icons']);
  }
  componentDidLoad() {
    this.setIcon();
  }
  /**
   * @internal Fetches the icon and redraws it. Used to handle library registrations.
   */
  redraw() {
    return __awaiter$d(this, void 0, void 0, function* () {
      this.setIcon();
    });
  }
  getLabel() {
    let label = '';
    if (this.label) {
      label = this.label;
    }
    else if (this.name) {
      label = this.name.replace(/-/g, ' ');
    }
    else if (this.src) {
      label = this.src
        .replace(/.*\//, '')
        .replace(/-/g, ' ')
        .replace(/\.svg/i, '');
    }
    return label;
  }
  setIcon() {
    var _a;
    return __awaiter$d(this, void 0, void 0, function* () {
      const resolver = getIconLibraryResolver((_a = this.library) !== null && _a !== void 0 ? _a : this.icons);
      let url = this.src;
      if (this.name && resolver) {
        url = resolver(this.name);
      }
      if (url) {
        try {
          const file = yield requestIcon(url);
          if (file.ok) {
            const doc = parser.parseFromString(file.svg, 'text/html');
            const svg = doc.body.querySelector('svg');
            if (svg) {
              this.svg = svg.outerHTML;
              this.vmLoad.emit();
            }
            else {
              this.svg = '';
              this.vmError.emit({ status: file.status });
            }
          }
        }
        catch (_b) {
          this.vmError.emit();
        }
      }
    });
  }
  render() {
    return (h("div", { class: "icon", role: "img", "aria-label": this.getLabel(), innerHTML: this.svg }));
  }
  static get watchers() { return {
    "name": ["handleChange"],
    "src": ["handleChange"],
    "library": ["handleChange"],
    "icons": ["handleChange"]
  }; }
  static get style() { return iconCss; }
};

const IconLibrary = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    /** @internal */
    this.icons = 'material';
    withComponentRegistry(this);
    withPlayerContext(this, ['icons']);
  }
  handleUpdate() {
    this.register();
  }
  connectedCallback() {
    this.register();
  }
  disconnectedCallback() {
    if (!isUndefined(this.name))
      deregisterIconLibrary(this.name);
  }
  register() {
    var _a;
    registerIconLibrary((_a = this.name) !== null && _a !== void 0 ? _a : this.icons, this.name ? this.resolver : undefined);
  }
  get host() { return this; }
  static get watchers() { return {
    "name": ["handleUpdate"],
    "resolver": ["handleUpdate"],
    "icons": ["handleUpdate"]
  }; }
};

const liveIndicatorCss = ".liveIndicator{display:flex;align-items:center;font-size:13px;font-weight:bold;letter-spacing:0.6px;color:var(--vm-control-color)}.liveIndicator.hidden{display:none}.indicator{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px;background-color:var(--vm-live-indicator-color, red)}";

const LiveIndicator = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
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
  static get style() { return liveIndicatorCss; }
};

const loadingScreenCss = ":host{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:var(--vm-loading-screen-z-index);display:flex;align-items:center;justify-content:center}.loadingScreen{opacity:100;transition:var(--vm-fade-transition)}.loadingScreen.inactive{opacity:0}.dotPulse{position:relative;left:-9999px;width:var(--vm-loading-screen-dot-size);height:var(--vm-loading-screen-dot-size);border-radius:calc(var(--vm-loading-screen-dot-size) / 2);background-color:var(--vm-loading-screen-dot-color);color:var(--vm-loading-screen-dot-color);box-shadow:9999px 0 0 calc(calc(var(--vm-loading-screen-dot-size) / 2) * -1)\n    var(--vm-loading-screen-dot-color);animation:dotPulse var(--vm-loading-screen-pulse-duration) infinite linear;animation-delay:calc(var(--vm-loading-screen-pulse-duration) / 6)}.dotPulse::before,.dotPulse::after{content:'';display:inline-block;position:absolute;top:0;width:var(--vm-loading-screen-dot-size);height:var(--vm-loading-screen-dot-size);border-radius:calc(var(--vm-loading-screen-dot-size) / 2);background-color:var(--vm-loading-screen-dot-color);color:var(--vm-loading-screen-dot-color)}.dotPulse::before{box-shadow:9984px 0 0 calc(calc(var(--vm-loading-screen-dot-size) / 2) * -1)\n    var(--vm-loading-screen-dot-color);animation:dotPulseBefore var(--vm-loading-screen-pulse-duration) infinite\n    linear;animation-delay:0s}.dotPulse::after{box-shadow:10014px 0 0 calc(calc(var(--vm-loading-screen-dot-size) / 2) * -1)\n    var(--vm-loading-screen-dot-color);animation:dotPulseAfter var(--vm-loading-screen-pulse-duration) infinite\n    linear;animation-delay:calc(var(--vm-loading-screen-pulse-duration) / 3)}@keyframes dotPulseBefore{0%{box-shadow:9984px 0 0\n      calc(calc(var(--vm-loading-screen-dot-size) / 2) * -1)\n      var(--vm-loading-screen-dot-color)}30%{box-shadow:9984px 0 0 2px var(--vm-loading-screen-dot-color)}60%,100%{box-shadow:9984px 0 0\n      calc(calc(var(--vm-loading-screen-dot-size) / 2) * -1)\n      var(--vm-loading-screen-dot-color)}}@keyframes dotPulse{0%{box-shadow:9999px 0 0\n      calc(calc(var(--vm-loading-screen-dot-size) / 2) * -1)\n      var(--vm-loading-screen-dot-color)}30%{box-shadow:9999px 0 0 2px var(--vm-loading-screen-dot-color)}60%,100%{box-shadow:9999px 0 0\n      calc(calc(var(--vm-loading-screen-dot-size) / 2) * -1)\n      var(--vm-loading-screen-dot-color)}}@keyframes dotPulseAfter{0%{box-shadow:10014px 0 0\n      calc(calc(var(--vm-loading-screen-dot-size) / 2) * -1)\n      var(--vm-loading-screen-dot-color)}30%{box-shadow:10014px 0 0 2px var(--vm-loading-screen-dot-color)}60%,100%{box-shadow:10014px 0 0\n      calc(calc(var(--vm-loading-screen-dot-size) / 2) * -1)\n      var(--vm-loading-screen-dot-color)}}";

const LoadingScreen = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    /** @internal */
    this.playbackReady = false;
    /**
     * Whether the loading dots are hidden or not.
     */
    this.hideDots = false;
    withComponentRegistry(this);
    withPlayerContext(this, ['playbackReady']);
  }
  render() {
    return (h("div", { class: {
        loadingScreen: true,
        inactive: this.playbackReady,
      } }, h("slot", null), !this.hideDots && h("div", { class: "dotPulse" })));
  }
  static get style() { return loadingScreenCss; }
};

function unwrapSubmenu(el) {
  if (el.tagName.toLowerCase() !== 'vm-submenu')
    return el;
  const submenu = el;
  return submenu.shadowRoot.querySelector('vm-menu-item');
}
function unwrapRadioGroup(el) {
  var _a;
  if (el.tagName.toLowerCase() !== 'vm-menu-radio-group')
    return el;
  const radioGroup = el;
  const slot = radioGroup.shadowRoot.querySelector('slot');
  const assignedElements = Array.from((_a = slot === null || slot === void 0 ? void 0 : slot.assignedElements()) !== null && _a !== void 0 ? _a : []);
  return assignedElements
    .filter(radio => radio.tagName.toLowerCase() === 'vm-menu-radio')
    .map(radio => radio.shadowRoot.querySelector('vm-menu-item'));
}
function menuItemHunter(assignedElements) {
  if (isUndefined(assignedElements))
    return [];
  const allowed = ['vm-menu-item', 'vm-menu-radio-group', 'vm-submenu'];
  return Array.from(assignedElements !== null && assignedElements !== void 0 ? assignedElements : [])
    .filter(el => allowed.includes(el.tagName.toLowerCase()))
    .map(el => unwrapSubmenu(el))
    .map(el => unwrapRadioGroup(el))
    .reduce((acc, val) => acc.concat(val), []);
}

const menuCss = ":host{position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden;pointer-events:none;z-index:var(--vm-menu-z-index)}:host([active]){pointer-events:auto;z-index:calc(var(--vm-menu-z-index) + 1)}.menu{position:absolute;top:0;left:0;width:100%;height:100%;box-sizing:border-box;transition:var(--vm-menu-transition)}.menu.slideIn{transform:translateX(0)}.menu[aria-hidden='true'].slideInFromLeft{transform:translateX(-100%)}.menu[aria-hidden='true'].slideInFromRight{transform:translateX(100%)}.container{display:flex;flex-direction:column;position:relative;text-align:left;width:100%;height:100%;color:var(--vm-menu-color);background:var(--vm-menu-bg);font-size:var(--vm-menu-font-size);font-weight:var(--vm-menu-font-weight)}.menu:focus{outline:0}";

var __awaiter$c = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const Menu = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.vmOpen = createEvent(this, "vmOpen", 7);
    this.vmClose = createEvent(this, "vmClose", 7);
    this.vmFocus = createEvent(this, "vmFocus", 7);
    this.vmBlur = createEvent(this, "vmBlur", 7);
    this.vmActiveSubmenuChange = createEvent(this, "vmActiveSubmenuChange", 7);
    this.vmActiveMenuItemChange = createEvent(this, "vmActiveMenuItemChange", 7);
    this.vmMenuHeightChange = createEvent(this, "vmMenuHeightChange", 3);
    this.hasDisconnected = false;
    /**
     * Whether the menu is open/visible.
     */
    this.active = false;
    withComponentRegistry(this);
  }
  onActiveMenuitemChange() {
    this.vmActiveMenuItemChange.emit(this.activeMenuItem);
  }
  onActiveSubmenuChange() {
    this.vmActiveSubmenuChange.emit(this.activeSubmenu);
  }
  onActiveChange() {
    var _a;
    if (this.hasDisconnected)
      return;
    this.active ? this.vmOpen.emit(this.host) : this.vmClose.emit(this.host);
    if (((_a = this.controller) === null || _a === void 0 ? void 0 : _a.tagName.toLowerCase()) === 'vm-menu-item') {
      this.controller.expanded = true;
    }
  }
  connectedCallback() {
    this.hasDisconnected = false;
  }
  componentDidRender() {
    writeTask(() => {
      if (!this.hasDisconnected)
        this.calculateHeight();
    });
  }
  disconnectedCallback() {
    this.controller = undefined;
    this.hasDisconnected = true;
  }
  /**
   * Focuses the menu.
   */
  focusMenu() {
    var _a;
    return __awaiter$c(this, void 0, void 0, function* () {
      (_a = this.menu) === null || _a === void 0 ? void 0 : _a.focus();
    });
  }
  /**
   * Removes focus from the menu.
   */
  blurMenu() {
    var _a;
    return __awaiter$c(this, void 0, void 0, function* () {
      (_a = this.menu) === null || _a === void 0 ? void 0 : _a.blur();
    });
  }
  /**
   * Returns the currently focused menu item.
   */
  getActiveMenuItem() {
    return __awaiter$c(this, void 0, void 0, function* () {
      return this.activeMenuItem;
    });
  }
  /**
   * Sets the currently focused menu item.
   */
  setActiveMenuItem(item) {
    return __awaiter$c(this, void 0, void 0, function* () {
      item === null || item === void 0 ? void 0 : item.focusItem();
      this.activeMenuItem = item;
    });
  }
  /**
   * Calculates the height of the settings menu based on its children.
   */
  calculateHeight() {
    var _a, _b;
    return __awaiter$c(this, void 0, void 0, function* () {
      let height = 0;
      if (this.activeSubmenu) {
        const submenu = yield this.activeSubmenu.getMenu();
        height = (_a = (yield (submenu === null || submenu === void 0 ? void 0 : submenu.calculateHeight()))) !== null && _a !== void 0 ? _a : 0;
        height += yield this.activeSubmenu.getControllerHeight();
      }
      else {
        const children = ((_b = this.container) === null || _b === void 0 ? void 0 : _b.firstChild).assignedElements({ flatten: true });
        children === null || children === void 0 ? void 0 : children.forEach(child => {
          height += parseFloat(window.getComputedStyle(child).height);
        });
      }
      this.vmMenuHeightChange.emit(height);
      return height;
    });
  }
  onOpenSubmenu(event) {
    event.stopPropagation();
    if (!isUndefined(this.activeSubmenu))
      this.activeSubmenu.active = false;
    this.activeSubmenu = event.detail;
    this.getChildren().forEach(child => {
      if (child !== this.activeSubmenu) {
        child.style.opacity = '0';
        child.style.visibility = 'hidden';
      }
    });
    writeTask(() => {
      this.activeSubmenu.active = true;
    });
  }
  onCloseSubmenu(event) {
    event === null || event === void 0 ? void 0 : event.stopPropagation();
    if (!isUndefined(this.activeSubmenu))
      this.activeSubmenu.active = false;
    this.getChildren().forEach(child => {
      if (child !== this.activeSubmenu) {
        child.style.opacity = '';
        child.style.visibility = '';
      }
    });
    writeTask(() => {
      this.activeSubmenu = undefined;
    });
  }
  onWindowClick() {
    this.onCloseSubmenu();
    this.onClose();
  }
  onWindowKeyDown(event) {
    if (this.active && event.key === 'Escape') {
      this.onCloseSubmenu();
      this.onClose();
      this.focusController();
    }
  }
  getChildren() {
    var _a;
    const assignedElements = (_a = this.host
      .shadowRoot.querySelector('slot')) === null || _a === void 0 ? void 0 : _a.assignedElements({ flatten: true });
    return (assignedElements !== null && assignedElements !== void 0 ? assignedElements : []);
  }
  getMenuItems() {
    var _a;
    const assignedElements = (_a = this.host
      .shadowRoot.querySelector('slot')) === null || _a === void 0 ? void 0 : _a.assignedElements({ flatten: true });
    return menuItemHunter(assignedElements);
  }
  focusController() {
    var _a, _b, _c, _d, _e;
    if (!isUndefined((_a = this.controller) === null || _a === void 0 ? void 0 : _a.focusItem)) {
      (_b = this.controller) === null || _b === void 0 ? void 0 : _b.focusItem();
    }
    else if (!isUndefined((_c = this.controller) === null || _c === void 0 ? void 0 : _c.focusControl)) {
      (_d = this.controller) === null || _d === void 0 ? void 0 : _d.focusControl();
    }
    else {
      (_e = this.controller) === null || _e === void 0 ? void 0 : _e.focus();
    }
  }
  triggerMenuItem() {
    var _a;
    if (isUndefined(this.activeMenuItem))
      return;
    this.activeMenuItem.click();
    // If it controls a menu then focus it essentially opening it.
    (_a = this.activeMenuItem.menu) === null || _a === void 0 ? void 0 : _a.focusMenu();
  }
  onClose() {
    this.activeMenuItem = undefined;
    this.active = false;
  }
  onClick(event) {
    // Stop the event from propagating while playing with menu so that when it is clicked outside
    // the menu we can close it in the `onWindowClick` handler above.
    event.stopPropagation();
  }
  onFocus() {
    var _a;
    this.active = true;
    [this.activeMenuItem] = this.getMenuItems();
    (_a = this.activeMenuItem) === null || _a === void 0 ? void 0 : _a.focusItem();
    this.vmFocus.emit();
  }
  onBlur() {
    this.vmBlur.emit();
  }
  foucsMenuItem(items, index) {
    if (index < 0)
      index = items.length - 1;
    if (index > items.length - 1)
      index = 0;
    this.activeMenuItem = items[index];
    this.activeMenuItem.focusItem();
  }
  onKeyDown(event) {
    if (!this.active)
      return;
    event.preventDefault();
    event.stopPropagation();
    const items = this.getMenuItems();
    let index = items.findIndex(item => item === this.activeMenuItem);
    switch (event.key) {
      case 'Escape':
        this.onClose();
        this.focusController();
        break;
      case 'ArrowDown':
      case 'Tab':
        this.foucsMenuItem(items, (index += 1));
        break;
      case 'ArrowUp':
        this.foucsMenuItem(items, (index -= 1));
        break;
      case 'ArrowLeft':
        this.onClose();
        this.focusController();
        break;
      case 'ArrowRight':
      case 'Enter':
      case ' ':
        this.triggerMenuItem();
        break;
      case 'Home':
      case 'PageUp':
        this.foucsMenuItem(items, 0);
        break;
      case 'End':
      case 'PageDown':
        this.foucsMenuItem(items, items.length - 1);
        break;
    }
  }
  render() {
    var _a, _b, _c;
    return (h("div", { id: this.identifier, class: {
        menu: true,
        slideIn: !isUndefined(this.slideInDirection),
        slideInFromLeft: this.slideInDirection === 'left',
        slideInFromRight: this.slideInDirection === 'right',
      }, role: "menu", tabindex: "-1", "aria-labelledby": (_b = (_a = this.controller) === null || _a === void 0 ? void 0 : _a.identifier) !== null && _b !== void 0 ? _b : (_c = this.controller) === null || _c === void 0 ? void 0 : _c.id, "aria-hidden": !this.active ? 'true' : 'false', onFocus: this.onFocus.bind(this), onBlur: this.onBlur.bind(this), onClick: this.onClick.bind(this), onKeyDown: this.onKeyDown.bind(this), ref: el => {
        this.menu = el;
      } }, h("div", { class: "container", ref: el => {
        this.container = el;
      } }, h("slot", null))));
  }
  get host() { return this; }
  static get watchers() { return {
    "activeMenuItem": ["onActiveMenuitemChange"],
    "activeSubmenu": ["onActiveSubmenuChange"],
    "active": ["onActiveChange"]
  }; }
  static get style() { return menuCss; }
};

const menuItemCss = ":host{display:block}.menuItem{display:flex;position:relative;align-items:center;flex-direction:row;cursor:pointer;color:var(--vm-menu-color);background:var(--vm-menu-bg);font-size:var(--vm-menu-font-size);font-weight:var(--vm-menu-font-weight);padding:var(--vm-menu-item-padding);touch-action:manipulation;box-sizing:border-box}.menuItem:focus{outline:0}.menuItem.hidden{display:none}.menuItem.tapHighlight{background:var(--vm-menu-item-tap-highlight)}.menuItem.showDivider{border-bottom:0.5px solid var(--vm-menu-item-divider-color)}.menuItem.notTouch:hover,.menuItem.notTouch:focus{outline:0;color:var(--vm-menu-item-focus-color);background-color:var(--vm-menu-item-focus-bg)}.menuItem[aria-expanded='true']{position:absolute;z-index:2;top:0;width:100%}.menuItem[aria-hidden='true']{display:none}.menuItem[aria-checked='true'] vm-icon{opacity:1;visibility:visible}vm-icon{display:inline-block}vm-icon{fill:currentColor;pointer-events:none;font-size:var(--vm-menu-item-check-icon-size);margin-right:10px;opacity:0;visibility:hidden;transition:var(--vm-fade-transition)}.hint{display:inline-block;margin-left:auto;overflow:hidden;pointer-events:none;margin-right:6px;font-size:var(--vm-menu-item-hint-font-size);opacity:var(--vm-menu-item-hint-opacity);color:var(--vm-menu-item-hint-color)}.badge{display:inline-block;line-height:1;overflow:hidden;pointer-events:none;margin-left:6px;color:var(--vm-menu-item-badge-color);background:var(--vm-menu-item-badge-bg);font-size:var(--vm-menu-item-badge-font-size)}.spacer{flex:1}.arrow{color:var(--vm-menu-item-arrow-color);border:2px solid;padding:2px;display:inline-block;border-width:0 2px 2px 0}.arrow.left{margin-right:6px;transform:rotate(135deg)}.arrow.right{transform:rotate(-45deg);opacity:0.38}";

var __awaiter$b = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const MenuItem = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.vmFocus = createEvent(this, "vmFocus", 7);
    this.vmBlur = createEvent(this, "vmBlur", 7);
    this.showTapHighlight = false;
    /**
     * Whether the item is displayed or not.
     */
    this.hidden = false;
    /**
     * The name of the checkmark icon to resolve from the icon library.
     */
    this.checkIcon = 'check';
    /** @internal */
    this.isTouch = false;
    withComponentRegistry(this);
    withPlayerContext(this, ['isTouch']);
  }
  /**
   * Focuses the menu item.
   */
  focusItem() {
    var _a;
    return __awaiter$b(this, void 0, void 0, function* () {
      (_a = this.menuItem) === null || _a === void 0 ? void 0 : _a.focus();
    });
  }
  /**
   * Removes focus from the menu item.
   */
  blurItem() {
    var _a;
    return __awaiter$b(this, void 0, void 0, function* () {
      (_a = this.menuItem) === null || _a === void 0 ? void 0 : _a.blur();
    });
  }
  /**
   * Returns the height of the menu item.
   */
  getHeight() {
    return __awaiter$b(this, void 0, void 0, function* () {
      return parseFloat(this.menuItem ? window.getComputedStyle(this.menuItem).height : '0');
    });
  }
  onClick() {
    if (!isNil(this.menu))
      this.menu.active = !this.expanded;
  }
  onFocus() {
    this.vmFocus.emit();
  }
  onBlur() {
    this.vmBlur.emit();
  }
  onTouchStart() {
    this.showTapHighlight = true;
  }
  onTouchEnd() {
    setTimeout(() => {
      this.showTapHighlight = false;
    }, 100);
  }
  onMouseLeave() {
    var _a;
    (_a = this.menuItem) === null || _a === void 0 ? void 0 : _a.blur();
  }
  render() {
    var _a, _b, _c, _d;
    const isCheckedDefined = !isUndefined(this.checked);
    const isMenuDefined = !isUndefined(this.menu);
    const hasExpanded = this.expanded ? 'true' : 'false';
    const isChecked = this.checked ? 'true' : 'false';
    const showCheckedIcon = isCheckedDefined && !isUndefined(this.checkIcon);
    const showLeftNavArrow = isMenuDefined && this.expanded;
    const showRightNavArrow = isMenuDefined && !this.expanded;
    const showHint = !isUndefined(this.hint) &&
      !isCheckedDefined &&
      (!isMenuDefined || !this.expanded);
    const showBadge = !isUndefined(this.badge) && !showHint && !showRightNavArrow;
    const hasSpacer = showHint || showRightNavArrow;
    return (h("div", { class: {
        menuItem: true,
        notTouch: !this.isTouch,
        tapHighlight: this.showTapHighlight,
        showDivider: isMenuDefined && ((_a = this.expanded) !== null && _a !== void 0 ? _a : false),
      }, id: this.identifier, role: isCheckedDefined ? 'menuitemradio' : 'menuitem', tabindex: "0", "aria-label": this.label, "aria-hidden": this.hidden ? 'true' : 'false', "aria-haspopup": isMenuDefined ? 'true' : undefined, "aria-controls": (_c = (_b = this.menu) === null || _b === void 0 ? void 0 : _b.identifier) !== null && _c !== void 0 ? _c : (_d = this.menu) === null || _d === void 0 ? void 0 : _d.id, "aria-expanded": isMenuDefined ? hasExpanded : undefined, "aria-checked": isCheckedDefined ? isChecked : undefined, onClick: this.onClick.bind(this), onFocus: this.onFocus.bind(this), onBlur: this.onBlur.bind(this), onTouchStart: this.onTouchStart.bind(this), onTouchEnd: this.onTouchEnd.bind(this), onMouseLeave: this.onMouseLeave.bind(this), ref: el => {
        this.menuItem = el;
      } }, showCheckedIcon && (h("vm-icon", { name: this.checkIcon, library: this.icons })), showLeftNavArrow && h("span", { class: "arrow left" }), this.label, hasSpacer && h("span", { class: "spacer" }), showHint && h("span", { class: "hint" }, this.hint), showBadge && h("span", { class: "badge" }, this.badge), showRightNavArrow && h("span", { class: "arrow right" })));
  }
  get host() { return this; }
  static get style() { return menuItemCss; }
};

const MenuRadio = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.vmCheck = createEvent(this, "vmCheck", 7);
    /**
     * Whether the radio item is selected or not.
     */
    this.checked = false;
    /**
     * The URL to an SVG element or fragment to load.
     */
    this.checkIcon = 'check';
    withComponentRegistry(this);
  }
  onClick() {
    this.checked = true;
    this.vmCheck.emit();
  }
  render() {
    return (h("vm-menu-item", { label: this.label, checked: this.checked, badge: this.badge, checkIcon: this.checkIcon, icons: this.icons, onClick: this.onClick.bind(this) }));
  }
};

const MenuRadioGroup = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.vmCheck = createEvent(this, "vmCheck", 7);
    withComponentRegistry(this);
  }
  onValueChange() {
    var _a;
    (_a = this.findRadios()) === null || _a === void 0 ? void 0 : _a.forEach(radio => {
      radio.checked = radio.value === this.value;
    });
  }
  connectedCallback() {
    this.onValueChange();
  }
  componentDidLoad() {
    this.onValueChange();
  }
  onSelectionChange(event) {
    const radio = event.target;
    this.value = radio.value;
  }
  findRadios() {
    var _a;
    return (_a = this.host
      .shadowRoot.querySelector('slot')) === null || _a === void 0 ? void 0 : _a.assignedElements();
  }
  render() {
    return h("slot", null);
  }
  get host() { return this; }
  static get watchers() { return {
    "value": ["onValueChange"]
  }; }
};

const MuteControl = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
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

var __awaiter$a = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const PiPControl = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
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
    return __awaiter$a(this, void 0, void 0, function* () {
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
  static get style() { return pipControlCss; }
};

const PlaybackControl = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
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

class Logger {
  constructor() {
    this.silent = false;
  }
  log(...args) {
    if (!this.silent && !isUndefined(console))
      console.log('[Vime tip]:', ...args);
  }
  warn(...args) {
    if (!this.silent && !isUndefined(console))
      console.error('[Vime warn]:', ...args);
  }
}

const players = new Set();
function withAutopause(player) {
  const el = getElement(player);
  createStencilHook(player, () => {
    players.add(el);
  }, () => {
    players.delete(el);
  });
}
function autopause(player) {
  const el = getElement(player);
  players.forEach(p => {
    if (p !== el && p.autopause)
      p.paused = true;
  });
}

/* eslint-disable func-names */
function withPlayerEvents(player) {
  const el = getElement(player);
  const cache = new Map();
  function initCache() {
    Object.keys(initialState).forEach(prop => {
      cache.set(prop, player[prop]);
    });
  }
  createStencilHook(player, () => {
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
        firePlayerEvent(el, prop, newValue, oldValue);
        cache.set(prop, newValue);
      }
    }
  };
}

var __awaiter$9 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
  const el = getElement(player);
  const disposal = new Disposal();
  const cache = new Map();
  function initCache() {
    Object.keys(initialState).forEach(prop => {
      cache.set(prop, player[prop]);
    });
  }
  // Queue of adapter calls to be run when the media is ready for playback.
  let adapterCalls = [];
  function flushAdapterCalls() {
    return __awaiter$9(this, void 0, void 0, function* () {
      const adapter = yield player.adapter;
      if (isUndefined(adapter))
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
    writeTask(() => {
      Object.keys(initialState)
        .filter(shouldPropResetOnMediaChange)
        .forEach(prop => {
        player[prop] = initialState[prop];
      });
    });
  }
  function onStateChange(event) {
    var _a;
    return __awaiter$9(this, void 0, void 0, function* () {
      event.stopImmediatePropagation();
      const { by, prop, value } = event.detail;
      if (!isWritableProp(prop)) {
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
      writeTask(() => {
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
  createStencilHook(player, () => {
    initCache();
    disposal.add(listen(el, LOAD_START_EVENT, onMediaChange));
    disposal.add(listen(el, STATE_CHANGE_EVENT, onStateChange));
  }, () => {
    cache.clear();
    disposal.empty();
  });
  wrapStencilHook(player, 'componentWillRender', () => __awaiter$9(this, void 0, void 0, function* () {
    if (player.playbackReady && adapterCalls.length > 0)
      yield flushAdapterCalls();
  }));
  function isAdapterCallRequired(prop, value) {
    var _a;
    return value !== ((_a = player[PROVIDER_CACHE_KEY]) === null || _a === void 0 ? void 0 : _a.get(prop));
  }
  return function safeAdapterCall(prop, method) {
    return __awaiter$9(this, void 0, void 0, function* () {
      if (!isAdapterCallRequired(prop, player[prop]))
        return;
      const value = player[prop];
      const safeCall = (adapter) => __awaiter$9(this, void 0, void 0, function* () {
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

var __awaiter$8 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
let idCount$3 = 0;
const Player = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.vmThemeChange = createEvent(this, "vmThemeChange", 7);
    this.vmPausedChange = createEvent(this, "vmPausedChange", 7);
    this.vmPlay = createEvent(this, "vmPlay", 7);
    this.vmPlayingChange = createEvent(this, "vmPlayingChange", 7);
    this.vmSeekingChange = createEvent(this, "vmSeekingChange", 7);
    this.vmSeeked = createEvent(this, "vmSeeked", 7);
    this.vmBufferingChange = createEvent(this, "vmBufferingChange", 7);
    this.vmDurationChange = createEvent(this, "vmDurationChange", 7);
    this.vmCurrentTimeChange = createEvent(this, "vmCurrentTimeChange", 7);
    this.vmReady = createEvent(this, "vmReady", 7);
    this.vmPlaybackReady = createEvent(this, "vmPlaybackReady", 7);
    this.vmPlaybackStarted = createEvent(this, "vmPlaybackStarted", 7);
    this.vmPlaybackEnded = createEvent(this, "vmPlaybackEnded", 7);
    this.vmBufferedChange = createEvent(this, "vmBufferedChange", 7);
    this.vmError = createEvent(this, "vmError", 7);
    this.vmLoadStart = createEvent(this, "vmLoadStart", 7);
    this.vmCurrentProviderChange = createEvent(this, "vmCurrentProviderChange", 7);
    this.vmCurrentSrcChange = createEvent(this, "vmCurrentSrcChange", 7);
    this.vmCurrentPosterChange = createEvent(this, "vmCurrentPosterChange", 7);
    this.vmMediaTitleChange = createEvent(this, "vmMediaTitleChange", 7);
    this.vmControlsChange = createEvent(this, "vmControlsChange", 7);
    this.vmPlaybackRateChange = createEvent(this, "vmPlaybackRateChange", 7);
    this.vmPlaybackRatesChange = createEvent(this, "vmPlaybackRatesChange", 7);
    this.vmPlaybackQualityChange = createEvent(this, "vmPlaybackQualityChange", 7);
    this.vmPlaybackQualitiesChange = createEvent(this, "vmPlaybackQualitiesChange", 7);
    this.vmMutedChange = createEvent(this, "vmMutedChange", 7);
    this.vmVolumeChange = createEvent(this, "vmVolumeChange", 7);
    this.vmViewTypeChange = createEvent(this, "vmViewTypeChange", 7);
    this.vmMediaTypeChange = createEvent(this, "vmMediaTypeChange", 7);
    this.vmLiveChange = createEvent(this, "vmLiveChange", 7);
    this.vmTouchChange = createEvent(this, "vmTouchChange", 7);
    this.vmLanguageChange = createEvent(this, "vmLanguageChange", 7);
    this.vmI18nChange = createEvent(this, "vmI18nChange", 7);
    this.vmTranslationsChange = createEvent(this, "vmTranslationsChange", 7);
    this.vmLanguagesChange = createEvent(this, "vmLanguagesChange", 7);
    this.vmFullscreenChange = createEvent(this, "vmFullscreenChange", 7);
    this.vmPiPChange = createEvent(this, "vmPiPChange", 7);
    this.vmTextTracksChange = createEvent(this, "vmTextTracksChange", 7);
    this.vmCurrentTextTrackChange = createEvent(this, "vmCurrentTextTrackChange", 7);
    this.vmTextTrackVisibleChange = createEvent(this, "vmTextTrackVisibleChange", 7);
    this.vmAudioTracksChange = createEvent(this, "vmAudioTracksChange", 7);
    this.vmCurrentAudioTrackChange = createEvent(this, "vmCurrentAudioTrackChange", 7);
    this.disposal = new Disposal();
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
    this.translations = { en };
    /** @inheritDoc @readonly */
    this.languages = ['en'];
    /** @inheritDoc @readonly */
    this.i18n = en;
    withFindPlayer(this);
    withComponentRegistrar(this);
    withAutopause(this);
    withProviderHost(this);
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
    if (isUndefined(this.container))
      return;
    this.fullscreenController = new FullscreenController(this.container);
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
    return __awaiter$8(this, void 0, void 0, function* () {
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
    return __awaiter$8(this, void 0, void 0, function* () {
      if (isUndefined(newQuality) || newQuality === this.lastQualityCheck)
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
    return __awaiter$8(this, void 0, void 0, function* () {
      this.volume = Math.max(0, Math.min(this.volume, 100));
      this.safeAdapterCall('volume', 'setVolume');
    });
  }
  onViewTypeChange() {
    this.isAudioView = this.viewType === ViewType.Audio;
    this.isVideoView = this.viewType === ViewType.Video;
  }
  onMediaTypeChange() {
    this.isAudio = this.mediaType === MediaType.Audio;
    this.isVideo = this.mediaType === MediaType.Video;
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
    Object.assign(this.translations, { en });
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
    return __awaiter$8(this, void 0, void 0, function* () {
      return this.provider;
    });
  }
  /** @internal */
  getAdapter() {
    return __awaiter$8(this, void 0, void 0, function* () {
      return this.adapter;
    });
  }
  /** @inheritDoc */
  play() {
    var _a;
    return __awaiter$8(this, void 0, void 0, function* () {
      return (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.play();
    });
  }
  /** @inheritDoc */
  pause() {
    var _a;
    return __awaiter$8(this, void 0, void 0, function* () {
      return (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.pause();
    });
  }
  /** @inheritDoc */
  canPlay(type) {
    var _a, _b;
    return __awaiter$8(this, void 0, void 0, function* () {
      return (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.canPlay(type)) !== null && _b !== void 0 ? _b : false;
    });
  }
  /** @inheritDoc */
  canAutoplay() {
    return __awaiter$8(this, void 0, void 0, function* () {
      return canAutoplay();
    });
  }
  /** @inheritDoc */
  canMutedAutoplay() {
    return __awaiter$8(this, void 0, void 0, function* () {
      return canAutoplay(true);
    });
  }
  /** @inheritDoc */
  canSetPlaybackRate() {
    var _a, _b, _c;
    return __awaiter$8(this, void 0, void 0, function* () {
      return (_c = (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.canSetPlaybackRate) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : false;
    });
  }
  /** @inheritDoc */
  canSetPlaybackQuality() {
    var _a, _b, _c;
    return __awaiter$8(this, void 0, void 0, function* () {
      return (_c = (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.canSetPlaybackQuality) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : false;
    });
  }
  /** @inheritDoc */
  canSetFullscreen() {
    var _a, _b, _c;
    return __awaiter$8(this, void 0, void 0, function* () {
      return (this.fullscreenController.isSupported ||
        ((_c = (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.canSetFullscreen) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : false));
    });
  }
  /** @inheritDoc */
  enterFullscreen(options) {
    var _a, _b, _c;
    return __awaiter$8(this, void 0, void 0, function* () {
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
    return __awaiter$8(this, void 0, void 0, function* () {
      if (this.fullscreenController.isSupported) {
        return this.fullscreenController.exitFullscreen();
      }
      return (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.exitFullscreen) === null || _b === void 0 ? void 0 : _b.call(_a);
    });
  }
  /** @inheritDoc */
  canSetPiP() {
    var _a, _b, _c;
    return __awaiter$8(this, void 0, void 0, function* () {
      return (_c = (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.canSetPiP) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : false;
    });
  }
  /** @inheritDoc */
  enterPiP() {
    var _a, _b;
    return __awaiter$8(this, void 0, void 0, function* () {
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
    return __awaiter$8(this, void 0, void 0, function* () {
      return (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.exitPiP) === null || _b === void 0 ? void 0 : _b.call(_a);
    });
  }
  /** @inheritDoc */
  canSetAudioTrack() {
    var _a;
    return __awaiter$8(this, void 0, void 0, function* () {
      return !isUndefined((_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.setCurrentAudioTrack);
    });
  }
  /** @inheritDoc */
  setCurrentAudioTrack(trackId) {
    var _a, _b;
    return __awaiter$8(this, void 0, void 0, function* () {
      (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.setCurrentAudioTrack) === null || _b === void 0 ? void 0 : _b.call(_a, trackId);
    });
  }
  /** @inheritDoc */
  canSetTextTrack() {
    var _a;
    return __awaiter$8(this, void 0, void 0, function* () {
      return !isUndefined((_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.setCurrentTextTrack);
    });
  }
  /** @inheritDoc */
  setCurrentTextTrack(trackId) {
    var _a, _b;
    return __awaiter$8(this, void 0, void 0, function* () {
      (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.setCurrentTextTrack) === null || _b === void 0 ? void 0 : _b.call(_a, trackId);
    });
  }
  /** @inheritDoc */
  canSetTextTrackVisibility() {
    var _a;
    return __awaiter$8(this, void 0, void 0, function* () {
      return !isUndefined((_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.setTextTrackVisibility);
    });
  }
  /** @inheritDoc */
  setTextTrackVisibility(isVisible) {
    var _a, _b;
    return __awaiter$8(this, void 0, void 0, function* () {
      (_b = (_a = (yield this.adapter)) === null || _a === void 0 ? void 0 : _a.setTextTrackVisibility) === null || _b === void 0 ? void 0 : _b.call(_a, isVisible);
    });
  }
  /** @inheritDoc */
  extendLanguage(language, translation) {
    var _a;
    return __awaiter$8(this, void 0, void 0, function* () {
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
    this.onLanguageChange(this.language, initialState.language);
    this.disposal.add(onMobileChange(isMobile => {
      this.isMobile = isMobile;
    }));
    this.disposal.add(onTouchInputChange(isTouch => {
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
    return __awaiter$8(this, void 0, void 0, function* () {
      if (!this.isMobile || !canRotateScreen())
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
    const props = Object.keys(initialState);
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
    return __awaiter$8(this, void 0, void 0, function* () {
      return this.container;
    });
  }
  /** @internal Exposed for E2E testing. */
  callAdapter(method, value) {
    return __awaiter$8(this, void 0, void 0, function* () {
      return (yield this.adapter)[method](value);
    });
  }
  hasCustomControls() {
    return isComponentRegistered(this, 'vm-controls');
  }
  genId() {
    var _a;
    const id = (_a = this.host) === null || _a === void 0 ? void 0 : _a.id;
    if (isString(id) && id.length > 0)
      return id;
    idCount$3 += 1;
    return `vm-player-${idCount$3}`;
  }
  render() {
    const label = `${this.isAudioView ? 'Audio Player' : 'Video Player'}` +
      `${!isUndefined(this.mediaTitle) ? ` - ${this.mediaTitle}` : ''}`;
    const canShowCustomUI = !IS_IOS ||
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
    return (h(Host, { id: this.genId(), idle: isIdle, mobile: this.isMobile, touch: this.isTouch, live: this.isLive, audio: this.isAudioView, video: this.isVideoView, pip: this.isPiPActive, fullscreen: this.isFullscreenActive }, h("div", { "aria-label": label, "aria-hidden": !this.ready ? 'true' : 'false', "aria-busy": !this.playbackReady ? 'true' : 'false', class: {
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
        writeTask(() => {
          this.container = el;
        });
      } }, isBlockerVisible && h("div", { class: "blocker" }), h(Universe.Provider, { state: this.getPlayerState() }, h("slot", null)))));
  }
  get host() { return this; }
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
  static get style() { return playerCss; }
};

const posterCss = ":host{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:var(--vm-poster-z-index)}.poster{width:100%;height:100%;background:#000;opacity:0;visibility:hidden;pointer-events:none;transition:var(--vm-fade-transition)}.poster.hidden{display:none}.poster.active{opacity:1;visibility:visible}img{width:100%;height:100%;pointer-events:none}";

const Poster = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.vmLoaded = createEvent(this, "vmLoaded", 3);
    this.vmWillShow = createEvent(this, "vmWillShow", 3);
    this.vmWillHide = createEvent(this, "vmWillHide", 3);
    this.isHidden = true;
    this.isActive = false;
    this.hasLoaded = false;
    /**
     * How the poster image should be resized to fit the container (sets the `object-fit` property).
     */
    this.fit = 'cover';
    /** @internal */
    this.isVideoView = false;
    /** @internal */
    this.playbackStarted = false;
    /** @internal */
    this.currentTime = 0;
    withComponentRegistry(this);
    withPlayerContext(this, [
      'mediaTitle',
      'currentPoster',
      'playbackStarted',
      'currentTime',
      'isVideoView',
    ]);
  }
  onCurrentPosterChange() {
    var _a;
    this.hasLoaded = false;
    (_a = this.lazyLoader) === null || _a === void 0 ? void 0 : _a.onMutation();
  }
  connectedCallback() {
    this.lazyLoader = new LazyLoader(this.host, ['data-src', 'src'], el => {
      const src = el.getAttribute('data-src');
      el.removeAttribute('src');
      if (!isNull(src)) {
        el.setAttribute('src', src);
      }
    });
    this.onEnabledChange();
    this.onActiveChange();
  }
  disconnectedCallback() {
    this.lazyLoader.destroy();
  }
  onVisibilityChange() {
    !this.isHidden && this.isActive
      ? this.vmWillShow.emit()
      : this.vmWillHide.emit();
  }
  onEnabledChange() {
    this.isHidden = !this.isVideoView;
    this.onVisibilityChange();
  }
  onActiveChange() {
    this.isActive = !this.playbackStarted || this.currentTime <= 0.1;
    this.onVisibilityChange();
  }
  onPosterLoad() {
    this.vmLoaded.emit();
    this.hasLoaded = true;
  }
  render() {
    return (h("div", { class: {
        poster: true,
        hidden: this.isHidden,
        active: this.isActive && this.hasLoaded,
      } }, h("img", { class: "lazy", "data-src": this.currentPoster, alt: !isUndefined(this.mediaTitle)
        ? `${this.mediaTitle} Poster`
        : 'Media Poster', style: { objectFit: this.fit }, onLoad: this.onPosterLoad.bind(this) })));
  }
  get host() { return this; }
  static get watchers() { return {
    "currentPoster": ["onCurrentPosterChange"],
    "isVideoView": ["onEnabledChange"],
    "currentTime": ["onActiveChange"],
    "playbackStarted": ["onActiveChange"]
  }; }
  static get style() { return posterCss; }
};

const scrimCss = ":host{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:var(--vm-scrim-z-index)}.scrim{position:absolute;width:100%;background:var(--vm-scrim-bg);display:inline-block;opacity:0;visibility:hidden;transition:var(--vm-fade-transition)}.scrim.gradient{height:258px;background:none;background-position:bottom;background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAECCAYAAAA/9r2TAAABKklEQVQ4T2XI50cFABiF8dvee++67b33uM17b1MkkSSSSBJJJIkkkkQSSSKJ9Efmeb8cr86HH88JBP4thkfEkiKOFPGkSCCNRE8SKZJJkUIaqZ40UqSTIoMUmaSR5ckmRQ4pckkjz5NPigJSFJKiiDSKPSWkKCVFGWmUeypIUUmKKlJUk0aNJ0iKWlLUkUa9p4EUjaRoIkUzabR4WknRRop20ujwdJKiixTdpOghjV5PHyn6STFAGoOeIVIMk2KEFKOkMeYZJ8UEKUKkMemZIsU0KWZIMUsac54wKSKkiJLGvGeBFIukWCLFMrkCq7AG67ABm7AF27ADu7AH+3AAh3AEx3ACp3AG53ABl3AF13ADt3AH9/AAj/AEz/ACr/AG7/ABn/AF3/ADv39LujSyJPVJ0QAAAABJRU5ErkJggg==')}.scrim.gradientUp{top:unset;bottom:0}.scrim.gradientDown{transform:rotate(180deg)}.scrim.hidden{display:none}.scrim.active{opacity:1;visibility:visible}";

const Scrim = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
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
  static get style() { return scrimCss; }
};

const getHours = (value) => Math.trunc((value / 60 / 60) % 60);
const getMinutes = (value) => Math.trunc((value / 60) % 60);
const getSeconds = (value) => Math.trunc(value % 60);
const formatTime = (seconds = 0, alwaysShowHours = false) => {
  // Format time component to add leading zero.
  const format = (value) => `0${value}`.slice(-2);
  const hours = getHours(seconds);
  const mins = getMinutes(seconds);
  const secs = getSeconds(seconds);
  return `${alwaysShowHours || hours > 0 ? `${hours}:` : ''}${format(mins)}:${format(secs)}`;
};

const scrubberControlCss = ":host{--vm-tooltip-spacing:var(--vm-scrubber-tooltip-spacing);flex:1;position:relative;cursor:pointer;pointer-events:auto;box-sizing:border-box;left:calc(var(--vm-slider-thumb-width) / 2);margin-right:var(--vm-slider-thumb-width);margin-bottom:var(--vm-slider-track-height)}@keyframes progress{to{background-position:var(--vm-scrubber-loading-stripe-size) 0}}.scrubber{position:relative;width:100%}vm-slider,progress{margin-left:calc(calc(var(--vm-slider-thumb-width) / 2) * -1);margin-right:calc(calc(var(--vm-slider-thumb-width) / 2) * -1);width:calc(100% + var(--vm-slider-thumb-width));height:var(--vm-slider-track-height)}vm-slider:hover,progress:hover{cursor:pointer}vm-slider{position:absolute;top:0;left:0;z-index:3}progress{-webkit-appearance:none;background:transparent;border:0;border-radius:100px;position:absolute;left:0;top:50%;padding:0;color:var(--vm-scrubber-buffered-bg);height:var(--vm-slider-track-height)}progress::-webkit-progress-bar{background:transparent}progress::-webkit-progress-value{background:currentColor;border-radius:100px;min-width:var(--vm-slider-track-height);transition:width 0.2s ease}progress::-moz-progress-bar{background:currentColor;border-radius:100px;min-width:var(--vm-slider-track-height);transition:width 0.2s ease}progress::-ms-fill{border-radius:100px;transition:width 0.2s ease}progress.loading{animation:progress 1s linear infinite;background-image:linear-gradient(\n    -45deg,\n    var(--vm-scrubber-loading-stripe-color) 25%,\n    transparent 25%,\n    transparent 50%,\n    var(--vm-scrubber-loading-stripe-color) 50%,\n    var(--vm-scrubber-loading-stripe-color) 75%,\n    transparent 75%,\n    transparent\n  );background-repeat:repeat-x;background-size:var(--vm-scrubber-loading-stripe-size)\n    var(--vm-scrubber-loading-stripe-size);color:transparent;background-color:transparent}";

var __awaiter$7 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const ScrubberControl = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
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
    return __awaiter$7(this, void 0, void 0, function* () {
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
  get host() { return this; }
  static get watchers() { return {
    "noKeyboard": ["onNoKeyboardChange"],
    "duration": ["onDurationChange"]
  }; }
  static get style() { return scrubberControlCss; }
};

const settingsCss = ":host{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:var(--vm-menu-z-index)}.settings{position:absolute;opacity:0;pointer-events:none;overflow-x:hidden;overflow-y:auto;background-color:var(--vm-menu-bg);max-height:var(--vm-settings-max-height);border-radius:var(--vm-settings-border-radius);padding:var(--vm-settings-padding);box-shadow:var(--vm-settings-shadow);box-sizing:border-box;scrollbar-width:thin;scroll-behavior:smooth;scrollbar-color:var(--vm-settings-scroll-thumb-color)\n    var(--vm-settings-scroll-track-color);transform:translateY(8px);transition:var(--vm-settings-transition)}.container{display:block;width:var(--vm-settings-width);height:100%;position:relative;transition:width 0.25s ease-in, height 0.25s ease-in}.settings.hydrated{visibility:hidden !important}.settings::-webkit-scrollbar{width:var(--vm-settings-scroll-width)}.settings::-webkit-scrollbar-track{background:var(--vm-settings-scroll-track-color)}.settings::-webkit-scrollbar-thumb{border-radius:var(--vm-settings-scroll-width);background-color:var(--vm-settings-scroll-thumb-color);border:2px solid var(--vm-menu-bg)}.settings.active{transform:translateY(0);opacity:1;pointer-events:auto;visibility:visible !important}.settings.mobile{position:fixed;top:auto !important;left:0 !important;right:0 !important;bottom:0 !important;width:100%;min-height:56px;max-height:50%;border-radius:0;z-index:2147483647;transform:translateY(100%)}.settings.mobile.active{transform:translateY(0)}.settings.mobile>vm-menu{height:100% !important;overflow:auto !important}";

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
let idCount$2 = 0;
const Settings = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.disposal = new Disposal();
    this.menuHeight = 0;
    /**
     * Pins the settings to the defined position inside the video player. This has no effect when
     * the view is of type `audio` (always `bottomRight`) and on mobile devices (always bottom sheet).
     */
    this.pin = 'bottomRight';
    /**
     * Whether the settings menu is opened/closed.
     */
    this.active = false;
    /** @internal */
    this.isMobile = false;
    /** @internal */
    this.isAudioView = false;
    withComponentRegistry(this);
    withControlsCollisionDetection(this);
    withPlayerContext(this, ['isMobile', 'isAudioView']);
  }
  onActiveChange() {
    this.dispatch('isSettingsActive', this.active);
    if (isUndefined(this.controller))
      return;
    this.controller.expanded = this.active;
  }
  connectedCallback() {
    this.dispatch = createDispatcher(this);
    idCount$2 += 1;
    this.id = `vm-settings-${idCount$2}`;
  }
  disconnectedCallback() {
    this.disposal.empty();
  }
  /**
   * Sets the controller responsible for opening/closing this settings menu.
   */
  setController(controller) {
    return __awaiter$6(this, void 0, void 0, function* () {
      this.controller = controller;
      this.controller.menu = this.id;
      this.disposal.empty();
      this.disposal.add(listen(this.controller, 'click', () => {
        this.active = !this.active;
      }));
      this.disposal.add(listen(this.controller, 'keydown', (event) => {
        if (event.key !== 'Enter')
          return;
        // We're looking for !active because the `click` event above will toggle it to active.
        if (!this.active)
          this.menu.focusMenu();
      }));
    });
  }
  getPosition() {
    if (this.isAudioView) {
      return {
        right: '0',
        bottom: 'calc(var(--vm-controls-height, 0) + 4px)',
      };
    }
    // topLeft => { top: 0, left: 0 }
    const pos = this.pin.split(/(?=[L|R])/).map(s => s.toLowerCase());
    return {
      [pos.includes('top') ? 'top' : 'bottom']: 'var(--vm-controls-height, 0)',
      [pos.includes('left') ? 'left' : 'right']: '8px',
    };
  }
  onOpen(event) {
    var _a;
    if (((_a = event.detail) === null || _a === void 0 ? void 0 : _a.identifier) !== this.id)
      return;
    this.active = true;
  }
  onClose(event) {
    var _a;
    if (((_a = event.detail) === null || _a === void 0 ? void 0 : _a.identifier) !== this.id)
      return;
    this.active = false;
  }
  onHeightChange(event) {
    this.menuHeight = event.detail;
  }
  render() {
    return (h("div", { style: Object.assign({}, this.getPosition()), class: {
        settings: true,
        active: this.active,
        mobile: this.isMobile,
      } }, h("div", { class: "container", style: { height: `${this.menuHeight}px` } }, h("vm-menu", { identifier: this.id, active: this.active, controller: this.controller, onVmOpen: this.onOpen.bind(this), onVmClose: this.onClose.bind(this), onVmMenuHeightChange: this.onHeightChange.bind(this), ref: (el) => {
        this.menu = el;
      } }, h("slot", null)))));
  }
  get host() { return this; }
  static get watchers() { return {
    "active": ["onActiveChange"]
  }; }
  static get style() { return settingsCss; }
};

const settingsControlCss = ".settingsControl.hidden{display:none}.settingsControl{--vm-icon-transition:transform 0.3s ease}.settingsControl.active{--vm-icon-transform:rotate(90deg)}";

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
let idCount$1 = 0;
const SettingsControl = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
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
    idCount$1 += 1;
    this.id = `vm-settings-control-${idCount$1}`;
    watchComponentRegistry(this, 'vm-settings', regs => {
      [this.vmSettings] = regs;
    });
  }
  /**
   * Focuses the control.
   */
  focusControl() {
    var _a;
    return __awaiter$5(this, void 0, void 0, function* () {
      (_a = this.control) === null || _a === void 0 ? void 0 : _a.focusControl();
    });
  }
  /**
   * Removes focus from the control.
   */
  blurControl() {
    var _a;
    return __awaiter$5(this, void 0, void 0, function* () {
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
  get host() { return this; }
  static get watchers() { return {
    "vmSettings": ["onComponentsChange"]
  }; }
  static get style() { return settingsControlCss; }
};

const skeletonCss = ":host{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:var(--vm-skeleton-z-index)}@keyframes sheen{0%{background-position:200% 0}to{background-position:-200% 0}}.skeleton{width:100%;height:100%;display:flex;min-height:1rem;pointer-events:auto}.sheen.hidden{opacity:0;visibility:hidden;transition:var(--vm-fade-transition);pointer-events:none}.indicator{flex:1 1 auto;background:var(--vm-skeleton-color)}.skeleton.sheen .indicator{background:linear-gradient(\n    270deg,\n    var(--vm-skeleton-sheen-color),\n    var(--vm-skeleton-color),\n    var(--vm-skeleton-color),\n    var(--vm-skeleton-sheen-color)\n  );background-size:400% 100%;background-size:400% 100%;animation:sheen 8s ease-in-out infinite}";

const Skeleton = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.hidden = false;
    /**
     * Determines which animation effect the skeleton will use.
     * */
    this.effect = 'sheen';
    /** @internal */
    this.ready = false;
    withComponentRegistry(this);
    withPlayerContext(this, ['ready']);
  }
  onReadyChange() {
    if (!this.ready) {
      this.hidden = false;
    }
    else {
      setTimeout(() => {
        this.hidden = true;
      }, 500);
    }
  }
  render() {
    return (h("div", { class: {
        skeleton: true,
        hidden: this.hidden,
        sheen: this.effect === 'sheen',
      } }, h("div", { class: "indicator" })));
  }
  static get watchers() { return {
    "ready": ["onReadyChange"]
  }; }
  static get style() { return skeletonCss; }
};

const sliderCss = ":host{width:100%}.slider{width:100%}input{width:100%;-webkit-appearance:none;background:transparent;border:0;outline:0;cursor:pointer;box-sizing:border-box;border-radius:calc(var(--vm-slider-thumb-height) * 2);user-select:none;-webkit-user-select:none;touch-action:manipulation;color:var(--vm-slider-value-color);display:block;height:var(--vm-slider-track-height);margin:0;padding:0;transition:box-shadow 0.3s ease}input::-webkit-slider-runnable-track{background:transparent;border:0;border-radius:calc(var(--vm-slider-track-height) / 2);height:var(--vm-slider-track-height);transition:box-shadow 0.3s ease;user-select:none;background-image:linear-gradient(\n    to right,\n    currentColor var(--vm-value, 0%),\n    transparent var(--vm-value, 0%)\n  );background-color:var(--vm-slider-track-color)}input::-webkit-slider-thumb{opacity:0;background:var(--vm-slider-thumb-bg);border:0;border-radius:100%;position:relative;transition:all 0.2s ease;width:var(--vm-slider-thumb-width);height:var(--vm-slider-thumb-height);box-shadow:var(--vm-slider-thumb-shadow);-webkit-appearance:none;margin-top:calc(\n    0px -\n      calc(\n        calc(var(--vm-slider-thumb-height) - var(--vm-slider-track-height)) / 2\n      )\n  )}input::-moz-range-track{background:transparent;border:0;border-radius:calc(var(--vm-slider-track-height) / 2);height:var(--vm-slider-track-height);transition:box-shadow 0.3s ease;user-select:none;background-color:var(--vm-slider-track-color)}input::-moz-range-thumb{opacity:0;background:var(--vm-slider-thumb-bg);border:0;border-radius:100%;position:relative;transition:all 0.2s ease;width:var(--vm-slider-thumb-width);height:var(--vm-slider-thumb-height);box-shadow:var(--vm-slider-thumb-shadow)}input::-moz-range-progress{background:currentColor;border-radius:calc(var(--vm-slider-track-height) / 2);height:var(--vm-slider-track-height)}input::-ms-track{border:0;border-radius:calc(var(--vm-slider-track-height) / 2);height:var(--vm-slider-track-height);transition:box-shadow 0.3s ease;user-select:none;color:transparent;background-color:var(--vm-slider-track-color)}input::-ms-fill-upper{background:transparent;border:0;border-radius:calc(var(--vm-slider-track-height) / 2);height:var(--vm-slider-track-height);transition:box-shadow 0.3s ease;user-select:none}input::-ms-fill-lower{border:0;border-radius:calc(var(--vm-slider-track-height) / 2);height:var(--vm-slider-track-height);transition:box-shadow 0.3s ease;user-select:none;background:currentColor}input::-ms-thumb{opacity:0;background:var(--vm-slider-thumb-bg);border:0;border-radius:100%;position:relative;transition:all 0.2s ease;width:var(--vm-slider-thumb-width);height:var(--vm-slider-thumb-height);box-shadow:var(--vm-slider-thumb-shadow);margin-top:0}input::-ms-tooltip{display:none}input:hover::-webkit-slider-runnable-track{height:var(--vm-slider-track-focused-height)}input:hover::-moz-range-track{height:var(--vm-slider-track-focused-height)}input:hover::-ms-track{height:var(--vm-slider-track-focused-height)}input:hover::-ms-fill-upper{height:var(--vm-slider-track-focused-height)}input:hover::-ms-fill-lower{height:var(--vm-slider-track-focused-height)}input:hover::-webkit-slider-thumb{opacity:1}input:hover::-moz-range-thumb{opacity:1}input:hover::-ms-thumb{opacity:1}input:focus{outline:0}input:focus::-webkit-slider-runnable-track{outline:0;height:var(--vm-slider-track-focused-height)}input:focus::-moz-range-track{outline:0;height:var(--vm-slider-track-focused-height)}input:focus::-ms-track{outline:0;height:var(--vm-slider-track-focused-height)}input::-moz-focus-outer{border:0}";

const Slider = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.vmValueChange = createEvent(this, "vmValueChange", 7);
    this.vmFocus = createEvent(this, "vmFocus", 7);
    this.vmBlur = createEvent(this, "vmBlur", 7);
    /**
     * A number that specifies the granularity that the value must adhere to.
     */
    this.step = 1;
    /**
     * The lowest value in the range of permitted values.
     */
    this.min = 0;
    /**
     * The greatest permitted value.
     */
    this.max = 10;
    /**
     * The current value.
     */
    this.value = 5;
    withComponentRegistry(this);
  }
  getPercentage() {
    return `${(this.value / this.max) * 100}%`;
  }
  onValueChange(event) {
    var _a;
    const value = parseFloat((_a = event.target) === null || _a === void 0 ? void 0 : _a.value);
    this.vmValueChange.emit(value);
  }
  calcTouchedValue(event) {
    const input = event.target;
    const touch = event.changedTouches[0];
    const min = parseFloat(input.getAttribute('min'));
    const max = parseFloat(input.getAttribute('max'));
    const step = parseFloat(input.getAttribute('step'));
    const delta = max - min;
    // Calculate percentage.
    let percent;
    const clientRect = input.getBoundingClientRect();
    const sliderThumbWidth = parseFloat(window
      .getComputedStyle(this.host)
      .getPropertyValue('--vm-slider-thumb-width'));
    const thumbWidth = ((100 / clientRect.width) * (sliderThumbWidth / 2)) / 100;
    percent = (100 / clientRect.width) * (touch.clientX - clientRect.left);
    // Don't allow outside bounds.
    percent = Math.max(0, Math.min(percent, 100));
    // Factor in the thumb offset.
    if (percent < 50) {
      percent -= (100 - percent * 2) * thumbWidth;
    }
    else if (percent > 50) {
      percent += (percent - 50) * 2 * thumbWidth;
    }
    const position = delta * (percent / 100);
    if (step >= 1) {
      return min + Math.round(position / step) * step;
    }
    /**
     * This part differs from original implementation to save space. Only supports 2 decimal
     * places (0.01) as the step.
     */
    return min + parseFloat(position.toFixed(2));
  }
  /**
   * Basically input[range="type"] on touch devices sucks (particularly iOS), so this helps make it
   * better.
   *
   * @see https://github.com/sampotts/rangetouch
   */
  onTouch(event) {
    const input = event.target;
    if (input.disabled)
      return;
    event.preventDefault();
    this.value = this.calcTouchedValue(event);
    this.vmValueChange.emit(this.value);
    input.dispatchEvent(new window.Event(event.type === 'touchend' ? 'change' : 'input', {
      bubbles: true,
    }));
  }
  render() {
    var _a;
    return (h("div", { class: "slider", style: {
        '--vm-value': this.getPercentage(),
      } }, h("input", { type: "range", step: this.step, min: this.min, max: this.max, value: this.value, autocomplete: "off", "aria-label": this.label, "aria-valuemin": this.min, "aria-valuemax": this.max, "aria-valuenow": this.value, "aria-valuetext": (_a = this.valueText) !== null && _a !== void 0 ? _a : this.getPercentage(), "aria-orientation": "horizontal", onInput: this.onValueChange.bind(this), onFocus: () => {
        this.vmFocus.emit();
      }, onBlur: () => {
        this.vmBlur.emit();
      }, onTouchStart: this.onTouch.bind(this), onTouchMove: this.onTouch.bind(this), onTouchEnd: this.onTouch.bind(this) })));
  }
  get host() { return this; }
  static get style() { return sliderCss; }
};

const spinnerCss = ":host{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:var(--vm-spinner-z-index)}.spinner{width:100%;height:100%;display:flex;justify-content:center;align-items:center;opacity:0;visibility:hidden;pointer-events:none;transition:var(--vm-fade-transition)}.spinner.hidden{display:none}.spinner.active{opacity:1;visibility:visible}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.spin{background:transparent;margin:60px auto;font-size:10px;position:relative;text-indent:-9999em;pointer-events:none;border-top:var(--vm-spinner-thickness) solid var(--vm-spinner-fill-color);border-left:var(--vm-spinner-thickness) solid var(--vm-spinner-fill-color);border-right:var(--vm-spinner-thickness) solid var(--vm-spinner-track-color);border-bottom:var(--vm-spinner-thickness) solid var(--vm-spinner-track-color);transform:translateZ(0)}.spin.active{animation:spin var(--vm-spinner-spin-duration) infinite\n    var(--vm-spinner-spin-timing-func)}.spin,.spin::after{border-radius:50%;width:var(--vm-spinner-width);height:var(--vm-spinner-height)}";

const Spinner = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.vmWillShow = createEvent(this, "vmWillShow", 3);
    this.vmWillHide = createEvent(this, "vmWillHide", 3);
    this.blacklist = [Provider.YouTube];
    this.isHidden = true;
    this.isActive = false;
    /** @internal */
    this.isVideoView = false;
    /**
     * Whether the spinner should be active when the player is booting or media is loading.
     */
    this.showWhenMediaLoading = false;
    /** @internal */
    this.playbackReady = false;
    /** @internal */
    this.buffering = false;
    withComponentRegistry(this);
    withPlayerContext(this, [
      'isVideoView',
      'buffering',
      'playbackReady',
      'currentProvider',
    ]);
  }
  onVideoViewChange() {
    this.isHidden = !this.isVideoView;
    this.onVisiblityChange();
  }
  onActiveChange() {
    this.isActive =
      this.buffering || (this.showWhenMediaLoading && !this.playbackReady);
    this.onVisiblityChange();
  }
  onVisiblityChange() {
    !this.isHidden && this.isActive
      ? this.vmWillShow.emit()
      : this.vmWillHide.emit();
  }
  render() {
    return (h("div", { class: {
        spinner: true,
        hidden: this.isHidden || this.blacklist.includes(this.currentProvider),
        active: this.isActive,
      } }, h("div", { class: {
        spin: true,
        active: this.isActive,
      } }, "Loading...")));
  }
  static get watchers() { return {
    "isVideoView": ["onVideoViewChange"],
    "buffering": ["onActiveChange"],
    "playbackReady": ["onActiveChange"]
  }; }
  static get style() { return spinnerCss; }
};

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
let idCount = 0;
const Submenu = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.vmOpenSubmenu = createEvent(this, "vmOpenSubmenu", 7);
    this.vmCloseSubmenu = createEvent(this, "vmCloseSubmenu", 7);
    /**
     * The direction the submenu should slide in from.
     */
    this.slideInDirection = 'right';
    /**
     * Whether the submenu is open/closed.
     */
    this.active = false;
    withComponentRegistry(this);
  }
  connectedCallback() {
    this.genId();
  }
  /**
   * Returns the controller (`vm-menu-item`) for this submenu.
   */
  getController() {
    return __awaiter$4(this, void 0, void 0, function* () {
      return this.controller;
    });
  }
  /**
   * Returns the menu (`vm-menu`) for this submenu.
   */
  getMenu() {
    return __awaiter$4(this, void 0, void 0, function* () {
      return this.menu;
    });
  }
  /**
   * Returns the height of the submenu controller.
   */
  getControllerHeight() {
    var _a, _b;
    return __awaiter$4(this, void 0, void 0, function* () {
      return (_b = (_a = this.controller) === null || _a === void 0 ? void 0 : _a.getHeight()) !== null && _b !== void 0 ? _b : 0;
    });
  }
  getControllerHeightSync() {
    var _a;
    const el = (_a = this.controller) === null || _a === void 0 ? void 0 : _a.shadowRoot.querySelector("[role='menuitem']");
    return el ? parseFloat(window.getComputedStyle(el).height) : 0;
  }
  onMenuOpen() {
    this.active = true;
    this.vmOpenSubmenu.emit(this.host);
  }
  onMenuClose() {
    this.active = false;
    this.vmCloseSubmenu.emit(this.host);
  }
  genId() {
    idCount += 1;
    this.id = `vm-submenu-${idCount}`;
  }
  getControllerId() {
    return `${this.id}-controller`;
  }
  render() {
    return (h("div", null, h("vm-menu-item", { identifier: this.getControllerId(), menu: this.menu, label: this.label, hint: this.hint, expanded: this.active, ref: el => {
        writeTask(() => {
          this.controller = el;
        });
      } }), h("vm-menu", { identifier: this.id, controller: this.controller, active: this.active, slideInDirection: this.slideInDirection, onVmOpen: this.onMenuOpen.bind(this), onVmClose: this.onMenuClose.bind(this), ref: el => {
        writeTask(() => {
          this.menu = el;
        });
      }, style: { top: `${this.getControllerHeightSync() + 1}px` } }, h("slot", null))));
  }
  get host() { return this; }
};

const timeCss = ".time{display:flex;align-items:center;color:var(--vm-time-color);font-size:var(--vm-time-font-size);font-weight:var(--vm-time-font-weight)}";

const Time = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    /**
     * The length of time in seconds.
     */
    this.seconds = 0;
    /**
     * Whether the time should always show the hours unit, even if the time is less than
     * 1 hour (eg: `20:35` -> `00:20:35`).
     */
    this.alwaysShowHours = false;
    withComponentRegistry(this);
  }
  render() {
    return (h("div", { class: "time", "aria-label": this.label }, formatTime(Math.max(0, this.seconds), this.alwaysShowHours)));
  }
  static get style() { return timeCss; }
};

const timeProgressCss = ".timeProgress{display:flex;width:100%;height:100%;align-items:center;color:var(--vm-time-color)}.separator{margin:0 4px}";

const TimeProgress = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
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
  static get style() { return timeProgressCss; }
};

const tooltipCss = ":host{display:contents;z-index:var(--vm-tooltip-z-index)}.tooltip{left:var(--vm-tooltip-left, 50%);transform:translateX(-50%);line-height:1.3;pointer-events:none;position:absolute;opacity:0;white-space:nowrap;visibility:hidden;background:var(--vm-tooltip-bg);border-radius:var(--vm-tooltip-border-radius);box-sizing:border-box;box-shadow:var(--vm-tooltip-box-shadow);color:var(--vm-tooltip-color);font-size:var(--vm-tooltip-font-size);padding:var(--vm-tooltip-padding);transition:opacity var(--vm-tooltip-fade-duration)\n    var(--vm-tooltip-fade-timing-func)}.tooltip[aria-hidden='false']{opacity:1;visibility:visible}.tooltip.hidden{display:none}.tooltip.onTop{bottom:100%;margin-bottom:var(--vm-tooltip-spacing)}.tooltip.onBottom{top:100%;margin-top:var(--vm-tooltip-spacing)}.tooltip.growLeft{left:auto;right:0;transform:none}.tooltip.growRight{left:0;transform:none}";

let tooltipIdCount = 0;
const Tooltip = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    // Avoid tooltips flashing when player initializing.
    this.hasLoaded = false;
    /**
     * Whether the tooltip is displayed or not.
     */
    this.hidden = false;
    /**
     * Whether the tooltip is visible or not.
     */
    this.active = false;
    /**
     * Determines if the tooltip appears on top/bottom of it's parent.
     */
    this.position = 'top';
    /** @internal */
    this.isTouch = false;
    /** @internal */
    this.isMobile = false;
    withComponentRegistry(this);
    withPlayerContext(this, ['isTouch', 'isMobile']);
  }
  componentDidLoad() {
    this.hasLoaded = true;
  }
  getId() {
    // eslint-disable-next-line prefer-destructuring
    const id = this.host.id;
    if (isString(id) && id.length > 0)
      return id;
    tooltipIdCount += 1;
    return `vm-tooltip-${tooltipIdCount}`;
  }
  render() {
    return (h("div", { id: this.getId(), role: "tooltip", "aria-hidden": !this.active || this.isTouch || this.isMobile ? 'true' : 'false', class: {
        tooltip: true,
        hidden: !this.hasLoaded || this.hidden,
        onTop: this.position === 'top',
        onBottom: this.position === 'bottom',
        growLeft: this.direction === 'left',
        growRight: this.direction === 'right',
      } }, h("slot", null)));
  }
  get host() { return this; }
  static get style() { return tooltipCss; }
};

const uiCss = ":host{z-index:var(--vm-ui-z-index)}.ui{width:100%;pointer-events:none}.ui.hidden{display:none}.ui.video{position:absolute;top:0;left:0;height:100%}";

const UI = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    /** @internal */
    this.isVideoView = false;
    /** @internal */
    this.playsinline = false;
    /** @internal */
    this.isFullscreenActive = false;
    withComponentRegistry(this);
    withPlayerContext(this, [
      'isVideoView',
      'playsinline',
      'isFullscreenActive',
    ]);
  }
  render() {
    const canShowCustomUI = !IS_IOS ||
      !this.isVideoView ||
      (this.playsinline && !this.isFullscreenActive);
    return (h("div", { class: {
        ui: true,
        hidden: !canShowCustomUI,
        video: this.isVideoView,
      } }, canShowCustomUI && h("slot", null)));
  }
  static get style() { return uiCss; }
};

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
const Video = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    /**
     * @internal Whether an external SDK will attach itself to the media player and control it.
     */
    this.willAttach = false;
    /**
     * @internal Whether an external SDK will manage the text tracks.
     */
    this.hasCustomTextManager = false;
    /** @inheritdoc */
    this.preload = 'metadata';
    withComponentRegistry(this);
    withProviderConnect(this);
  }
  onProviderConnect(event) {
    if (this.willAttach)
      event.stopImmediatePropagation();
  }
  onProviderDisconnect(event) {
    if (this.willAttach)
      event.stopImmediatePropagation();
  }
  /** @internal */
  getAdapter() {
    var _a;
    return __awaiter$3(this, void 0, void 0, function* () {
      return (_a = this.fileProvider) === null || _a === void 0 ? void 0 : _a.getAdapter();
    });
  }
  render() {
    return (h("vm-file", { noConnect: true, willAttach: this.willAttach, crossOrigin: this.crossOrigin, poster: this.poster, preload: this.preload, controlsList: this.controlsList, autoPiP: this.autoPiP, disablePiP: this.disablePiP, disableRemotePlayback: this.disableRemotePlayback, hasCustomTextManager: this.hasCustomTextManager, mediaTitle: this.mediaTitle, viewType: ViewType.Video, ref: (el) => {
        this.fileProvider = el;
      } }, h("slot", null)));
  }
};

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
const videoInfoCache = new Map();
const Vimeo = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
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
    return __awaiter$2(this, void 0, void 0, function* () {
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
    return __awaiter$2(this, void 0, void 0, function* () {
      const canPlayRegex = /vimeo(?:\.com|)\/([0-9]{9,})/;
      const fileRegex = /vimeo\.com\/external\/[0-9]+\..+/;
      return {
        getInternalPlayer: () => __awaiter$2(this, void 0, void 0, function* () { return this.embed; }),
        play: () => __awaiter$2(this, void 0, void 0, function* () {
          this.remoteControl("play" /* Play */);
        }),
        pause: () => __awaiter$2(this, void 0, void 0, function* () {
          this.remoteControl("pause" /* Pause */);
        }),
        canPlay: (type) => __awaiter$2(this, void 0, void 0, function* () { return isString(type) && !fileRegex.test(type) && canPlayRegex.test(type); }),
        setCurrentTime: (time) => __awaiter$2(this, void 0, void 0, function* () {
          if (time !== this.internalState.currentTime) {
            this.remoteControl("setCurrentTime" /* SetCurrentTime */, time);
          }
        }),
        setMuted: (muted) => __awaiter$2(this, void 0, void 0, function* () {
          if (!muted)
            this.volume = this.volume > 0 ? this.volume : 30;
          this.remoteControl("setVolume" /* SetVolume */, muted ? 0 : this.volume / 100);
        }),
        setVolume: (volume) => __awaiter$2(this, void 0, void 0, function* () {
          if (!this.muted) {
            this.remoteControl("setVolume" /* SetVolume */, volume / 100);
          }
          else {
            // Confirm volume was set.
            this.dispatch('volume', volume);
          }
        }),
        // @TODO how to check if Vimeo pro?
        canSetPlaybackRate: () => __awaiter$2(this, void 0, void 0, function* () { return false; }),
        setPlaybackRate: (rate) => __awaiter$2(this, void 0, void 0, function* () {
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
  static get style() { return vimeoCss; }
};

const volumeControlCss = ".volumeControl{align-items:center;display:flex;position:relative;pointer-events:auto;box-sizing:border-box}vm-slider{width:75px;height:100%;margin:0;max-width:0;position:relative;z-index:3;transition:margin 0.2s cubic-bezier(0.4, 0, 1, 1),\n    max-width 0.2s cubic-bezier(0.4, 0, 1, 1);margin-left:calc(var(--vm-control-spacing) / 2) !important;visibility:hidden}vm-slider:hover{cursor:pointer}vm-slider.hidden{display:none}vm-slider.active{max-width:75px;visibility:visible;margin:0 calc(var(--vm-control-spacing) / 2)}";

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
const VolumeControl = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
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
    return __awaiter$1(this, void 0, void 0, function* () {
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
  static get style() { return volumeControlCss; }
};

const mapYouTubePlaybackQuality = (quality) => {
  switch (quality) {
    case "unknown" /* Unknown */:
      return undefined;
    case "tiny" /* Tiny */:
      return '144p';
    case "small" /* Small */:
      return '240p';
    case "medium" /* Medium */:
      return '360p';
    case "large" /* Large */:
      return '480p';
    case "hd720" /* Hd720 */:
      return '720p';
    case "hd1080" /* Hd1080 */:
      return '1080p';
    case "highres" /* Highres */:
      return '1440p';
    case "max" /* Max */:
      return '2160p';
    default:
      return undefined;
  }
};

const youtubeCss = ":host{z-index:var(--vm-media-z-index)}";

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
const posterCache = new Map();
const YouTube = class extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    attachShadow(this);
    this.vmLoadStart = createEvent(this, "vmLoadStart", 7);
    this.defaultInternalState = {};
    this.internalState = {
      paused: true,
      duration: 0,
      seeking: false,
      playbackReady: false,
      playbackStarted: false,
      currentTime: 0,
      lastTimeUpdate: 0,
      playbackRate: 1,
      state: -1,
    };
    this.embedSrc = '';
    this.mediaTitle = '';
    /**
     * Whether cookies should be enabled on the embed.
     */
    this.cookies = false;
    /**
     * Whether the fullscreen control should be shown.
     */
    this.showFullscreenControl = true;
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
    if (!this.videoId) {
      this.embedSrc = '';
      return;
    }
    this.embedSrc = `${this.getOrigin()}/embed/${this.videoId}`;
    this.fetchPosterURL = this.findPosterURL();
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
  /** @internal */
  getAdapter() {
    return __awaiter(this, void 0, void 0, function* () {
      const canPlayRegex = /(?:youtu\.be|youtube|youtube\.com|youtube-nocookie\.com)\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|)((?:\w|-){11})/;
      return {
        getInternalPlayer: () => __awaiter(this, void 0, void 0, function* () { return this.embed; }),
        play: () => __awaiter(this, void 0, void 0, function* () {
          this.remoteControl("playVideo" /* Play */);
        }),
        pause: () => __awaiter(this, void 0, void 0, function* () {
          this.remoteControl("pauseVideo" /* Pause */);
        }),
        canPlay: (type) => __awaiter(this, void 0, void 0, function* () { return isString(type) && canPlayRegex.test(type); }),
        setCurrentTime: (time) => __awaiter(this, void 0, void 0, function* () {
          if (time !== this.internalState.currentTime) {
            this.remoteControl("seekTo" /* Seek */, time);
          }
        }),
        setMuted: (muted) => __awaiter(this, void 0, void 0, function* () {
          muted
            ? this.remoteControl("mute" /* Mute */)
            : this.remoteControl("unMute" /* Unmute */);
        }),
        setVolume: (volume) => __awaiter(this, void 0, void 0, function* () {
          this.remoteControl("setVolume" /* SetVolume */, volume);
        }),
        canSetPlaybackRate: () => __awaiter(this, void 0, void 0, function* () { return true; }),
        setPlaybackRate: (rate) => __awaiter(this, void 0, void 0, function* () {
          this.remoteControl("setPlaybackRate" /* SetPlaybackRate */, rate);
        }),
      };
    });
  }
  getOrigin() {
    return !this.cookies
      ? 'https://www.youtube-nocookie.com'
      : 'https://www.youtube.com';
  }
  getPreconnections() {
    return [
      this.getOrigin(),
      'https://www.google.com',
      'https://googleads.g.doubleclick.net',
      'https://static.doubleclick.net',
      'https://s.ytimg.com',
      'https://i.ytimg.com',
    ];
  }
  remoteControl(command, arg) {
    return this.embed.postMessage({
      event: 'command',
      func: command,
      args: arg ? [arg] : undefined,
    });
  }
  buildParams() {
    return {
      enablejsapi: 1,
      cc_lang_pref: this.language,
      hl: this.language,
      fs: this.showFullscreenControl ? 1 : 0,
      controls: this.controls ? 1 : 0,
      disablekb: !this.controls ? 1 : 0,
      iv_load_policy: this.controls ? 1 : 3,
      mute: this.initialMuted ? 1 : 0,
      playsinline: this.playsinline ? 1 : 0,
      autoplay: this.autoplay ? 1 : 0,
    };
  }
  onEmbedSrcChange() {
    this.vmLoadStart.emit();
    this.dispatch('viewType', ViewType.Video);
  }
  onEmbedLoaded() {
    // Seems like we have to wait a random small delay or else YT player isn't ready.
    window.setTimeout(() => this.embed.postMessage({ event: 'listening' }), 100);
  }
  findPosterURL() {
    return __awaiter(this, void 0, void 0, function* () {
      if (posterCache.has(this.videoId))
        return posterCache.get(this.videoId);
      const posterURL = (quality) => `https://i.ytimg.com/vi/${this.videoId}/${quality}.jpg`;
      /**
       * We are testing a that the image has a min-width of 121px because if the thumbnail does not
       * exist YouTube returns a blank/error image that is 120px wide.
       */
      return loadImage(posterURL('maxresdefault'), 121) // 1080p (no padding)
        .catch(() => loadImage(posterURL('sddefault'), 121)) // 640p (padded 4:3)
        .catch(() => loadImage(posterURL('hqdefault'), 121)) // 480p (padded 4:3)
        .then(img => {
        const poster = img.src;
        posterCache.set(this.videoId, poster);
        return poster;
      });
    });
  }
  onCued() {
    if (this.internalState.playbackReady)
      return;
    this.internalState = Object.assign({}, this.defaultInternalState);
    this.dispatch('currentSrc', this.embedSrc);
    this.dispatch('mediaType', MediaType.Video);
    this.fetchPosterURL.then(poster => {
      var _a;
      this.dispatch('currentPoster', (_a = this.poster) !== null && _a !== void 0 ? _a : poster);
      this.dispatch('playbackReady', true);
    });
    this.internalState.playbackReady = true;
  }
  onPlayerStateChange(state) {
    // Sometimes the embed falls back to an unstarted state for some unknown reason, this will
    // make sure the player is configured to the right starting state.
    if (this.internalState.playbackReady &&
      state === -1 /* Unstarted */) {
      this.internalState.paused = true;
      this.internalState.playbackStarted = false;
      this.dispatch('buffering', false);
      this.dispatch('paused', true);
      this.dispatch('playbackStarted', false);
      return;
    }
    const isPlaying = state === 1 /* Playing */;
    const isBuffering = state === 3 /* Buffering */;
    this.dispatch('buffering', isBuffering);
    // Attempt to detect `play` events early.
    if (this.internalState.paused && (isBuffering || isPlaying)) {
      this.internalState.paused = false;
      this.dispatch('paused', false);
      if (!this.internalState.playbackStarted) {
        this.dispatch('playbackStarted', true);
        this.internalState.playbackStarted = true;
      }
    }
    switch (state) {
      case 5 /* Cued */:
        this.onCued();
        break;
      case 1 /* Playing */:
        // Incase of autoplay which might skip `Cued` event.
        this.onCued();
        this.dispatch('playing', true);
        break;
      case 2 /* Paused */:
        this.internalState.paused = true;
        this.dispatch('paused', true);
        break;
      case 0 /* Ended */:
        if (this.loop) {
          window.setTimeout(() => {
            this.remoteControl("playVideo" /* Play */);
          }, 150);
        }
        else {
          this.dispatch('playbackEnded', true);
          this.internalState.paused = true;
          this.dispatch('paused', true);
        }
        break;
    }
    this.internalState.state = state;
  }
  calcCurrentTime(time) {
    let currentTime = time;
    if (this.internalState.state === 0 /* Ended */) {
      return this.internalState.duration;
    }
    if (this.internalState.state === 1 /* Playing */) {
      const elapsedTime = (Date.now() / 1e3 - this.defaultInternalState.lastTimeUpdate) *
        this.internalState.playbackRate;
      if (elapsedTime > 0)
        currentTime += Math.min(elapsedTime, 1);
    }
    return currentTime;
  }
  onTimeChange(time) {
    const currentTime = this.calcCurrentTime(time);
    this.dispatch('currentTime', currentTime);
    // This is the only way to detect `seeking`.
    if (Math.abs(this.internalState.currentTime - currentTime) > 1.5) {
      this.internalState.seeking = true;
      this.dispatch('seeking', true);
    }
    this.internalState.currentTime = currentTime;
  }
  onBufferedChange(buffered) {
    this.dispatch('buffered', buffered);
    /**
     * This is the only way to detect `seeked`. Unfortunately while the player is `paused` `seeking`
     * and `seeked` will fire at the same time, there are no updates inbetween -_-. We need an
     * artifical delay between the two events.
     */
    if (this.internalState.seeking &&
      buffered > this.internalState.currentTime) {
      window.setTimeout(() => {
        this.internalState.seeking = false;
        this.dispatch('seeking', false);
      }, this.internalState.paused ? 100 : 0);
    }
  }
  onEmbedMessage(event) {
    const message = event.detail;
    const { info } = message;
    if (!info)
      return;
    if (isObject(info.videoData))
      this.dispatch('mediaTitle', info.videoData.title);
    if (isNumber(info.duration)) {
      this.internalState.duration = info.duration;
      this.dispatch('duration', info.duration);
    }
    if (isArray(info.availablePlaybackRates)) {
      this.dispatch('playbackRates', info.availablePlaybackRates);
    }
    if (isNumber(info.playbackRate)) {
      this.internalState.playbackRate = info.playbackRate;
      this.dispatch('playbackRate', info.playbackRate);
    }
    if (isNumber(info.currentTime))
      this.onTimeChange(info.currentTime);
    if (isNumber(info.currentTimeLastUpdated)) {
      this.internalState.lastTimeUpdate = info.currentTimeLastUpdated;
    }
    if (isNumber(info.videoLoadedFraction)) {
      this.onBufferedChange(info.videoLoadedFraction * this.internalState.duration);
    }
    if (isNumber(info.volume))
      this.dispatch('volume', info.volume);
    if (isBoolean(info.muted))
      this.dispatch('muted', info.muted);
    if (isArray(info.availableQualityLevels)) {
      this.dispatch('playbackQualities', info.availableQualityLevels.map(q => mapYouTubePlaybackQuality(q)));
    }
    if (isString(info.playbackQuality)) {
      this.dispatch('playbackQuality', mapYouTubePlaybackQuality(info.playbackQuality));
    }
    if (isNumber(info.playerState))
      this.onPlayerStateChange(info.playerState);
  }
  render() {
    return (h("vm-embed", { embedSrc: this.embedSrc, mediaTitle: this.mediaTitle, origin: this.getOrigin(), params: this.buildParams(), decoder: decodeJSON, preconnections: this.getPreconnections(), onVmEmbedLoaded: this.onEmbedLoaded.bind(this), onVmEmbedMessage: this.onEmbedMessage.bind(this), onVmEmbedSrcChange: this.onEmbedSrcChange.bind(this), ref: (el) => {
        this.embed = el;
      } }));
  }
  static get watchers() { return {
    "cookies": ["onVideoIdChange"],
    "videoId": ["onVideoIdChange"],
    "poster": ["onCustomPosterChange"]
  }; }
  static get style() { return youtubeCss; }
};

const VmAudio = /*@__PURE__*/proxyCustomElement(Audio, [4,"vm-audio",{"willAttach":[4,"will-attach"],"crossOrigin":[1,"cross-origin"],"preload":[1],"disableRemotePlayback":[4,"disable-remote-playback"],"mediaTitle":[1,"media-title"]}]);
const VmCaptionControl = /*@__PURE__*/proxyCustomElement(CaptionControl, [1,"vm-caption-control",{"showIcon":[1,"show-icon"],"hideIcon":[1,"hide-icon"],"tooltipPosition":[1,"tooltip-position"],"tooltipDirection":[1,"tooltip-direction"],"hideTooltip":[4,"hide-tooltip"],"icons":[1],"keys":[1],"i18n":[16],"playbackReady":[4,"playback-ready"],"textTracks":[16],"isTextTrackVisible":[4,"is-text-track-visible"],"canToggleCaptionVisibility":[32]}]);
const VmCaptions = /*@__PURE__*/proxyCustomElement(Captions, [1,"vm-captions",{"hidden":[4],"isControlsActive":[4,"is-controls-active"],"isVideoView":[4,"is-video-view"],"playbackStarted":[4,"playback-started"],"textTracks":[16],"currentTextTrack":[2,"current-text-track"],"isTextTrackVisible":[4,"is-text-track-visible"],"isEnabled":[32],"cue":[32],"fontSize":[32]}]);
const VmClickToPlay = /*@__PURE__*/proxyCustomElement(ClickToPlay, [1,"vm-click-to-play",{"useOnMobile":[4,"use-on-mobile"],"paused":[4],"isVideoView":[4,"is-video-view"],"isMobile":[4,"is-mobile"]}]);
const VmControl = /*@__PURE__*/proxyCustomElement(Control, [1,"vm-control",{"keys":[1],"identifier":[1],"hidden":[4],"label":[1],"menu":[1],"expanded":[4],"pressed":[4],"isTouch":[4,"is-touch"],"describedBy":[32],"showTapHighlight":[32]}]);
const VmControlGroup = /*@__PURE__*/proxyCustomElement(ControlNewLine, [1,"vm-control-group",{"space":[1]}]);
const VmControlSpacer = /*@__PURE__*/proxyCustomElement(ControlSpacer, [1,"vm-control-spacer"]);
const VmControls = /*@__PURE__*/proxyCustomElement(Controls, [1,"vm-controls",{"hidden":[4],"fullWidth":[4,"full-width"],"fullHeight":[4,"full-height"],"direction":[1],"align":[1],"justify":[1],"pin":[513],"activeDuration":[2,"active-duration"],"waitForPlaybackStart":[4,"wait-for-playback-start"],"hideWhenPaused":[4,"hide-when-paused"],"hideOnMouseLeave":[4,"hide-on-mouse-leave"],"isAudioView":[4,"is-audio-view"],"isSettingsActive":[4,"is-settings-active"],"playbackReady":[4,"playback-ready"],"isControlsActive":[4,"is-controls-active"],"paused":[4],"playbackStarted":[4,"playback-started"],"isInteracting":[32]}]);
const VmCurrentTime = /*@__PURE__*/proxyCustomElement(CurrentTime, [1,"vm-current-time",{"currentTime":[2,"current-time"],"i18n":[16],"alwaysShowHours":[4,"always-show-hours"]}]);
const VmDailymotion = /*@__PURE__*/proxyCustomElement(Dailymotion, [1,"vm-dailymotion",{"videoId":[1,"video-id"],"shouldAutoplayQueue":[4,"should-autoplay-queue"],"showUpNextQueue":[4,"show-up-next-queue"],"showShareButtons":[4,"show-share-buttons"],"color":[1],"syndication":[1],"showDailymotionLogo":[4,"show-dailymotion-logo"],"showVideoInfo":[4,"show-video-info"],"language":[1],"autoplay":[4],"controls":[4],"poster":[1],"logger":[16],"loop":[4],"muted":[4],"playsinline":[4],"embedSrc":[32],"mediaTitle":[32]}]);
const VmDash = /*@__PURE__*/proxyCustomElement(Dash, [1,"vm-dash",{"src":[1],"version":[1],"libSrc":[1,"lib-src"],"config":[16],"autoplay":[4],"crossOrigin":[1,"cross-origin"],"preload":[1],"poster":[1],"controlsList":[1,"controls-list"],"autoPiP":[4,"auto-pip"],"disablePiP":[4,"disable-pip"],"disableRemotePlayback":[4,"disable-remote-playback"],"mediaTitle":[1,"media-title"],"enableTextTracksByDefault":[4,"enable-text-tracks-by-default"],"shouldRenderNativeTextTracks":[4,"should-render-native-text-tracks"],"isTextTrackVisible":[4,"is-text-track-visible"],"currentTextTrack":[2,"current-text-track"],"hasAttached":[32]},[[0,"vmMediaElChange","onMediaElChange"]]]);
const VmDblClickFullscreen = /*@__PURE__*/proxyCustomElement(DblClickFullscreen, [1,"vm-dbl-click-fullscreen",{"useOnMobile":[4,"use-on-mobile"],"isFullscreenActive":[4,"is-fullscreen-active"],"isVideoView":[4,"is-video-view"],"playbackReady":[4,"playback-ready"],"isMobile":[4,"is-mobile"],"canSetFullscreen":[32]}]);
const VmDefaultControls = /*@__PURE__*/proxyCustomElement(DefaultControls, [1,"vm-default-controls",{"activeDuration":[2,"active-duration"],"waitForPlaybackStart":[4,"wait-for-playback-start"],"hideWhenPaused":[4,"hide-when-paused"],"hideOnMouseLeave":[4,"hide-on-mouse-leave"],"theme":[1],"isMobile":[4,"is-mobile"],"isLive":[4,"is-live"],"isAudioView":[4,"is-audio-view"],"isVideoView":[4,"is-video-view"]}]);
const VmDefaultSettings = /*@__PURE__*/proxyCustomElement(DefaultSettings, [1,"vm-default-settings",{"pin":[513],"i18n":[16],"playbackReady":[4,"playback-ready"],"playbackRate":[2,"playback-rate"],"playbackRates":[16],"isVideoView":[4,"is-video-view"],"playbackQuality":[1,"playback-quality"],"playbackQualities":[16],"textTracks":[16],"currentTextTrack":[2,"current-text-track"],"audioTracks":[16],"currentAudioTrack":[2,"current-audio-track"],"isTextTrackVisible":[4,"is-text-track-visible"],"canSetPlaybackRate":[32],"canSetPlaybackQuality":[32],"canSetTextTrack":[32],"canSetAudioTrack":[32]}]);
const VmDefaultUi = /*@__PURE__*/proxyCustomElement(DefaultUI, [1,"vm-default-ui",{"noClickToPlay":[4,"no-click-to-play"],"noDblClickFullscreen":[4,"no-dbl-click-fullscreen"],"noCaptions":[4,"no-captions"],"noPoster":[4,"no-poster"],"noSpinner":[4,"no-spinner"],"noControls":[4,"no-controls"],"noSettings":[4,"no-settings"],"noLoadingScreen":[4,"no-loading-screen"]}]);
const VmEmbed = /*@__PURE__*/proxyCustomElement(Embed, [1,"vm-embed",{"embedSrc":[1,"embed-src"],"mediaTitle":[1,"media-title"],"params":[1],"origin":[1],"preconnections":[16],"decoder":[16],"srcWithParams":[32],"hasEnteredViewport":[32]},[[8,"message","onWindowMessage"]]]);
const VmEndTime = /*@__PURE__*/proxyCustomElement(EndTime, [1,"vm-end-time",{"duration":[2],"i18n":[16],"alwaysShowHours":[4,"always-show-hours"]}]);
const VmFile = /*@__PURE__*/proxyCustomElement(File, [6,"vm-file",{"willAttach":[4,"will-attach"],"crossOrigin":[1,"cross-origin"],"preload":[1],"poster":[1],"mediaTitle":[1,"media-title"],"controlsList":[1,"controls-list"],"autoPiP":[4,"auto-pip"],"disablePiP":[4,"disable-pip"],"disableRemotePlayback":[4,"disable-remote-playback"],"viewType":[1,"view-type"],"playbackRates":[16],"language":[1],"autoplay":[4],"controls":[4],"logger":[16],"loop":[4],"muted":[4],"playsinline":[4],"noConnect":[4,"no-connect"],"paused":[4],"currentTime":[2,"current-time"],"volume":[2],"playbackReady":[4,"playback-ready"],"playbackStarted":[4,"playback-started"],"currentTextTrack":[2,"current-text-track"],"hasCustomTextManager":[4,"has-custom-text-manager"],"isTextTrackVisible":[4,"is-text-track-visible"],"shouldRenderNativeTextTracks":[4,"should-render-native-text-tracks"],"vmPoster":[32]},[[0,"vmMediaProviderConnect","onProviderConnect"],[0,"vmMediaProviderDisconnect","onProviderDisconnect"]]]);
const VmFullscreenControl = /*@__PURE__*/proxyCustomElement(FullscreenControl, [1,"vm-fullscreen-control",{"enterIcon":[1,"enter-icon"],"exitIcon":[1,"exit-icon"],"icons":[1],"tooltipPosition":[1,"tooltip-position"],"tooltipDirection":[1,"tooltip-direction"],"hideTooltip":[4,"hide-tooltip"],"keys":[1],"isFullscreenActive":[4,"is-fullscreen-active"],"i18n":[16],"playbackReady":[4,"playback-ready"],"canSetFullscreen":[32]}]);
const VmHls = /*@__PURE__*/proxyCustomElement(HLS, [4,"vm-hls",{"version":[1],"libSrc":[1,"lib-src"],"config":[8],"crossOrigin":[1,"cross-origin"],"preload":[1],"poster":[1],"controlsList":[1,"controls-list"],"autoPiP":[4,"auto-pip"],"disablePiP":[4,"disable-pip"],"disableRemotePlayback":[4,"disable-remote-playback"],"playbackReady":[4,"playback-ready"],"mediaTitle":[1,"media-title"],"hasAttached":[32]},[[0,"vmMediaElChange","onMediaElChange"],[0,"vmSrcSetChange","onSrcChange"]]]);
const VmIcon = /*@__PURE__*/proxyCustomElement(Icon, [1,"vm-icon",{"name":[1],"src":[1],"label":[1],"library":[1],"icons":[1],"svg":[32]}]);
const VmIconLibrary = /*@__PURE__*/proxyCustomElement(IconLibrary, [1,"vm-icon-library",{"name":[1],"resolver":[16],"icons":[1]}]);
const VmLiveIndicator = /*@__PURE__*/proxyCustomElement(LiveIndicator, [1,"vm-live-indicator",{"isLive":[4,"is-live"],"i18n":[16]}]);
const VmLoadingScreen = /*@__PURE__*/proxyCustomElement(LoadingScreen, [1,"vm-loading-screen",{"playbackReady":[4,"playback-ready"],"hideDots":[4,"hide-dots"]}]);
const VmMenu = /*@__PURE__*/proxyCustomElement(Menu, [1,"vm-menu",{"active":[1540],"identifier":[1],"controller":[16],"slideInDirection":[1,"slide-in-direction"],"activeMenuItem":[32],"activeSubmenu":[32]},[[0,"vmOpenSubmenu","onOpenSubmenu"],[0,"vmCloseSubmenu","onCloseSubmenu"],[8,"click","onWindowClick"],[8,"keydown","onWindowKeyDown"]]]);
const VmMenuItem = /*@__PURE__*/proxyCustomElement(MenuItem, [1,"vm-menu-item",{"identifier":[1],"hidden":[4],"label":[1],"menu":[16],"expanded":[4],"checked":[4],"hint":[1],"badge":[1],"checkIcon":[1,"check-icon"],"icons":[1],"isTouch":[4,"is-touch"],"showTapHighlight":[32]}]);
const VmMenuRadio = /*@__PURE__*/proxyCustomElement(MenuRadio, [1,"vm-menu-radio",{"label":[1],"value":[1],"checked":[1028],"badge":[1],"checkIcon":[1,"check-icon"],"icons":[1]}]);
const VmMenuRadioGroup = /*@__PURE__*/proxyCustomElement(MenuRadioGroup, [1,"vm-menu-radio-group",{"value":[1025]},[[0,"vmCheck","onSelectionChange"]]]);
const VmMuteControl = /*@__PURE__*/proxyCustomElement(MuteControl, [1,"vm-mute-control",{"lowVolumeIcon":[1,"low-volume-icon"],"highVolumeIcon":[1,"high-volume-icon"],"mutedIcon":[1,"muted-icon"],"icons":[1],"tooltipPosition":[1,"tooltip-position"],"tooltipDirection":[1,"tooltip-direction"],"hideTooltip":[4,"hide-tooltip"],"keys":[1],"volume":[2],"muted":[4],"i18n":[16]}]);
const VmPipControl = /*@__PURE__*/proxyCustomElement(PiPControl, [1,"vm-pip-control",{"enterIcon":[1,"enter-icon"],"exitIcon":[1,"exit-icon"],"icons":[1],"tooltipPosition":[1,"tooltip-position"],"tooltipDirection":[1,"tooltip-direction"],"hideTooltip":[4,"hide-tooltip"],"keys":[1],"isPiPActive":[4,"is-pi-p-active"],"i18n":[16],"playbackReady":[4,"playback-ready"],"canSetPiP":[32]}]);
const VmPlaybackControl = /*@__PURE__*/proxyCustomElement(PlaybackControl, [1,"vm-playback-control",{"playIcon":[1,"play-icon"],"pauseIcon":[1,"pause-icon"],"icons":[1],"tooltipPosition":[1,"tooltip-position"],"tooltipDirection":[1,"tooltip-direction"],"hideTooltip":[4,"hide-tooltip"],"keys":[1],"paused":[4],"i18n":[16]}]);
const VmPlayer = /*@__PURE__*/proxyCustomElement(Player, [1,"vm-player",{"logger":[16],"theme":[513],"icons":[513],"paused":[1028],"playing":[1028],"duration":[1026],"mediaTitle":[1025,"media-title"],"currentProvider":[1025,"current-provider"],"currentSrc":[1025,"current-src"],"currentPoster":[1025,"current-poster"],"currentTime":[1026,"current-time"],"autoplay":[4],"ready":[1540],"playbackReady":[1028,"playback-ready"],"loop":[4],"muted":[1028],"buffered":[1026],"playbackRate":[1026,"playback-rate"],"playbackRates":[1040],"playbackQuality":[1025,"playback-quality"],"playbackQualities":[1040],"seeking":[1028],"debug":[4],"playbackStarted":[1028,"playback-started"],"playbackEnded":[1028,"playback-ended"],"buffering":[1028],"controls":[4],"isControlsActive":[4,"is-controls-active"],"isSettingsActive":[1028,"is-settings-active"],"volume":[1026],"isFullscreenActive":[1028,"is-fullscreen-active"],"aspectRatio":[1025,"aspect-ratio"],"viewType":[1025,"view-type"],"isAudioView":[1028,"is-audio-view"],"isVideoView":[1028,"is-video-view"],"mediaType":[1025,"media-type"],"isAudio":[1028,"is-audio"],"isVideo":[1028,"is-video"],"isLive":[1028,"is-live"],"isMobile":[1028,"is-mobile"],"isTouch":[1028,"is-touch"],"isPiPActive":[1028,"is-pi-p-active"],"textTracks":[16],"currentTextTrack":[2,"current-text-track"],"isTextTrackVisible":[4,"is-text-track-visible"],"shouldRenderNativeTextTracks":[4,"should-render-native-text-tracks"],"audioTracks":[16],"currentAudioTrack":[2,"current-audio-track"],"autopause":[4],"playsinline":[4],"language":[1025],"translations":[1040],"languages":[1040],"i18n":[1040],"container":[32]},[[0,"vmError","onError"]]]);
const VmPoster = /*@__PURE__*/proxyCustomElement(Poster, [1,"vm-poster",{"fit":[1],"isVideoView":[4,"is-video-view"],"currentPoster":[1,"current-poster"],"mediaTitle":[1,"media-title"],"playbackStarted":[4,"playback-started"],"currentTime":[2,"current-time"],"isHidden":[32],"isActive":[32],"hasLoaded":[32]}]);
const VmScrim = /*@__PURE__*/proxyCustomElement(Scrim, [1,"vm-scrim",{"gradient":[1],"isVideoView":[4,"is-video-view"],"isControlsActive":[4,"is-controls-active"]}]);
const VmScrubberControl = /*@__PURE__*/proxyCustomElement(ScrubberControl, [1,"vm-scrubber-control",{"alwaysShowHours":[4,"always-show-hours"],"hideTooltip":[4,"hide-tooltip"],"currentTime":[2,"current-time"],"duration":[2],"noKeyboard":[4,"no-keyboard"],"buffering":[4],"buffered":[2],"i18n":[16],"timestamp":[32],"endTime":[32]}]);
const VmSettings = /*@__PURE__*/proxyCustomElement(Settings, [1,"vm-settings",{"pin":[513],"active":[1540],"isMobile":[4,"is-mobile"],"isAudioView":[4,"is-audio-view"],"menuHeight":[32]}]);
const VmSettingsControl = /*@__PURE__*/proxyCustomElement(SettingsControl, [1,"vm-settings-control",{"icon":[1],"icons":[1],"tooltipPosition":[1,"tooltip-position"],"tooltipDirection":[1,"tooltip-direction"],"menu":[1],"expanded":[4],"i18n":[16],"hideTooltip":[4,"hide-tooltip"],"vmSettings":[32]}]);
const VmSkeleton = /*@__PURE__*/proxyCustomElement(Skeleton, [1,"vm-skeleton",{"effect":[1],"ready":[4],"hidden":[32]}]);
const VmSlider = /*@__PURE__*/proxyCustomElement(Slider, [1,"vm-slider",{"step":[2],"min":[2],"max":[2],"value":[2],"valueText":[1,"value-text"],"label":[1]}]);
const VmSpinner = /*@__PURE__*/proxyCustomElement(Spinner, [1,"vm-spinner",{"isVideoView":[4,"is-video-view"],"currentProvider":[1,"current-provider"],"showWhenMediaLoading":[4,"show-when-media-loading"],"playbackReady":[4,"playback-ready"],"buffering":[4],"isHidden":[32],"isActive":[32]}]);
const VmSubmenu = /*@__PURE__*/proxyCustomElement(Submenu, [1,"vm-submenu",{"label":[1],"hint":[1],"slideInDirection":[1,"slide-in-direction"],"active":[1540],"menu":[32],"controller":[32]}]);
const VmTime = /*@__PURE__*/proxyCustomElement(Time, [1,"vm-time",{"label":[1],"seconds":[2],"alwaysShowHours":[4,"always-show-hours"]}]);
const VmTimeProgress = /*@__PURE__*/proxyCustomElement(TimeProgress, [1,"vm-time-progress",{"separator":[1],"alwaysShowHours":[4,"always-show-hours"]}]);
const VmTooltip = /*@__PURE__*/proxyCustomElement(Tooltip, [1,"vm-tooltip",{"hidden":[4],"active":[4],"position":[1],"direction":[1],"isTouch":[4,"is-touch"],"isMobile":[4,"is-mobile"]}]);
const VmUi = /*@__PURE__*/proxyCustomElement(UI, [1,"vm-ui",{"isVideoView":[4,"is-video-view"],"playsinline":[4],"isFullscreenActive":[4,"is-fullscreen-active"]}]);
const VmVideo = /*@__PURE__*/proxyCustomElement(Video, [4,"vm-video",{"willAttach":[4,"will-attach"],"hasCustomTextManager":[4,"has-custom-text-manager"],"crossOrigin":[1,"cross-origin"],"preload":[1],"poster":[1],"controlsList":[1,"controls-list"],"autoPiP":[4,"auto-pip"],"disablePiP":[4,"disable-pip"],"disableRemotePlayback":[4,"disable-remote-playback"],"mediaTitle":[1,"media-title"]},[[0,"vmMediaProviderConnect","onProviderConnect"],[0,"vmMediaProviderDisconnect","onProviderDisconnect"]]]);
const VmVimeo = /*@__PURE__*/proxyCustomElement(Vimeo, [1,"vm-vimeo",{"videoId":[1,"video-id"],"byline":[4],"color":[1],"portrait":[4],"noAutoAspectRatio":[4,"no-auto-aspect-ratio"],"poster":[1],"cookies":[4],"language":[1],"aspectRatio":[1,"aspect-ratio"],"autoplay":[4],"controls":[4],"logger":[16],"loop":[4],"muted":[4],"playsinline":[4],"embedSrc":[32],"mediaTitle":[32]}]);
const VmVolumeControl = /*@__PURE__*/proxyCustomElement(VolumeControl, [1,"vm-volume-control",{"lowVolumeIcon":[1,"low-volume-icon"],"highVolumeIcon":[1,"high-volume-icon"],"mutedIcon":[1,"muted-icon"],"icons":[1],"tooltipPosition":[1,"tooltip-position"],"tooltipDirection":[1,"tooltip-direction"],"hideTooltip":[4,"hide-tooltip"],"muteKeys":[1,"mute-keys"],"noKeyboard":[4,"no-keyboard"],"muted":[4],"volume":[2],"isMobile":[4,"is-mobile"],"i18n":[16],"currentVolume":[32],"isSliderActive":[32]}]);
const VmYoutube = /*@__PURE__*/proxyCustomElement(YouTube, [1,"vm-youtube",{"cookies":[4],"videoId":[1,"video-id"],"showFullscreenControl":[4,"show-fullscreen-control"],"poster":[1],"language":[1],"autoplay":[4],"controls":[4],"logger":[16],"loop":[4],"muted":[4],"playsinline":[4],"embedSrc":[32],"mediaTitle":[32]}]);
const defineCustomElements = (opts) => {
  if (typeof customElements !== 'undefined') {
    [
      VmAudio,
  VmCaptionControl,
  VmCaptions,
  VmClickToPlay,
  VmControl,
  VmControlGroup,
  VmControlSpacer,
  VmControls,
  VmCurrentTime,
  VmDailymotion,
  VmDash,
  VmDblClickFullscreen,
  VmDefaultControls,
  VmDefaultSettings,
  VmDefaultUi,
  VmEmbed,
  VmEndTime,
  VmFile,
  VmFullscreenControl,
  VmHls,
  VmIcon,
  VmIconLibrary,
  VmLiveIndicator,
  VmLoadingScreen,
  VmMenu,
  VmMenuItem,
  VmMenuRadio,
  VmMenuRadioGroup,
  VmMuteControl,
  VmPipControl,
  VmPlaybackControl,
  VmPlayer,
  VmPoster,
  VmScrim,
  VmScrubberControl,
  VmSettings,
  VmSettingsControl,
  VmSkeleton,
  VmSlider,
  VmSpinner,
  VmSubmenu,
  VmTime,
  VmTimeProgress,
  VmTooltip,
  VmUi,
  VmVideo,
  VmVimeo,
  VmVolumeControl,
  VmYoutube
    ].forEach(cmp => {
      if (!customElements.get(cmp.is)) {
        customElements.define(cmp.is, cmp, opts);
      }
    });
  }
};

export { COMPONENT_NAME_KEY, MediaType, PLAYER_KEY, Provider, REGISTRATION_KEY, REGISTRY_KEY, ViewType, VmAudio, VmCaptionControl, VmCaptions, VmClickToPlay, VmControl, VmControlGroup, VmControlSpacer, VmControls, VmCurrentTime, VmDailymotion, VmDash, VmDblClickFullscreen, VmDefaultControls, VmDefaultSettings, VmDefaultUi, VmEmbed, VmEndTime, VmFile, VmFullscreenControl, VmHls, VmIcon, VmIconLibrary, VmLiveIndicator, VmLoadingScreen, VmMenu, VmMenuItem, VmMenuRadio, VmMenuRadioGroup, VmMuteControl, VmPipControl, VmPlaybackControl, VmPlayer, VmPoster, VmScrim, VmScrubberControl, VmSettings, VmSettingsControl, VmSkeleton, VmSlider, VmSpinner, VmSubmenu, VmTime, VmTimeProgress, VmTooltip, VmUi, VmVideo, VmVimeo, VmVolumeControl, VmYoutube, createDispatcher, defineCustomElements, findPlayer, getComponentFromRegistry, getPlayerFromRegistry, initialState, isComponentRegistered, isWritableProp, usePlayerContext, watchComponentRegistry, withComponentRegistry, withPlayerContext };

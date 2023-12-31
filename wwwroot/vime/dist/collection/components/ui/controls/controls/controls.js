var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
import { Component, h, Host, Prop, State, Watch } from '@stencil/core';
import { Disposal } from '../../../../utils/Disposal';
import { listen } from '../../../../utils/dom';
import { debounce } from '../../../../utils/timing';
import { isUndefined } from '../../../../utils/unit';
import { findPlayer } from '../../../core/player/findPlayer';
import { createDispatcher, } from '../../../core/player/PlayerDispatcher';
import { withComponentRegistry } from '../../../core/player/withComponentRegistry';
import { withPlayerContext } from '../../../core/player/withPlayerContext';
import { registerControlsForCollisionDetection } from './withControlsCollisionDetection';
/**
 * We want to keep the controls active state in-sync per player.
 */
const playerRef = {};
const hideControlsTimeout = {};
/**
 * Responsible for positioning and laying out individual/groups of controls.
 *
 * ## Visual
 *
 * <img
 *   src="https://raw.githubusercontent.com/vime-js/vime/master/packages/core/src/components/ui/controls/controls/controls.png"
 *   alt="Vime controls component"
 * />
 *
 * @slot - Used to pass in controls.
 */
export class Controls {
  constructor() {
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
    return __awaiter(this, void 0, void 0, function* () {
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
    return (h(Host, { video: !this.isAudioView },
      h("div", { style: Object.assign(Object.assign({}, this.getPosition()), { flexDirection: this.direction, alignItems: this.align === 'center' ? 'center' : `flex-${this.align}`, justifyContent: this.justify }), class: {
          controls: true,
          audio: this.isAudioView,
          hidden: this.hidden,
          active: this.playbackReady && this.isControlsActive,
          fullWidth: this.isAudioView || this.fullWidth,
          fullHeight: !this.isAudioView && this.fullHeight,
        }, onMouseEnter: this.onStartInteraction.bind(this), onMouseLeave: this.onEndInteraction.bind(this), onTouchStart: this.onStartInteraction.bind(this), onTouchEnd: this.onEndInteraction.bind(this) },
        h("slot", null))));
  }
  static get is() { return "vm-controls"; }
  static get encapsulation() { return "shadow"; }
  static get originalStyleUrls() { return {
    "$": ["controls.css"]
  }; }
  static get styleUrls() { return {
    "$": ["controls.css"]
  }; }
  static get properties() { return {
    "hidden": {
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
        "text": "Whether the controls are visible or not."
      },
      "attribute": "hidden",
      "reflect": false,
      "defaultValue": "false"
    },
    "fullWidth": {
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
        "text": "Whether the controls container should be 100% width. This has no effect if the view is of\ntype `audio`."
      },
      "attribute": "full-width",
      "reflect": false,
      "defaultValue": "false"
    },
    "fullHeight": {
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
        "text": "Whether the controls container should be 100% height. This has no effect if the view is of\ntype `audio`."
      },
      "attribute": "full-height",
      "reflect": false,
      "defaultValue": "false"
    },
    "direction": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "'row' | 'column'",
        "resolved": "\"column\" | \"row\"",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "Sets the `flex-direction` property that manages the direction in which the controls are layed\nout."
      },
      "attribute": "direction",
      "reflect": false,
      "defaultValue": "'row'"
    },
    "align": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "'start' | 'center' | 'end'",
        "resolved": "\"center\" | \"end\" | \"start\"",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "Sets the `align-items` flex property that aligns the individual controls on the cross-axis."
      },
      "attribute": "align",
      "reflect": false,
      "defaultValue": "'center'"
    },
    "justify": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "| 'start'\n    | 'center'\n    | 'end'\n    | 'flex-end'\n    | 'space-around'\n    | 'space-between'\n    | 'space-evenly'",
        "resolved": "\"center\" | \"end\" | \"flex-end\" | \"space-around\" | \"space-between\" | \"space-evenly\" | \"start\"",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "Sets the `justify-content` flex property that aligns the individual controls on the main-axis."
      },
      "attribute": "justify",
      "reflect": false,
      "defaultValue": "'start'"
    },
    "pin": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center'",
        "resolved": "\"bottomLeft\" | \"bottomRight\" | \"center\" | \"topLeft\" | \"topRight\"",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "Pins the controls to the defined position inside the video player. This has no effect when\nthe view is of type `audio`."
      },
      "attribute": "pin",
      "reflect": true,
      "defaultValue": "'bottomLeft'"
    },
    "activeDuration": {
      "type": "number",
      "mutable": false,
      "complexType": {
        "original": "number",
        "resolved": "number",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "The length in milliseconds that the controls are active for before fading out. Audio players\nare not effected by this prop."
      },
      "attribute": "active-duration",
      "reflect": false,
      "defaultValue": "2750"
    },
    "waitForPlaybackStart": {
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
        "text": "Whether the controls should wait for playback to start before being shown. Audio players\nare not effected by this prop."
      },
      "attribute": "wait-for-playback-start",
      "reflect": false,
      "defaultValue": "false"
    },
    "hideWhenPaused": {
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
        "text": "Whether the controls should show/hide when paused. Audio players are not effected by this prop."
      },
      "attribute": "hide-when-paused",
      "reflect": false,
      "defaultValue": "false"
    },
    "hideOnMouseLeave": {
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
        "text": "Whether the controls should hide when the mouse leaves the player. Audio players are not\neffected by this prop."
      },
      "attribute": "hide-on-mouse-leave",
      "reflect": false,
      "defaultValue": "false"
    },
    "isAudioView": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "PlayerProps['isAudioView']",
        "resolved": "boolean",
        "references": {
          "PlayerProps": {
            "location": "import",
            "path": "../../../core/player/PlayerProps"
          }
        }
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
      "attribute": "is-audio-view",
      "reflect": false,
      "defaultValue": "false"
    },
    "isSettingsActive": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "PlayerProps['isSettingsActive']",
        "resolved": "boolean",
        "references": {
          "PlayerProps": {
            "location": "import",
            "path": "../../../core/player/PlayerProps"
          }
        }
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
      "attribute": "is-settings-active",
      "reflect": false,
      "defaultValue": "false"
    },
    "playbackReady": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "PlayerProps['playbackReady']",
        "resolved": "boolean",
        "references": {
          "PlayerProps": {
            "location": "import",
            "path": "../../../core/player/PlayerProps"
          }
        }
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
      "attribute": "playback-ready",
      "reflect": false,
      "defaultValue": "false"
    },
    "isControlsActive": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "PlayerProps['isControlsActive']",
        "resolved": "boolean",
        "references": {
          "PlayerProps": {
            "location": "import",
            "path": "../../../core/player/PlayerProps"
          }
        }
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
      "attribute": "is-controls-active",
      "reflect": false,
      "defaultValue": "false"
    },
    "paused": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "PlayerProps['paused']",
        "resolved": "boolean",
        "references": {
          "PlayerProps": {
            "location": "import",
            "path": "../../../core/player/PlayerProps"
          }
        }
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
      "attribute": "paused",
      "reflect": false,
      "defaultValue": "true"
    },
    "playbackStarted": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "PlayerProps['playbackStarted']",
        "resolved": "boolean",
        "references": {
          "PlayerProps": {
            "location": "import",
            "path": "../../../core/player/PlayerProps"
          }
        }
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
      "attribute": "playback-started",
      "reflect": false,
      "defaultValue": "false"
    }
  }; }
  static get states() { return {
    "isInteracting": {}
  }; }
  static get watchers() { return [{
      "propName": "paused",
      "methodName": "onControlsChange"
    }, {
      "propName": "hidden",
      "methodName": "onControlsChange"
    }, {
      "propName": "isAudioView",
      "methodName": "onControlsChange"
    }, {
      "propName": "isInteracting",
      "methodName": "onControlsChange"
    }, {
      "propName": "isSettingsActive",
      "methodName": "onControlsChange"
    }, {
      "propName": "hideWhenPaused",
      "methodName": "onControlsChange"
    }, {
      "propName": "hideOnMouseLeave",
      "methodName": "onControlsChange"
    }, {
      "propName": "playbackStarted",
      "methodName": "onControlsChange"
    }, {
      "propName": "waitForPlaybackStart",
      "methodName": "onControlsChange"
    }, {
      "propName": "playbackReady",
      "methodName": "onControlsChange"
    }]; }
}

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
import { Component, Element, h, Method, Prop, State, Watch, } from '@stencil/core';
import { isUndefined } from '../../../../utils/unit';
import { watchComponentRegistry, withComponentRegistry, } from '../../../core/player/withComponentRegistry';
import { withPlayerContext } from '../../../core/player/withPlayerContext';
let idCount = 0;
/**
 * A control for toggling the visiblity of the settings menu. This control is not displayed if no
 * settings (`vime-settings`) has been provided for the current player.
 *
 * ## Visual
 *
 * <img
 *   src="https://raw.githubusercontent.com/vime-js/vime/master/packages/core/src/components/ui/controls/settings-control/settings-control.png"
 *   alt="Vime settings control component"
 * />
 */
export class SettingsControl {
  constructor() {
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
    return __awaiter(this, void 0, void 0, function* () {
      (_a = this.control) === null || _a === void 0 ? void 0 : _a.focusControl();
    });
  }
  /**
   * Removes focus from the control.
   */
  blurControl() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      (_a = this.control) === null || _a === void 0 ? void 0 : _a.blurControl();
    });
  }
  render() {
    const hasSettings = !isUndefined(this.menu);
    return (h("div", { class: {
        settingsControl: true,
        hidden: !hasSettings,
        active: hasSettings && this.expanded,
      } },
      h("vm-control", { identifier: this.id, menu: this.menu, hidden: !hasSettings, expanded: this.expanded, label: this.i18n.settings, ref: control => {
          this.control = control;
        } },
        h("vm-icon", { name: this.icon, library: this.icons }),
        h("vm-tooltip", { hidden: this.hideTooltip || this.expanded, position: this.tooltipPosition, direction: this.tooltipDirection }, this.i18n.settings))));
  }
  static get is() { return "vm-settings-control"; }
  static get encapsulation() { return "shadow"; }
  static get originalStyleUrls() { return {
    "$": ["settings-control.css"]
  }; }
  static get styleUrls() { return {
    "$": ["settings-control.css"]
  }; }
  static get properties() { return {
    "icon": {
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
        "tags": [],
        "text": "The name of the settings icon to resolve from the icon library."
      },
      "attribute": "icon",
      "reflect": false,
      "defaultValue": "'settings'"
    },
    "icons": {
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
        "text": "The name of an icon library to use. Defaults to the library defined by the `icons` player\nproperty."
      },
      "attribute": "icons",
      "reflect": false
    },
    "tooltipPosition": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "TooltipPosition",
        "resolved": "\"bottom\" | \"top\"",
        "references": {
          "TooltipPosition": {
            "location": "import",
            "path": "../../tooltip/types"
          }
        }
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "Whether the tooltip is positioned above/below the control."
      },
      "attribute": "tooltip-position",
      "reflect": false,
      "defaultValue": "'top'"
    },
    "tooltipDirection": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "TooltipDirection",
        "resolved": "\"left\" | \"right\" | undefined",
        "references": {
          "TooltipDirection": {
            "location": "import",
            "path": "../../tooltip/types"
          }
        }
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "The direction in which the tooltip should grow."
      },
      "attribute": "tooltip-direction",
      "reflect": false
    },
    "menu": {
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
        "text": "The DOM `id` of the settings menu this control is responsible for opening/closing."
      },
      "attribute": "menu",
      "reflect": false
    },
    "expanded": {
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
        "text": "Whether the settings menu this control manages is open."
      },
      "attribute": "expanded",
      "reflect": false,
      "defaultValue": "false"
    },
    "i18n": {
      "type": "unknown",
      "mutable": false,
      "complexType": {
        "original": "PlayerProps['i18n']",
        "resolved": "Translation | { [x: string]: string; }",
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
      "defaultValue": "{}"
    },
    "hideTooltip": {
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
        "text": "Whether the tooltip should not be displayed."
      },
      "attribute": "hide-tooltip",
      "reflect": false,
      "defaultValue": "false"
    }
  }; }
  static get states() { return {
    "vmSettings": {}
  }; }
  static get methods() { return {
    "focusControl": {
      "complexType": {
        "signature": "() => Promise<void>",
        "parameters": [],
        "references": {
          "Promise": {
            "location": "global"
          }
        },
        "return": "Promise<void>"
      },
      "docs": {
        "text": "Focuses the control.",
        "tags": []
      }
    },
    "blurControl": {
      "complexType": {
        "signature": "() => Promise<void>",
        "parameters": [],
        "references": {
          "Promise": {
            "location": "global"
          }
        },
        "return": "Promise<void>"
      },
      "docs": {
        "text": "Removes focus from the control.",
        "tags": []
      }
    }
  }; }
  static get elementRef() { return "host"; }
  static get watchers() { return [{
      "propName": "vmSettings",
      "methodName": "onComponentsChange"
    }]; }
}

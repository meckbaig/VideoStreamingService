import { PlayerProps } from '../../../core/player/PlayerProps';
import { TooltipDirection, TooltipPosition } from '../../tooltip/types';
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
export declare class SettingsControl {
  private id;
  private control?;
  host: HTMLVmSettingsControlElement;
  vmSettings?: HTMLVmSettingsElement;
  onComponentsChange(): void;
  /**
   * The name of the settings icon to resolve from the icon library.
   */
  icon: string;
  /**
   * The name of an icon library to use. Defaults to the library defined by the `icons` player
   * property.
   */
  icons?: string;
  /**
   * Whether the tooltip is positioned above/below the control.
   */
  tooltipPosition: TooltipPosition;
  /**
   * The direction in which the tooltip should grow.
   */
  tooltipDirection: TooltipDirection;
  /**
   * The DOM `id` of the settings menu this control is responsible for opening/closing.
   */
  menu?: string;
  /**
   * Whether the settings menu this control manages is open.
   */
  expanded: boolean;
  /** @internal */
  i18n: PlayerProps['i18n'];
  /**
   * Whether the tooltip should not be displayed.
   */
  hideTooltip: boolean;
  constructor();
  connectedCallback(): void;
  /**
   * Focuses the control.
   */
  focusControl(): Promise<void>;
  /**
   * Removes focus from the control.
   */
  blurControl(): Promise<void>;
  render(): any;
}

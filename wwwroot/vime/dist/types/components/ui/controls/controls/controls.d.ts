import { PlayerProps } from '../../../core/player/PlayerProps';
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
export declare class Controls {
  private dispatch;
  private disposal;
  isInteracting: boolean;
  /**
   * Whether the controls are visible or not.
   */
  hidden: boolean;
  /**
   * Whether the controls container should be 100% width. This has no effect if the view is of
   * type `audio`.
   */
  fullWidth: boolean;
  /**
   * Whether the controls container should be 100% height. This has no effect if the view is of
   * type `audio`.
   */
  fullHeight: boolean;
  /**
   * Sets the `flex-direction` property that manages the direction in which the controls are layed
   * out.
   */
  direction: 'row' | 'column';
  /**
   * Sets the `align-items` flex property that aligns the individual controls on the cross-axis.
   */
  align: 'start' | 'center' | 'end';
  /**
   * Sets the `justify-content` flex property that aligns the individual controls on the main-axis.
   */
  justify: 'start' | 'center' | 'end' | 'flex-end' | 'space-around' | 'space-between' | 'space-evenly';
  /**
   * Pins the controls to the defined position inside the video player. This has no effect when
   * the view is of type `audio`.
   */
  pin: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center';
  /**
   * The length in milliseconds that the controls are active for before fading out. Audio players
   * are not effected by this prop.
   */
  activeDuration: number;
  /**
   * Whether the controls should wait for playback to start before being shown. Audio players
   * are not effected by this prop.
   */
  waitForPlaybackStart: boolean;
  /**
   * Whether the controls should show/hide when paused. Audio players are not effected by this prop.
   */
  hideWhenPaused: boolean;
  /**
   * Whether the controls should hide when the mouse leaves the player. Audio players are not
   * effected by this prop.
   */
  hideOnMouseLeave: boolean;
  /** @internal */
  isAudioView: PlayerProps['isAudioView'];
  /** @internal */
  isSettingsActive: PlayerProps['isSettingsActive'];
  /** @internal */
  playbackReady: PlayerProps['playbackReady'];
  /** @internal */
  isControlsActive: PlayerProps['isControlsActive'];
  /** @internal */
  paused: PlayerProps['paused'];
  /** @internal */
  playbackStarted: PlayerProps['playbackStarted'];
  constructor();
  connectedCallback(): void;
  componentWillLoad(): void;
  disconnectedCallback(): void;
  private setupPlayerListeners;
  private show;
  private hide;
  private hideWithDelay;
  private onControlsChange;
  private getPosition;
  private onStartInteraction;
  private onEndInteraction;
  render(): any;
}

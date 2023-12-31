import { EventEmitter } from '../../../stencil-public-runtime';
import { Logger } from '../../core/player/PlayerLogger';
import { MediaProvider } from '../MediaProvider';
/**
 * Enables loading, playing and controlling videos from [Vimeo](https://www.vimeo.com).
 *
 * > You don't interact with this component for passing player properties, controlling playback,
 * listening to player events and so on, that is all done through the `vime-player` component.
 */
export declare class Vimeo implements MediaProvider<HTMLVmEmbedElement> {
  private embed;
  private dispatch;
  private initialMuted;
  private fetchVideoInfo?;
  private pendingDurationCall?;
  private pendingMediaTitleCall?;
  private defaultInternalState;
  private volume;
  private hasLoaded;
  private pendingPlayRequest?;
  private internalState;
  embedSrc: string;
  mediaTitle: string;
  /**
   * The Vimeo resource ID of the video to load.
   */
  videoId: string;
  onVideoIdChange(): void;
  /**
   * Whether to display the video owner's name.
   */
  byline: boolean;
  /**
   * The hexadecimal color value of the playback controls. The embed settings of the video
   * might override this value.
   */
  color?: string;
  /**
   * Whether to display the video owner's portrait.
   */
  portrait: boolean;
  /**
   * Turns off automatically determining the aspect ratio of the current video.
   */
  noAutoAspectRatio: boolean;
  /**
   * The absolute URL of a custom poster to be used for the current video.
   */
  poster?: string;
  /**
   * Whether cookies should be enabled on the embed.
   */
  cookies: boolean;
  onCustomPosterChange(): void;
  /** @internal */
  language: string;
  /** @internal */
  aspectRatio: string;
  /** @internal */
  autoplay: boolean;
  /** @internal */
  controls: boolean;
  /** @internal */
  logger?: Logger;
  /** @internal */
  loop: boolean;
  /** @internal */
  muted: boolean;
  /** @internal */
  playsinline: boolean;
  /** @internal */
  vmLoadStart: EventEmitter<void>;
  /**
   * Emitted when an error has occurred.
   */
  vmError: EventEmitter<any>;
  constructor();
  connectedCallback(): void;
  componentWillLoad(): void;
  disconnectedCallback(): void;
  private getOrigin;
  private getPreconnections;
  private remoteControl;
  private buildParams;
  private getVideoInfo;
  private onTimeChange;
  private timeRAF?;
  private cancelTimeUpdates;
  private requestTimeUpdates;
  private onSeeked;
  private onVimeoMethod;
  private onLoaded;
  private onVimeoEvent;
  private onEmbedSrcChange;
  private onEmbedMessage;
  private adjustPosition;
  /** @internal */
  getAdapter(): Promise<{
    getInternalPlayer: () => Promise<HTMLVmEmbedElement>;
    play: () => Promise<void>;
    pause: () => Promise<void>;
    canPlay: (type: any) => Promise<boolean>;
    setCurrentTime: (time: number) => Promise<void>;
    setMuted: (muted: boolean) => Promise<void>;
    setVolume: (volume: number) => Promise<void>;
    canSetPlaybackRate: () => Promise<boolean>;
    setPlaybackRate: (rate: number) => Promise<void>;
  }>;
  render(): any;
}

import { EventEmitter } from '../../../stencil-public-runtime';
import { Logger } from '../../core/player/PlayerLogger';
import { MediaProvider } from '../MediaProvider';
/**
 * Enables loading, playing and controlling videos from [YouTube](https://www.youtube.com).
 *
 * > You don't interact with this component for passing player properties, controlling playback,
 * listening to player events and so on, that is all done through the `vime-player` component.
 */
export declare class YouTube implements MediaProvider<HTMLVmEmbedElement> {
  private embed;
  private dispatch;
  private defaultInternalState;
  private internalState;
  private initialMuted;
  private fetchPosterURL?;
  embedSrc: string;
  mediaTitle: string;
  /**
   * Whether cookies should be enabled on the embed.
   */
  cookies: boolean;
  /**
   * The YouTube resource ID of the video to load.
   */
  videoId: string;
  onVideoIdChange(): void;
  /**
   * Whether the fullscreen control should be shown.
   */
  showFullscreenControl: boolean;
  /**
   * The absolute URL of a custom poster to be used for the current video.
   */
  poster?: string;
  onCustomPosterChange(): void;
  /** @internal */
  language: string;
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
  constructor();
  connectedCallback(): void;
  componentWillLoad(): void;
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
  private getOrigin;
  private getPreconnections;
  private remoteControl;
  private buildParams;
  private onEmbedSrcChange;
  private onEmbedLoaded;
  private findPosterURL;
  private onCued;
  private onPlayerStateChange;
  private calcCurrentTime;
  private onTimeChange;
  private onBufferedChange;
  private onEmbedMessage;
  render(): any;
}

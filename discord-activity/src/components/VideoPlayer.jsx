import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import Hls from 'hls.js';

const VideoPlayer = forwardRef(({ streamUrl, isHost, onPlay, onPause, onSeek, onRateChange, onReady }, ref) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const hlsRef = useRef(null);
  const seekingRef = useRef(false);

  useImperativeHandle(ref, () => ({
    play: () => {
      if (playerRef.current) {
        playerRef.current.play();
      }
    },
    pause: () => {
      if (playerRef.current) {
        playerRef.current.pause();
      }
    },
    get currentTime() {
      return playerRef.current?.currentTime() || 0;
    },
    set currentTime(time) {
      if (playerRef.current) {
        seekingRef.current = true;
        playerRef.current.currentTime(time);
        setTimeout(() => {
          seekingRef.current = false;
        }, 100);
      }
    },
    get playbackRate() {
      return playerRef.current?.playbackRate() || 1;
    },
    set playbackRate(rate) {
      if (playerRef.current) {
        playerRef.current.playbackRate(rate);
      }
    },
  }));

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize Video.js player
    const player = videojs(videoRef.current, {
      controls: isHost,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      responsive: true,
      aspectRatio: '16:9',
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'playbackRateMenuButton',
          'fullscreenToggle',
        ],
      },
    });

    playerRef.current = player;

    // Check if URL is HLS
    const isHLS = streamUrl.includes('.m3u8');

    if (isHLS && Hls.isSupported()) {
      // Use HLS.js for HLS streams
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed');
        onReady?.();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Fatal network error, trying to recover');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Fatal media error, trying to recover');
              hls.recoverMediaError();
              break;
            default:
              console.log('Fatal error, cannot recover');
              hls.destroy();
              break;
          }
        }
      });
    } else {
      // Use native video player for direct URLs
      player.src({
        src: streamUrl,
        type: 'video/mp4',
      });

      player.ready(() => {
        onReady?.();
      });
    }

    // Only host can control playback
    if (isHost) {
      // Play event
      player.on('play', () => {
        onPlay?.();
      });

      // Pause event
      player.on('pause', () => {
        onPause?.();
      });

      // Seek event
      player.on('seeked', () => {
        if (!seekingRef.current) {
          onSeek?.(player.currentTime());
        }
      });

      // Rate change event
      player.on('ratechange', () => {
        onRateChange?.(player.playbackRate());
      });
    } else {
      // Non-hosts cannot interact with controls
      player.controls(false);
    }

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [streamUrl, isHost, onPlay, onPause, onSeek, onRateChange, onReady]);

  return (
    <div className="video-player-wrapper">
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
          playsInline
        />
      </div>
      {!isHost && (
        <div className="viewer-overlay">
          <p>🔒 Playback controlled by host</p>
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;

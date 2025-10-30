import { useState, useEffect, useRef } from 'react';
import { DiscordSDK } from '@discord/embedded-app-sdk';
import VideoPlayer from './components/VideoPlayer';
import ParticipantsList from './components/ParticipantsList';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import './App.css';

function App() {
  const [discordSdk, setDiscordSdk] = useState(null);
  const [auth, setAuth] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movieTitle, setMovieTitle] = useState('Watch Party');
  const [videoReady, setVideoReady] = useState(false);
  
  const playerRef = useRef(null);
  const hostIdRef = useRef(null);

  // Initialize Discord SDK
  useEffect(() => {
    const initDiscord = async () => {
      try {
        const sdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
        await sdk.ready();
        
        setDiscordSdk(sdk);

        // Authenticate
        const { code } = await sdk.commands.authorize({
          client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
          response_type: 'code',
          state: '',
          prompt: 'none',
          scope: ['identify', 'guilds'],
        });

        // Exchange code for access token
        const response = await fetch('/.proxy/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
          }),
        });

        const { access_token } = await response.json();

        // Authenticate with Discord
        const authResponse = await sdk.commands.authenticate({
          access_token,
        });

        setAuth(authResponse);

        // Get stream URL from query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const encodedUrl = urlParams.get('streamUrl');
        const title = urlParams.get('title');
        
        if (encodedUrl) {
          const decodedUrl = decodeURIComponent(encodedUrl);
          setStreamUrl(decodedUrl);
          if (title) {
            setMovieTitle(decodeURIComponent(title));
          }
        } else {
          throw new Error('No stream URL provided');
        }

        // Get participants
        const instanceParticipants = await sdk.commands.getInstanceConnectedParticipants();
        const allParticipants = instanceParticipants.participants || [];
        setParticipants(allParticipants);

        // Determine host (first person to join)
        if (allParticipants.length > 0) {
          const sortedParticipants = [...allParticipants].sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
          );
          hostIdRef.current = sortedParticipants[0].id;
          setIsHost(authResponse.user.id === hostIdRef.current);
        } else {
          hostIdRef.current = authResponse.user.id;
          setIsHost(true);
        }

        // Subscribe to participant updates
        sdk.subscribe('ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE', ({ participants: updatedParticipants }) => {
          setParticipants(updatedParticipants);
          
          // Update host if needed
          if (updatedParticipants.length > 0 && !hostIdRef.current) {
            const sortedParticipants = [...updatedParticipants].sort((a, b) => 
              new Date(a.timestamp) - new Date(b.timestamp)
            );
            hostIdRef.current = sortedParticipants[0].id;
            setIsHost(authResponse.user.id === hostIdRef.current);
          }
        });

        setLoading(false);
      } catch (err) {
        console.error('Error initializing Discord SDK:', err);
        setError(err.message || 'Failed to initialize Discord Activity');
        setLoading(false);
      }
    };

    initDiscord();
  }, []);

  // Sync playback state across participants
  useEffect(() => {
    if (!discordSdk || !playerRef.current) return;

    // Subscribe to commands from other participants
    const handleCommand = (command) => {
      if (!playerRef.current) return;

      switch (command.type) {
        case 'PLAY':
          playerRef.current.play();
          break;
        case 'PAUSE':
          playerRef.current.pause();
          break;
        case 'SEEK':
          playerRef.current.currentTime = command.time;
          break;
        case 'RATE':
          playerRef.current.playbackRate = command.rate;
          break;
        default:
          break;
      }
    };

    // Listen for activity messages
    discordSdk.subscribe('ACTIVITY_MESSAGE', (message) => {
      if (message.user_id !== auth?.user?.id) {
        handleCommand(message.data);
      }
    });

    return () => {
      // Cleanup subscriptions
    };
  }, [discordSdk, auth]);

  // Send command to all participants
  const sendCommand = (command) => {
    if (!discordSdk || !isHost) return;

    discordSdk.commands.sendActivityMessage({
      type: 'ACTIVITY_MESSAGE',
      data: command,
    }).catch(err => {
      console.error('Error sending command:', err);
    });
  };

  // Video event handlers (only host sends commands)
  const handlePlay = () => {
    if (isHost) {
      sendCommand({ type: 'PLAY' });
    }
  };

  const handlePause = () => {
    if (isHost) {
      sendCommand({ type: 'PAUSE' });
    }
  };

  const handleSeek = (time) => {
    if (isHost) {
      sendCommand({ type: 'SEEK', time });
    }
  };

  const handleRateChange = (rate) => {
    if (isHost) {
      sendCommand({ type: 'RATE', rate });
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <div className="app">
      <div className="app-header">
        <div className="title-container">
          <div className="movie-icon">🎬</div>
          <h1 className="movie-title">{movieTitle}</h1>
          {isHost && <span className="host-badge">HOST</span>}
        </div>
        <ParticipantsList 
          participants={participants}
          currentUserId={auth?.user?.id}
          hostId={hostIdRef.current}
        />
      </div>

      <div className="video-container">
        <VideoPlayer
          ref={playerRef}
          streamUrl={streamUrl}
          isHost={isHost}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeek={handleSeek}
          onRateChange={handleRateChange}
          onReady={() => setVideoReady(true)}
        />
      </div>

      {videoReady && (
        <div className="info-bar">
          <div className="sync-status">
            <span className="sync-indicator">🔄</span>
            <span>Synced with {participants.length} {participants.length === 1 ? 'viewer' : 'viewers'}</span>
          </div>
          {!isHost && (
            <div className="viewer-notice">
              <span>⚠️ Playback controlled by host</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

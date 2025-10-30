import './ParticipantsList.css';

function ParticipantsList({ participants, currentUserId, hostId }) {
  return (
    <div className="participants-list">
      <div className="participants-header">
        <span className="participants-icon">👥</span>
        <span className="participants-count">{participants.length}</span>
      </div>
      <div className="participants-dropdown">
        {participants.map((participant) => (
          <div key={participant.id} className="participant-item">
            <div className="participant-avatar">
              {participant.avatar ? (
                <img
                  src={`https://cdn.discordapp.com/avatars/${participant.id}/${participant.avatar}.png`}
                  alt={participant.username}
                />
              ) : (
                <div className="default-avatar">
                  {participant.username?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="participant-info">
              <span className="participant-name">
                {participant.username || 'Unknown'}
                {participant.id === currentUserId && ' (You)'}
              </span>
              {participant.id === hostId && (
                <span className="participant-host-badge">Host</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ParticipantsList;

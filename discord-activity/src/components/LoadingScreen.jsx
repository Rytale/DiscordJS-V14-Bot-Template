import './LoadingScreen.css';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2>Loading Watch Party...</h2>
        <p>Connecting to Discord Activity</p>
      </div>
    </div>
  );
}

export default LoadingScreen;

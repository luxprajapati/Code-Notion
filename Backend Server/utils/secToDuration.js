// Helper Function to convert totalDurationInSeconds to HH:MM:SS format

exports.convertSecondsToDuration = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor((totalSeconds % 3600) % 60);

  if (hours > 0) {
    return `${hours}h  ${minutes}m  ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m  ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

import React, { useRef, useState, useEffect } from "react";
import { FaPlay, FaPause, FaTimes } from "react-icons/fa";

const AudioModal = ({ audioSrc, onClose }) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const setAudioDuration = () => setDuration(audio.duration);

      audio.addEventListener("timeupdate", updateTime);
      audio.addEventListener("loadedmetadata", setAudioDuration);

      return () => {
        audio.removeEventListener("timeupdate", updateTime);
        audio.removeEventListener("loadedmetadata", setAudioDuration);
      };
    }
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Format time in MM:SS
  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 flex flex-col items-center">
        
        <h2 className="text-xl font-semibold mb-3">Audio Playback</h2>

        <audio ref={audioRef} src={audioSrc} />

        {/* Progress Bar */}
        <div className="w-full flex items-center space-x-2 mt-3">
          <span className="text-sm">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleTimeChange}
            className="w-full"
          />
          <span className="text-sm">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4 mt-4">
          <button
            onClick={togglePlayPause}
            className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition"
          >
            {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
          </button>
          <button
            onClick={onClose}
            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioModal;

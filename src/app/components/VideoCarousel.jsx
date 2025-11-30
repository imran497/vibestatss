'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const videos = [
  { id: 1, src: '/landing/vid1.mp4', title: 'Example 1' },
  { id: 2, src: '/landing/vid2.mp4', title: 'Example 2' },
  { id: 3, src: '/landing/vid3.mp4', title: 'Example 3' },
];

export default function VideoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRefs = useRef([]);

  useEffect(() => {
    // Play current video when it changes
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      currentVideo.currentTime = 0;
      currentVideo.play().catch(err => {
        console.log('Autoplay prevented:', err);
      });
      setIsPlaying(true);
    }

    // Pause other videos
    videoRefs.current.forEach((video, idx) => {
      if (video && idx !== currentIndex) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  const handleVideoEnd = () => {
    // Auto-advance to next video when current one ends
    handleNext();
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Main Video Display */}
      <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
        {videos.map((video, index) => (
          <video
            key={video.id}
            ref={(el) => (videoRefs.current[index] = el)}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            src={video.src}
            onEnded={handleVideoEnd}
            playsInline
            muted
            loop={false}
          />
        ))}

        {/* Navigation Buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm"
          aria-label="Previous video"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm"
          aria-label="Next video"
        >
          <ChevronRight size={24} />
        </button>

        {/* Video Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {videos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to video ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Video Counter */}
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Video {currentIndex + 1} of {videos.length}
        </p>
      </div>
    </div>
  );
}

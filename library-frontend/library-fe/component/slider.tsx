"use client";
import React, { useEffect, useRef, useState } from "react";

type SliderProps = {
  autoplay?: boolean;
  interval?: number;
  className?: string;
};

export default function Slider({
  autoplay = true,
  interval = 4000,
  className = "",
}: SliderProps) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [images, setImages] = useState<string[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const startX = useRef<number | null>(null);
  const length = images.length;

  const getAllFantasy = async () => {
    const all = [];
    const totalPages = 4;
    for (let page = 1; page <= totalPages; page++) {
      const res = await fetch(
        `https://openlibrary.org/subjects/fantasy.json?limit=100&offset=${
          (page - 1) * 100
        }`
      );
      const data = await res.json();
      all.push(...data.works);
    }
    const covers = all
      .filter((b) => b.cover_id)
      .slice(0, 10)
      .map((b) => `https://covers.openlibrary.org/b/id/${b.cover_id}-L.jpg`);
    setImages(covers);
  };

  useEffect(() => {
    getAllFantasy();
  }, []);

  useEffect(() => {
    if (!isPlaying || length === 0) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setIndex((prev) => (prev + 1) % length);
    }, interval);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [index, isPlaying, interval, length]);

  const prev = () => setIndex((i) => (i - 1 + length) % length);
  const next = () => setIndex((i) => (i + 1) % length);
  const goTo = (i: number) => setIndex(((i % length) + length) % length);

  const onMouseEnter = () => setIsPlaying(false);
  const onMouseLeave = () => setIsPlaying(autoplay);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const diff = startX.current - e.touches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      startX.current = null;
    }
  };

  const idx = (i: number) => ((i % length) + length) % length;
  const prevIndex = length ? idx(index - 1) : 0;
  const nextIndex = length ? idx(index + 1) : 0;

  return (
    <div
      className={`w-full max-w-5xl mx-auto ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative h-[500px] flex items-center justify-center overflow-visible bg-gradient-to-b from-gray-900 via-black/80 to-gray-900">
        <div
          className="relative w-full max-w-4xl mx-auto pointer-events-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
        >
          {/* Left preview */}
          {length > 0 && (
            <img
              src={images[prevIndex]}
              alt={`prev-${prevIndex}`}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-[220px] h-[330px] rounded-xl shadow-lg object-contain opacity-40 scale-90 blur-sm bg-black transition-all duration-600"
              draggable={false}
            />
          )}

          {/* Center active */}
          {length > 0 && (
            <div className="relative mx-auto w-[335px] h-[500px] rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-700 pointer-events-auto bg-black">
              <img
                src={images[index]}
                alt={`active-${index}`}
                className="absolute inset-0 w-full h-full object-contain"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/30" />
              <div className="absolute left-6 bottom-4 bg-black/50 text-white rounded-md px-3 py-1 text-sm backdrop-blur">
                {index + 1} / {length}
              </div>
            </div>
          )}

          {/* Right preview */}
          {length > 0 && (
            <img
              src={images[nextIndex]}
              alt={`next-${nextIndex}`}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-[220px] h-[330px] rounded-xl shadow-lg object-contain opacity-40 scale-90 blur-sm bg-black transition-all duration-600"
              draggable={false}
            />
          )}

          {/* Arrows */}
          {length > 0 && (
            <>
              <button
                aria-label="previous"
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-md pointer-events-auto"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                aria-label="next"
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-md pointer-events-auto"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 6L15 12L9 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Center dots */}
      {length > 0 && (
        <div className="flex items-center justify-center mt-4 gap-3">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === index ? "bg-white scale-125" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useEffect, useRef, useState } from "react";

type SliderProps = {
  images: string[];
  autoplay?: boolean;
  interval?: number;
  className?: string;
};

export default function Slider({
  images,
  autoplay = true,
  interval = 4000,
  className = "",
}: SliderProps) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const dragStartX = useRef<number | null>(null);
  const dragActive = useRef<boolean>(false);
  const length = images.length;

  const leftQuotes = [
    "“A room without books is like a body without a soul. Books breathe life into our imagination.”",
    "“Each page turned is a step into another world, a journey beyond time.”",
    "“Books whisper wisdom that only open minds can hear.”",
  ];
  const rightQuotes = [
    "“Read. Reflect. Rise. Let every page awaken your spirit.”",
    "“Words are seeds of knowledge — plant them and let them grow.”",
    "“Turn the page, and turn your life into something extraordinary.”",
  ];

  // === Auto xoay ảnh ===
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

  // === Hiệu ứng typing ===
  useEffect(() => {
    let charIndex = 0;
    setLeftText("");
    const text = leftQuotes[leftIdx];
    const intervalId = setInterval(() => {
      setLeftText((prev) => prev + text[charIndex]);
      charIndex++;
      if (charIndex === text.length) clearInterval(intervalId);
    }, 40);
    return () => clearInterval(intervalId);
  }, [leftIdx]);

  useEffect(() => {
    let charIndex = 0;
    setRightText("");
    const text = rightQuotes[rightIdx];
    const intervalId = setInterval(() => {
      setRightText((prev) => prev + text[charIndex]);
      charIndex++;
      if (charIndex === text.length) clearInterval(intervalId);
    }, 40);
    return () => clearInterval(intervalId);
  }, [rightIdx]);

  // === Tự động đổi slogan ===
  useEffect(() => {
    const leftTimer = setInterval(
      () => setLeftIdx((i) => (i + 1) % leftQuotes.length),
      6000
    );
    const rightTimer = setInterval(
      () => setRightIdx((i) => (i + 1) % rightQuotes.length),
      7000
    );
    return () => {
      clearInterval(leftTimer);
      clearInterval(rightTimer);
    };
  }, []);

  // === Kéo ===
  const handleDragStart = (clientX: number) => {
    dragStartX.current = clientX;
    dragActive.current = true;
    setIsPlaying(false);
  };

  const handleDragMove = (clientX: number) => {
    if (!dragActive.current || dragStartX.current == null) return;
    const diff = dragStartX.current - clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setIndex((i) => (i + 1) % length);
      else setIndex((i) => (i - 1 + length) % length);
      dragActive.current = false;
      dragStartX.current = null;
    }
  };

  const handleDragEnd = () => {
    dragActive.current = false;
    dragStartX.current = null;
    setTimeout(() => setIsPlaying(true), 1500);
  };

  if (length === 0)
    return <div className="text-center text-gray-300 py-10">Loading...</div>;

  return (
    <div
      className={`relative w-full mx-auto py-20 overflow-hidden select-none ${className}`}
      style={{
        backgroundImage: "url('/fanatasy.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40" />

      <div
        className="relative w-full h-[480px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: "1600px" }}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
      >
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{
            transformStyle: "preserve-3d",
            transform: `translateZ(-400px) rotateY(${index * -45}deg)`,
          }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="absolute w-[200px] h-[310px] rounded-xl overflow-hidden shadow-2xl transition-all duration-700"
              style={{
                transform: `rotateY(${i * 45}deg) translateZ(480px)`,
                opacity: i === index ? 1 : 0.55,
                filter:
                  i === index
                    ? "none"
                    : "grayscale(60%) contrast(0.9) blur(0.5px)",
              }}
            >
              <img
                src={img}
                alt={`book-${i}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Slogan trái */}
        <div className="absolute left-20 top-1/2 -translate-y-1/2 w-[300px] text-[20px] italic text-gray-100 leading-snug opacity-90">
          <span className="whitespace-pre-line">{leftText}</span>
        </div>

        {/* Slogan phải */}
        <div className="absolute right-20 top-1/2 -translate-y-1/2 w-[300px] text-[20px] italic text-gray-100 text-right leading-snug opacity-90">
          <span className="whitespace-pre-line">{rightText}</span>
        </div>
      </div>
    </div>
  );
}

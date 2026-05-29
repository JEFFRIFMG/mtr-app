'use client';

import { useEffect, useRef } from 'react';

type Props = {
  carouselId: string;
  children: React.ReactNode;
};

export default function AwardsCarousel({ carouselId, children }: Props) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const fadeLeftRef = useRef<HTMLDivElement | null>(null);
  const fadeRightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    const fadeLeft = fadeLeftRef.current;
    const fadeRight = fadeRightRef.current;
    if (!carousel) return;

    const updateFades = () => {
      const scrollLeft = carousel.scrollLeft;
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      if (fadeLeft) fadeLeft.classList.toggle('aw-fade-visible', scrollLeft > 4);
      if (fadeRight) fadeRight.classList.toggle('aw-fade-visible', scrollLeft < maxScroll - 4);
    };

    carousel.addEventListener('scroll', updateFades);
    updateFades();

    return () => carousel.removeEventListener('scroll', updateFades);
  }, []);

  return (
    <div className="aw-carousel-wrap">
      <div ref={fadeLeftRef} className="aw-fade-left" id={`aw-fade-left-${carouselId}`}></div>
      <div
        ref={fadeRightRef}
        className="aw-fade-right aw-fade-visible"
        id={`aw-fade-right-${carouselId}`}
      ></div>
      <div ref={carouselRef} className="aw-carousel" id={`aw-carousel-${carouselId}`}>
        {children}
      </div>
    </div>
  );
}

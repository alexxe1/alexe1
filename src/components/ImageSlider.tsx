import { useState, useRef, useEffect, useMemo } from "react";
import { images } from "../constants/images";
import "./ImageSlider.css";

export function ImageSlider({ name }: { name: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageDivRef = useRef<HTMLDivElement>(null);

  const sliderImages = useMemo(() => {
    return images[name] && typeof images[name] !== "string"
      ? images[name].images
      : [];
  }, [name]);

  useEffect(() => {
    sliderImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [sliderImages]);

  const goToNext = () => {
    const isLastSlide = currentIndex === sliderImages.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    playChangeAnimation();
  };

  const goToPrev = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? sliderImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    playChangeAnimation();
  };

  const playChangeAnimation = () => {
    if (imageDivRef.current) {
      imageDivRef.current.classList.add("image-changed");

      setTimeout(() => {
        if (imageDivRef.current) {
          imageDivRef.current.classList.remove("image-changed");
        }
      }, 500);
    }
  };

  return (
    <div className="image-slider">
      <button className="image-slider__button-left" onClick={goToPrev}>
        ❮
      </button>
      <div
        className="image-slider__image"
        ref={imageDivRef}
        style={{ backgroundImage: `url(${sliderImages[currentIndex]})` }}
      ></div>
      <button className="image-slider__button-right" onClick={goToNext}>
        ❯
      </button>
    </div>
  );
}

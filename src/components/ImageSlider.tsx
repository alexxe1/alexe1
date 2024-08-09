import "./ImageSlider.css";
import { useState, useRef } from "react";
import { images } from "../constants";

export function ImageSlider({ name }: { name: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageDivRef = useRef<HTMLDivElement>(null);

  // @ts-expect-error why because omg
  const sliderImages: string[] = images[name].images;

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

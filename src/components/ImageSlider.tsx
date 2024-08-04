import "./ImageSlider.css";
import { useState, useRef } from "react";

interface ImageSliderProps {
  imagesAmount: number;
  folderPath: string;
}

export function ImageSlider({ imagesAmount, folderPath }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageDivRef = useRef<HTMLDivElement>(null);

  const images: string[] = Array.from(
    { length: imagesAmount },
    (_, index) => `${folderPath}/${index}.png`
  );

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    playChangeAnimation();
  };

  const goToPrev = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
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
      <button className="image-slider__button" onClick={goToPrev}>
        ❮
      </button>
      <div
        className="image-slider__image"
        ref={imageDivRef}
        style={{ backgroundImage: `url(${images[currentIndex]})` }}
      ></div>
      <button className="image-slider__button" onClick={goToNext}>
        ❯
      </button>
    </div>
  );
}

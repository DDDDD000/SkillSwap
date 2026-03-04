import { useEffect, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';

import { SkillGalleryUI } from './SkillGalleryUI';
import type { SkillGalleryProps } from './type';

export const SkillGallery: React.FC<SkillGalleryProps> = ({
  images,
  title
}) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  //кол-во спрятанных фото, если больше трех миниатюр
  useEffect(() => {
    if (thumbsSwiper && images) {
      const totalSlides = thumbsSwiper.slides.length;
      const visibleSlides = 3;
      const hidden = Math.max(0, totalSlides - visibleSlides);
      setHiddenCount(hidden);
    }
  }, [thumbsSwiper, images]);

  //переключение миниатюр и главной в связке
  const handleMainSlideChange = (swiper: SwiperType) => {
    if (thumbsSwiper) {
      thumbsSwiper.slideTo(swiper.activeIndex, 500);
      setActiveSlideIndex(swiper.activeIndex);
    }
  };

  const handleThumbsSlideChange = (swiper: SwiperType) => {
    setActiveSlideIndex(swiper.activeIndex);
  };

  //кол-во спрятанных включено только по условию:
  const shouldShowCounter = hiddenCount > 0 && activeSlideIndex === 0;

  return (
    <SkillGalleryUI
      thumbsSwiper={thumbsSwiper}
      setThumbsSwiper={setThumbsSwiper}
      hiddenCount={hiddenCount}
      handleMainSlideChange={handleMainSlideChange}
      images={images}
      title={title}
      handleThumbsSlideChange={handleThumbsSlideChange}
      shouldShowCounter={shouldShowCounter}
    />
  );
};

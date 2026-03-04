import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

import styles from './SkillGallery.module.scss';

import { FreeMode, Navigation, Thumbs } from 'swiper/modules';

import type { SkillGalleryUIProps } from './type';
import clsx from 'clsx';

export const SkillGalleryUI: React.FC<SkillGalleryUIProps> = ({
  thumbsSwiper,
  setThumbsSwiper,
  hiddenCount,
  handleMainSlideChange,
  images,
  title,
  handleThumbsSlideChange,
  shouldShowCounter
}) => {
  return (
    <div className={clsx(styles['container'],
      images && images.length === 0 && styles['container_empty']
    )}>
    {images && images.length > 0 && (
      <>
        <Swiper
          style={
            {
              '--swiper-navigation-color': '#69735d'
            } as React.CSSProperties
          }
          navigation={true}
          thumbs={{ swiper: thumbsSwiper }}
          onSlideChange={handleMainSlideChange}
          modules={[FreeMode, Navigation, Thumbs]}
          className={styles['main-image']}
        >
          {images.map((image, imgIndex) => (
            <SwiperSlide key={imgIndex} className={styles['main-image__wrapper']}>
              <img
                className={styles['main-image__inner']}
                src={image.trim()}
                alt={`Фотография пользователя на тему его навыка ${title}`}
                loading='lazy'
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className={styles['thumbs-container']}>
          <Swiper
            onSwiper={setThumbsSwiper}
            onSlideChange={handleThumbsSlideChange}
            direction='vertical'
            slidesPerView={3}
            freeMode={false}
            watchSlidesProgress={true}
            slideToClickedSlide={true}
            modules={[FreeMode, Navigation, Thumbs]}
            className={styles['thumbs']}
          >
            {images.map((image, imgIndex) => (
              <SwiperSlide key={imgIndex} className={styles['thumbs__wrapper']}>
                <img
                  className={styles['thumbs__inner']}
                  src={image.trim()}
                  alt={`Фотография пользователя на тему его навыка ${title}`}
                  loading='lazy'
                />
              </SwiperSlide>
            ))}
          </Swiper>
          {shouldShowCounter && (
            <div className={styles['hidden-count']}>+{hiddenCount}</div>
          )}
        </div>
      </>
    )}
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import type { LightboxItem } from '../types/portfolio';

interface ProjectDetailPageProps {
  pageId: string;
  isActive: boolean;
  navTag: React.ReactNode;
  onNavigateHome: () => void;
  onBack: () => void;
  backLabel: React.ReactNode;
  children: React.ReactNode;
}

interface ProjectDetailLightboxProps {
  lightbox: {
    items: LightboxItem[];
    index: number;
  } | null;
  onClose: () => void;
  onStep: (delta: number) => void;
  onGoTo: (index: number) => void;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  pageId,
  isActive,
  navTag,
  onNavigateHome,
  onBack,
  backLabel,
  children,
}) => {
  return (
    <div className={`page ${isActive ? 'active' : ''}`} id={`page-${pageId}`}>
      <nav className="nav">
        <button type="button" className="nav-logo nav-control-btn" onClick={onNavigateHome}>
          <span className="studio-monogram">
            ce<span>.</span>
          </span>
        </button>
        <button type="button" className="nav-back nav-control-btn" onClick={onBack}>
          {backLabel}
        </button>
        <div className="nav-tag">{navTag}</div>
      </nav>
      {children}
    </div>
  );
};

export const ProjectDetailLightbox: React.FC<ProjectDetailLightboxProps> = ({
  lightbox,
  onClose,
  onStep,
  onGoTo,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState('center center');
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);
  const pinchGestureRef = useRef(false);

  useEffect(() => {
    setIsZoomed(false);
    setTransformOrigin('center center');
  }, [lightbox?.index, lightbox?.items]);

  if (!lightbox) {
    return null;
  }

  const currentItem = lightbox.items[lightbox.index];
  const fallbackProjectName = currentItem.meta?.title || currentItem.alt;
  const normalizedAlt = currentItem.alt.trim().toLowerCase();
  const genericAltCandidates = [
    `${fallbackProjectName} screenshot`.toLowerCase(),
    `${fallbackProjectName} capture`.toLowerCase(),
  ];
  const hasSpecificCaption =
    Boolean(currentItem.alt.trim()) && !genericAltCandidates.includes(normalizedAlt);
  const displayCaption = hasSpecificCaption ? currentItem.alt : fallbackProjectName;

  const updateTransformOrigin = (
    currentTarget: EventTarget & HTMLButtonElement,
    clientX: number,
    clientY: number,
  ) => {
    const rect = currentTarget.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setTransformOrigin(`${x}% ${y}%`);
  };

  const handleImageToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isZoomed) {
      updateTransformOrigin(event.currentTarget, event.clientX, event.clientY);
      setIsZoomed(true);
      return;
    }

    setIsZoomed(false);
    setTransformOrigin('center center');
  };

  const handleImageMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isZoomed) {
      return;
    }

    updateTransformOrigin(event.currentTarget, event.clientX, event.clientY);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
    if (event.touches.length === 2) {
      pinchGestureRef.current = true;
      touchStartXRef.current = 0;
      touchEndXRef.current = 0;
      return;
    }

    if (event.touches.length !== 1) {
      return;
    }

    pinchGestureRef.current = false;
    touchStartXRef.current = event.touches[0].clientX;
    touchEndXRef.current = event.touches[0].clientX;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLButtonElement>) => {
    if (event.touches.length === 2) {
      pinchGestureRef.current = true;
    }
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLButtonElement>) => {
    if (pinchGestureRef.current) {
      pinchGestureRef.current = false;
      touchStartXRef.current = 0;
      touchEndXRef.current = 0;
      return;
    }

    if (isZoomed || lightbox.items.length <= 1 || touchStartXRef.current === 0) {
      touchStartXRef.current = 0;
      touchEndXRef.current = 0;
      return;
    }

    touchEndXRef.current = event.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndXRef.current;
    touchStartXRef.current = 0;
    touchEndXRef.current = 0;

    if (Math.abs(diff) <= 50) {
      return;
    }

    if (diff > 0) {
      onStep(1);
      return;
    }

    onStep(-1);
  };

  return (
    <div
      className="project-image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Project image preview"
      onClick={onClose}
    >
      <div className="project-image-lightbox-dialog" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="project-image-lightbox-close"
          aria-label="Close image preview"
          onClick={onClose}
        >
          ×
        </button>

        <button
          type="button"
          className="project-image-lightbox-media"
          aria-label={isZoomed ? 'Reduce image zoom' : 'Zoom image'}
          onClick={handleImageToggle}
          onMouseMove={handleImageMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'pinch-zoom', overflow: 'hidden' }}
        >
          <img
            key={currentItem.src}
            className="project-image-lightbox-image"
            src={currentItem.src}
            alt={currentItem.alt}
            style={{
              transform: isZoomed ? 'scale(2)' : 'scale(1)',
              transformOrigin,
              transition: 'transform 300ms ease',
              cursor: isZoomed ? 'zoom-out' : 'zoom-in',
              objectFit: isZoomed ? 'cover' : 'contain',
            }}
          />
        </button>

        {lightbox.items.length > 1 ? (
          <>
            <button
              type="button"
              className="project-image-lightbox-nav project-image-lightbox-nav-prev"
              aria-label="Previous image"
              onClick={() => onStep(-1)}
              disabled={lightbox.index === 0}
            >
              ‹
            </button>
            <button
              type="button"
              className="project-image-lightbox-nav project-image-lightbox-nav-next"
              aria-label="Next image"
              onClick={() => onStep(1)}
              disabled={lightbox.index === lightbox.items.length - 1}
            >
              ›
            </button>
          </>
        ) : null}

        {lightbox.items.length > 1 && lightbox.items.length <= 8 ? (
          <div className="carousel-dots project-image-lightbox-dots">
            {lightbox.items.map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                type="button"
                className={`carousel-dot ${lightbox.index === index ? 'active' : ''}`}
                onClick={() => onGoTo(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={lightbox.index === index ? 'true' : undefined}
              />
            ))}
          </div>
        ) : null}

        <div className="project-image-lightbox-info-bar">
          <div className="project-image-lightbox-info-copy">
            <p className="project-image-lightbox-counter">
              Image {lightbox.index + 1} / {lightbox.items.length}
            </p>
            {hasSpecificCaption ? (
              <p className="project-image-lightbox-caption">{displayCaption}</p>
            ) : (
              <p className="project-image-lightbox-project-name">{displayCaption}</p>
            )}
          </div>
          <button type="button" className="project-image-lightbox-link" onClick={onClose}>
            Voir le détail →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;

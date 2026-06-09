"use client";

import React from "react";

interface LoaderOverlayProps {
  isVisible: boolean;
}

export default function LoaderOverlay({ isVisible }: LoaderOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-content">
        {/* Spinning Irised Loader */}
        <div className="loader-spinner">
          <div className="loader-spinner-inner" />
        </div>
        <h3 className="loader-title">
          Des nouveaux thèmes arrivent...
        </h3>
        <p className="loader-description">
          Mise à jour du réservoir d'improvisation depuis Gemini. Veuillez patienter.
        </p>
      </div>
    </div>
  );
}

"use client";

/**
 * @file ToastAlert.tsx
 * @description Component rendering transient, auto-dismissing feedback messages at the top of the viewport.
 * Uses custom slide-down animation styling defined in globals.css.
 */

import React from "react";

interface ToastAlertProps {
  message: string | null;
}

export default function ToastAlert({ message }: ToastAlertProps) {
  if (!message) return null;

  return (
    <div className="toast-alert-container">
      <div className="toast-alert-inner">
        {message}
      </div>
    </div>
  );
}

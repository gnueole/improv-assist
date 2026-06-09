"use client";

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

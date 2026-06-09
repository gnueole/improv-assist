"use client";

/**
 * @file PromptModal.tsx
 * @description Modal dialog overlay displaying the system prompt used for Gemini generation.
 * Only visible/accessible when Dev Mode is activated.
 */

import React from "react";
import { Terminal } from "lucide-react";

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt: string;
}

export default function PromptModal({ isOpen, onClose, systemPrompt }: PromptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="prompt-modal-overlay">
      <div className="irised-border-wrapper w-full max-w-md">
        <div className="prompt-modal-content">
          <div className="prompt-modal-icon-wrapper">
            <Terminal className="w-6 h-6 text-cyan-400" />
          </div>

          <h3 className="prompt-modal-title">
            Prompt Système Gemini
          </h3>

          <div className="prompt-modal-body select-text">
            {systemPrompt}
          </div>

          <button
            onClick={onClose}
            className="prompt-modal-close-btn"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

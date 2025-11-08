"use client";

import { Alert } from "flowbite-react";
import { XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function CustomAlert({ errorMessage, onClose }) {
  const [visible, setVisible] = useState(Boolean(errorMessage));

  useEffect(() => {
    if (errorMessage) {
      setVisible(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose(); // Notify parent component when alert disappears
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, onClose]);

  if (!visible || !errorMessage) return null;

  return (
    <div className="absolute top-20 right-4 z-50">
      <Alert
        color="failure"
        withBorderAccent
        className="relative border-red-600 bg-red-100 text-red-800 shadow-lg p-4 pr-10"
      >
        <span>
          <span className="font-bold">Error!</span> {errorMessage}
        </span>
        <button
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
          className="absolute top-2 right-2 text-red-600 hover:text-red-800"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </Alert>
    </div>
  );
}

"use client";

import { Alert } from "flowbite-react";
import { XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function SuccessAlert({ successMessage, onClose }) {
  const [visible, setVisible] = useState(Boolean(successMessage));

  useEffect(() => {
    if (successMessage) {
      setVisible(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose(); // Notify parent component when alert disappears
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, onClose]);

  if (!visible || !successMessage) return null;

  return (
    <div className="absolute top-20 right-4 z-50">
      <Alert
        color="success"
        withBorderAccent
        className="relative border-green-600 bg-green-100 text-green-800 shadow-lg p-4 pr-10"
      >
        <span>
          <span className="font-bold">Success!</span> {successMessage}
        </span>
        <button
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
          className="absolute top-2 right-2 text-green-600 hover:text-green-800"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </Alert>
    </div>
  );
}

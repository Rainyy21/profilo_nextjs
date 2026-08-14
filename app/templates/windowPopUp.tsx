import React from "react";
import { useDraggable } from "./ts/useDraggable";

type WindowVariant = "profilo" | "project" | "link" | "default";

interface WindowProps {
  title: string;
  variant?: WindowVariant;
  children?: React.ReactNode;
  onClose?: () => void;
  onFocus?: () => void;
  style?: React.CSSProperties;
}

export default function WindowPopUp({
  title,
  variant = "default",
  children,
  onClose,
  onFocus,
  style,
}: WindowProps) {
  const { pos, dragRef, onMouseDown } = useDraggable({ x: 200, y: 150 });

  const handleMouseDown = (e: React.MouseEvent) => {
    onFocus?.();
    onMouseDown(e);
  };

  return (
    <div
      className={`window window-popup window-${variant}`}
      ref={dragRef}
      onMouseDown={onFocus}
      style={{
        position: "absolute",
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 100,
        ...style,
      }}
    >
      <div
        className="title flex items-center justify-between"
        onMouseDown={handleMouseDown}
        style={{ cursor: "grab" }}
      >
        <h1 className="select-none">{title}</h1>
        <button
          onClick={onClose}
          aria-label="Close"
          className="hover:bg-red-500/80 hover:text-white transition-all rounded-md px-2 py-0.5 text-lg font-bold cursor-pointer text-[var(--titleText)] opacity-85 hover:opacity-100"
        >
          ✕
        </button>
      </div>
      <div className="mainContent">
        {children}
      </div>
    </div>
  );
}

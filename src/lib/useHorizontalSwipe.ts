"use client";

import { useRef } from "react";
import type { MouseEvent, PointerEvent } from "react";

const SWIPE_PX = 40;

/** Arraste horizontal. O clique seguinte é cancelado para não abrir o link. */
export function useHorizontalSwipe(
  enabled: boolean,
  onSwipe: (direction: -1 | 1) => void,
) {
  const gesture = useRef({
    x: 0,
    y: 0,
    id: -1,
    tracking: false,
    swiped: false,
  });

  function onPointerDown(event: PointerEvent) {
    if (!enabled) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    gesture.current = {
      x: event.clientX,
      y: event.clientY,
      id: event.pointerId,
      tracking: true,
      swiped: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerUp(event: PointerEvent) {
    const current = gesture.current;
    if (!current.tracking || current.id !== event.pointerId) return;
    current.tracking = false;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
    current.swiped = true;
    onSwipe(dx < 0 ? 1 : -1);
  }

  function onPointerCancel() {
    gesture.current.tracking = false;
  }

  function consumeClick(event: MouseEvent) {
    if (!gesture.current.swiped) return;
    event.preventDefault();
    event.stopPropagation();
    gesture.current.swiped = false;
  }

  return { onPointerDown, onPointerUp, onPointerCancel, consumeClick };
}

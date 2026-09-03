"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clampPan,
  cropToTransform,
  defaultCrop,
  transformToCrop,
  type ImageCrop,
  VITRINE_ASPECT,
} from "@/lib/productImageCrop";

type Props = {
  src: string;
  initialCrop?: ImageCrop | null;
  open: boolean;
  onClose: () => void;
  onSave: (crop: ImageCrop) => void;
};

export function ImageCropModal({
  src,
  initialCrop,
  open,
  onClose,
  onSave,
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const minScale = useCallback(() => {
    if (!natural.w || !natural.h || !viewport.w || !viewport.h) return 1;
    return Math.max(viewport.w / natural.w, viewport.h / natural.h);
  }, [natural, viewport]);

  const applyPan = useCallback(
    (nextScale: number, panX: number, panY: number) => {
      const displayW = natural.w * nextScale;
      const displayH = natural.h * nextScale;
      const clamped = clampPan(
        nextScale,
        panX,
        panY,
        displayW,
        displayH,
        viewport.w,
        viewport.h,
      );
      setScale(clamped.scale);
      setPan({ x: clamped.panX, y: clamped.panY });
    },
    [natural, viewport],
  );

  useEffect(() => {
    if (!open) return;
    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setViewport({ w: rect.width, h: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  useEffect(() => {
    if (!open || !natural.w || !natural.h || !viewport.w || !viewport.h) {
      return;
    }
    const base = minScale();
    const crop = initialCrop ?? defaultCrop(natural.w, natural.h, VITRINE_ASPECT);
    const t = cropToTransform(crop, natural.w, natural.h, viewport.w, viewport.h);
    const nextScale = Math.max(base, t.scale);
    applyPan(nextScale, t.panX, t.panY);
  }, [open, initialCrop, natural, viewport, minScale, applyPan]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const displayW = natural.w * scale;
  const displayH = natural.h * scale;
  const zoomMin = minScale();
  const zoomMax = minScale() * 3;

  function handlePointerDown(e: React.PointerEvent) {
    if (!natural.w) return;
    setDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    applyPan(scale, dragStart.current.panX + dx, dragStart.current.panY + dy);
  }

  function handlePointerUp(e: React.PointerEvent) {
    setDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }

  function handleSave() {
    if (!natural.w || !natural.h || !viewport.w || !viewport.h) return;
    const crop = transformToCrop(
      scale,
      pan.x,
      pan.y,
      natural.w,
      natural.h,
      viewport.w,
      viewport.h,
    );
    onSave(crop);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="crop-title" className="font-display text-2xl text-brand-ink">
          Enquadrar foto
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Arraste a imagem e ajuste o zoom. A área clara é como aparece na
          vitrine (8:5).
        </p>

        <div
          ref={viewportRef}
          className="relative mt-4 w-full overflow-hidden rounded-xl border border-line bg-[#111] touch-none"
          style={{ aspectRatio: `${VITRINE_ASPECT}` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {natural.w > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute max-w-none select-none"
              style={{
                width: displayW,
                height: displayH,
                left: pan.x,
                top: pan.y,
              }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-contain opacity-0"
              onLoad={(e) => {
                const img = e.currentTarget;
                setNatural({ w: img.naturalWidth, h: img.naturalHeight });
              }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-white/90" />
        </div>

        <label className="mt-4 block text-sm font-medium text-brand-ink">
          Zoom
          <input
            type="range"
            min={zoomMin}
            max={zoomMax}
            step={0.01}
            value={scale}
            disabled={!natural.w}
            className="mt-2 w-full accent-brand"
            onChange={(e) => {
              const next = Number(e.target.value);
              const centerX = pan.x + displayW / 2;
              const centerY = pan.y + displayH / 2;
              const ratio = next / scale;
              const nextPanX = centerX - (displayW * ratio) / 2;
              const nextPanY = centerY - (displayH * ratio) / 2;
              applyPan(next, nextPanX, nextPanY);
            }}
          />
        </label>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="btn btn-secondary !min-h-10 !px-4 !text-sm"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary !min-h-10 !px-4 !text-sm"
            onClick={handleSave}
            disabled={!natural.w}
          >
            Salvar enquadramento
          </button>
        </div>
      </div>
    </div>
  );
}

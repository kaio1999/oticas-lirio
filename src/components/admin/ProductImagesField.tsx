"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { ImageCropModal } from "@/components/admin/ImageCropModal";
import { compressProductImage } from "@/lib/compressProductImage";
import {
  cropImageStyle,
  defaultCrop,
  type ImageCrop,
} from "@/lib/productImageCrop";

type Props = {
  initialImages?: string[];
  initialCrops?: (ImageCrop | null)[];
  nameKept?: string;
  /** Exige ao menos uma foto (criação de produto). */
  required?: boolean;
};

type PendingFile = {
  key: string;
  file: File;
  preview: string;
};

type Slot =
  | { kind: "kept"; url: string }
  | { kind: "pending"; item: PendingFile };

function loadDefaultCrop(src: string): Promise<ImageCrop> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      resolve(defaultCrop(img.naturalWidth, img.naturalHeight));
    };
    img.onerror = () => {
      resolve({ x: 0, y: 0, width: 1, height: 1 });
    };
    img.src = src;
  });
}

export function ProductImagesField({
  initialImages = [],
  initialCrops = [],
  nameKept = "keptImages",
  required = false,
}: Props) {
  const galleryId = useId();
  const cameraId = useId();
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const filteredInitial = initialImages.filter(
    (u) => !u.includes("placeholder-"),
  );

  const [slots, setSlots] = useState<Slot[]>(() =>
    filteredInitial.map((url) => ({ kind: "kept" as const, url })),
  );

  const [crops, setCrops] = useState<(ImageCrop | null)[]>(() =>
    filteredInitial.map((_, i) => initialCrops[i] ?? null),
  );

  const [cropModal, setCropModal] = useState<{
    index: number;
    src: string;
  } | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedHint, setOptimizedHint] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fillMissingCrops() {
      const next = await Promise.all(
        slots.map(async (slot, i) => {
          if (crops[i]) return crops[i];
          const src = slot.kind === "kept" ? slot.url : slot.item.preview;
          return loadDefaultCrop(src);
        }),
      );
      if (!cancelled) setCrops(next);
    }
    if (slots.some((_, i) => !crops[i])) {
      void fillMissingCrops();
    }
    return () => {
      cancelled = true;
    };
    // Preenche recorte padrão só na montagem inicial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const nextSlots: Slot[] = [];
    const nextCrops: (ImageCrop | null)[] = [];
    let anyOptimized = false;

    setOptimizing(true);
    try {
      for (const raw of Array.from(fileList)) {
        if (!raw.type.startsWith("image/")) continue;
        if (raw.size > 8 * 1024 * 1024) continue;

        const { file, optimized } = await compressProductImage(raw);
        if (optimized) anyOptimized = true;

        const preview = URL.createObjectURL(file);
        nextSlots.push({
          kind: "pending",
          item: {
            key: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
            file,
            preview,
          },
        });
        nextCrops.push(await loadDefaultCrop(preview));
      }

      setSlots((prev) => [...prev, ...nextSlots].slice(0, 12));
      setCrops((prev) => [...prev, ...nextCrops].slice(0, 12));
      if (anyOptimized) setOptimizedHint(true);
    } finally {
      setOptimizing(false);
    }
  }

  function removeAt(index: number) {
    setSlots((prev) => {
      const target = prev[index];
      if (target?.kind === "pending") {
        URL.revokeObjectURL(target.item.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
    setCrops((prev) => prev.filter((_, i) => i !== index));
  }

  function setCover(index: number) {
    if (index <= 0) return;
    setSlots((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      if (!item) return prev;
      return [item, ...copy];
    });
    setCrops((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      if (item === undefined) return prev;
      return [item, ...copy];
    });
  }

  function openCrop(index: number) {
    const slot = slots[index];
    if (!slot) return;
    const src = slot.kind === "kept" ? slot.url : slot.item.preview;
    setCropModal({ index, src });
  }

  function saveCrop(crop: ImageCrop) {
    if (cropModal == null) return;
    setCrops((prev) => {
      const copy = [...prev];
      copy[cropModal.index] = crop;
      return copy;
    });
    setCropModal(null);
  }

  const keptOrdered = slots
    .filter((s): s is Extract<Slot, { kind: "kept" }> => s.kind === "kept")
    .map((s) => s.url);
  const pendingOrdered = slots
    .filter(
      (s): s is Extract<Slot, { kind: "pending" }> => s.kind === "pending",
    )
    .map((s) => s.item);

  const keptCrops = slots.flatMap((s, i) =>
    s.kind === "kept" ? [crops[i]!] : [],
  );
  const pendingCrops = slots.flatMap((s, i) =>
    s.kind === "pending" ? [crops[i]!] : [],
  );

  const coverIsPending = slots[0]?.kind === "pending";

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-brand-ink">
        Fotos do produto{required ? " *" : ""}
      </p>
      <p className="text-xs text-ink-muted">
        {required ? (
          <>
            Obrigatório: ao menos <strong>uma foto</strong>. A primeira é a{" "}
            <strong>capa</strong>. Use <strong>Enquadrar</strong> para definir
            o ângulo na vitrine.
          </>
        ) : (
          <>
            A primeira foto é a <strong>capa</strong>. Use{" "}
            <strong>Enquadrar</strong> para ajustar como aparece no catálogo e
            no detalhe do produto.
          </>
        )}
      </p>

      {keptOrdered.map((url) => (
        <input key={url} type="hidden" name={nameKept} value={url} />
      ))}
      <input
        type="hidden"
        name="coverPending"
        value={coverIsPending ? "1" : "0"}
      />
      <input
        type="hidden"
        name="imageCropsKept"
        value={JSON.stringify(keptCrops)}
      />
      <input
        type="hidden"
        name="imageCropsPending"
        value={JSON.stringify(pendingCrops)}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {slots.map((slot, index) => {
          const src =
            slot.kind === "kept" ? slot.url : slot.item.preview;
          const crop = crops[index];
          const isCover = index === 0;
          return (
            <div
              key={
                slot.kind === "kept" ? slot.url : slot.item.key
              }
              className={`relative aspect-[8/5] overflow-hidden rounded-xl border-2 bg-sand ${
                isCover ? "border-brand" : "border-line"
              }`}
            >
              {crop ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt=""
                  className="absolute max-w-none"
                  style={cropImageStyle(crop)}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="h-full w-full object-cover" />
              )}
              {isCover ? (
                <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Capa
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setCover(index)}
                  className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white"
                >
                  Usar como capa
                </button>
              )}
              <button
                type="button"
                onClick={() => openCrop(index)}
                className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white"
              >
                Enquadrar
              </button>
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white"
              >
                Remover
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-secondary !min-h-10 !px-4 !text-sm"
          disabled={optimizing}
          onClick={() => cameraRef.current?.click()}
        >
          Tirar foto
        </button>
        <button
          type="button"
          className="btn btn-secondary !min-h-10 !px-4 !text-sm"
          disabled={optimizing}
          onClick={() => galleryRef.current?.click()}
        >
          Enviar da galeria
        </button>
      </div>

      {optimizing ? (
        <p className="text-xs text-ink-muted">Otimizando foto para envio…</p>
      ) : null}
      {optimizedHint && !optimizing ? (
        <p className="rounded-xl bg-sand/80 px-3 py-2 text-xs text-ink-muted">
          Foto otimizada para envio — fica mais leve e falha menos em internet
          fraca.
        </p>
      ) : null}

      <input
        id={cameraId}
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        id={galleryId}
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <PendingBridge
        pending={pendingOrdered}
        coverIsPending={coverIsPending}
        slots={slots}
      />

      {cropModal ? (
        <ImageCropModal
          src={cropModal.src}
          initialCrop={crops[cropModal.index]}
          open
          onClose={() => setCropModal(null)}
          onSave={saveCrop}
        />
      ) : null}

      {slots.length === 0 ? (
        <p
          className={`rounded-xl px-3 py-2 text-xs ${
            required
              ? "bg-amber-50 text-amber-900"
              : "bg-sand/80 text-ink-muted"
          }`}
        >
          {required
            ? "Adicione ao menos uma foto para cadastrar o produto."
            : "Nenhuma foto ainda. Sem foto, o site usa um placeholder."}
        </p>
      ) : null}
    </div>
  );
}

function PendingBridge({
  pending,
  coverIsPending,
  slots,
}: {
  pending: PendingFile[];
  coverIsPending: boolean;
  slots: Slot[];
}) {
  return (
    <div
      ref={(el) => {
        if (!el) return;
        const form = el.closest("form");
        if (!form) return;
        const ordered = slots
          .filter(
            (s): s is Extract<Slot, { kind: "pending" }> =>
              s.kind === "pending",
          )
          .map((s) => s.item.file);
        const target = form as HTMLFormElement & {
          __pendingPhotos?: File[];
          __coverPending?: boolean;
        };
        target.__pendingPhotos = ordered;
        target.__coverPending = coverIsPending;
      }}
    />
  );
}

type FormProps = {
  action: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
  className?: string;
  submitLabel?: string;
  requireImages?: boolean;
};

export function ProductFormShell({
  action,
  children,
  className,
  submitLabel,
  requireImages = false,
}: FormProps) {
  const [pending, startTransition] = useTransition();
  const [clientError, setClientError] = useState<string | null>(null);

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement & {
          __pendingPhotos?: File[];
          __coverPending?: boolean;
        };
        const fd = new FormData(form);
        for (const file of form.__pendingPhotos || []) {
          fd.append("photos", file);
        }
        fd.set("coverPending", form.__coverPending ? "1" : "0");

        if (requireImages) {
          const kept = fd
            .getAll("keptImages")
            .map((v) => String(v).trim())
            .filter(Boolean);
          const pendingPhotos = form.__pendingPhotos || [];
          if (kept.length === 0 && pendingPhotos.length === 0) {
            setClientError("Adicione ao menos uma foto do produto.");
            return;
          }
        }

        setClientError(null);
        startTransition(async () => {
          await action(fd);
        });
      }}
    >
      {children}
      {clientError ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {clientError}
        </p>
      ) : null}
      {submitLabel ? (
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary disabled:opacity-70"
          aria-busy={pending}
        >
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                aria-hidden
              />
              Enviando fotos… Pode demorar um pouco.
            </span>
          ) : (
            submitLabel
          )}
        </button>
      ) : pending ? (
        <p className="text-sm text-ink-muted">
          Enviando fotos… Pode demorar um pouco.
        </p>
      ) : null}
    </form>
  );
}

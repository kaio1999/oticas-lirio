"use client";

import { useId, useRef, useState, useTransition } from "react";

type Props = {
  initialImages?: string[];
  nameKept?: string;
};

type PendingFile = {
  key: string;
  file: File;
  preview: string;
};

type Slot =
  | { kind: "kept"; url: string }
  | { kind: "pending"; item: PendingFile };

export function ProductImagesField({
  initialImages = [],
  nameKept = "keptImages",
}: Props) {
  const galleryId = useId();
  const cameraId = useId();
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const [slots, setSlots] = useState<Slot[]>(() =>
    initialImages
      .filter((u) => !u.includes("placeholder-"))
      .map((url) => ({ kind: "kept" as const, url })),
  );

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const next: Slot[] = [];
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 8 * 1024 * 1024) continue;
      next.push({
        kind: "pending",
        item: {
          key: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
        },
      });
    }
    setSlots((prev) => [...prev, ...next].slice(0, 12));
  }

  function removeAt(index: number) {
    setSlots((prev) => {
      const target = prev[index];
      if (target?.kind === "pending") {
        URL.revokeObjectURL(target.item.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  function setCover(index: number) {
    if (index <= 0) return;
    setSlots((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      if (!item) return prev;
      return [item, ...copy];
    });
  }

  const keptOrdered = slots
    .filter((s): s is Extract<Slot, { kind: "kept" }> => s.kind === "kept")
    .map((s) => s.url);
  const pendingOrdered = slots
    .filter(
      (s): s is Extract<Slot, { kind: "pending" }> => s.kind === "pending",
    )
    .map((s) => s.item);

  // Ordem de montagem no servidor: se a capa for pending, sobe ela primeiro
  const coverIsPending = slots[0]?.kind === "pending";

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-brand-ink">Fotos do produto</p>
      <p className="text-xs text-ink-muted">
        A primeira foto é a <strong>capa</strong> (catálogo e destaque no
        detalhe). Use “Usar como capa” nas outras.
      </p>

      {keptOrdered.map((url) => (
        <input key={url} type="hidden" name={nameKept} value={url} />
      ))}
      <input
        type="hidden"
        name="coverPending"
        value={coverIsPending ? "1" : "0"}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {slots.map((slot, index) => {
          const src =
            slot.kind === "kept" ? slot.url : slot.item.preview;
          const isCover = index === 0;
          return (
            <div
              key={
                slot.kind === "kept" ? slot.url : slot.item.key
              }
              className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-sand ${
                isCover ? "border-brand" : "border-line"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
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
          onClick={() => cameraRef.current?.click()}
        >
          Tirar foto
        </button>
        <button
          type="button"
          className="btn btn-secondary !min-h-10 !px-4 !text-sm"
          onClick={() => galleryRef.current?.click()}
        >
          Enviar da galeria
        </button>
      </div>

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

      {slots.length === 0 ? (
        <p className="rounded-xl bg-sand/80 px-3 py-2 text-xs text-ink-muted">
          Nenhuma foto ainda. Sem foto, o site usa um placeholder.
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
        // Ordem dos arquivos = ordem visual dos slots pending
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
};

export function ProductFormShell({ action, children, className }: FormProps) {
  const [pending, startTransition] = useTransition();

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
        startTransition(async () => {
          await action(fd);
        });
      }}
    >
      {children}
      {pending ? (
        <p className="text-sm text-ink-muted">Salvando…</p>
      ) : null}
    </form>
  );
}

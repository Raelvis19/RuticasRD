"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  TOUR_IMAGE_ACCEPT,
  TOUR_IMAGE_BUCKET,
  TOUR_IMAGE_MAX_BYTES,
  TOUR_IMAGE_MIME_TYPES,
  type AdminTourImage,
} from "@/lib/tours/storage";

interface TourImageManagerProps {
  tourId: string;
  tourTitle: string;
  initialImages: AdminTourImage[];
}

interface InsertedImageRow {
  id: string;
  storage_path: string;
  alt_text: string | null;
  position: number;
  is_cover: boolean;
}

type Notice =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export default function TourImageManager({
  tourId,
  tourTitle,
  initialImages,
}: TourImageManagerProps) {
  const [supabase] = useState(() => createClient());
  const [images, setImages] = useState(initialImages);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [makeCover, setMakeCover] = useState(initialImages.length === 0);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBusy = busyKey !== null;

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    if (!file) {
      setNotice({ type: "error", message: "Selecciona una imagen para subir." });
      return;
    }

    if (!TOUR_IMAGE_MIME_TYPES.has(file.type)) {
      setNotice({
        type: "error",
        message: "Utiliza una imagen JPG, PNG, WebP o AVIF.",
      });
      return;
    }

    if (file.size > TOUR_IMAGE_MAX_BYTES) {
      setNotice({
        type: "error",
        message: "La imagen supera el límite de 8 MB.",
      });
      return;
    }

    const cleanAltText = altText.trim();
    if (cleanAltText.length < 3 || cleanAltText.length > 180) {
      setNotice({
        type: "error",
        message: "La descripción debe tener entre 3 y 180 caracteres.",
      });
      return;
    }

    setBusyKey("upload");

    const extension = extensionByMimeType[file.type];
    const storagePath = `${tourId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(TOUR_IMAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      setBusyKey(null);
      setNotice({
        type: "error",
        message:
          "No se pudo subir la imagen. Confirma que ejecutaste la migración de Storage en Supabase.",
      });
      return;
    }

    const nextPosition =
      images.reduce((largest, image) => Math.max(largest, image.position), -1) + 1;
    const { data, error: metadataError } = await supabase
      .from("tour_images")
      .insert({
        tour_id: tourId,
        storage_path: storagePath,
        alt_text: cleanAltText,
        position: nextPosition,
        is_cover: false,
      })
      .select("id, storage_path, alt_text, position, is_cover")
      .single();

    if (metadataError || !data) {
      await supabase.storage.from(TOUR_IMAGE_BUCKET).remove([storagePath]);
      setBusyKey(null);
      setNotice({
        type: "error",
        message: "La imagen subió, pero no pudimos vincularla con este tour.",
      });
      return;
    }

    const inserted = data as InsertedImageRow;
    const newImage: AdminTourImage = {
      id: inserted.id,
      storagePath: inserted.storage_path,
      altText: inserted.alt_text ?? cleanAltText,
      position: inserted.position,
      isCover: false,
      publicUrl: supabase.storage
        .from(TOUR_IMAGE_BUCKET)
        .getPublicUrl(inserted.storage_path).data.publicUrl,
    };
    const shouldBeCover = makeCover || images.length === 0;

    if (shouldBeCover) {
      const coverError = await setCoverInDatabase(newImage.id);
      if (coverError) {
        setImages((current) => sortImages([...current, newImage]));
        setBusyKey(null);
        setNotice({
          type: "error",
          message:
            "La imagen se guardó, pero no pudo establecerse como portada. Puedes intentarlo desde su botón.",
        });
        return;
      }
      newImage.isCover = true;
    }

    setImages((current) =>
      sortImages([
        ...current.map((image) => ({
          ...image,
          isCover: shouldBeCover ? false : image.isCover,
        })),
        newImage,
      ]),
    );
    setFile(null);
    setAltText("");
    setMakeCover(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setBusyKey(null);
    setNotice({ type: "success", message: "Imagen añadida correctamente." });
  }

  async function handleSetCover(imageId: string) {
    setBusyKey(`cover-${imageId}`);
    setNotice(null);
    const error = await setCoverInDatabase(imageId);

    if (error) {
      setBusyKey(null);
      setNotice({
        type: "error",
        message: "No se pudo cambiar la portada. Inténtalo nuevamente.",
      });
      return;
    }

    setImages((current) =>
      sortImages(
        current.map((image) => ({
          ...image,
          isCover: image.id === imageId,
        })),
      ),
    );
    setBusyKey(null);
    setNotice({ type: "success", message: "Portada actualizada." });
  }

  async function handleDelete(image: AdminTourImage) {
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar esta imagen? Esta acción no se puede deshacer.",
    );
    if (!confirmed) return;

    setBusyKey(`delete-${image.id}`);
    setNotice(null);

    const remainingImages = images.filter((item) => item.id !== image.id);
    const replacement = image.isCover ? remainingImages[0] : null;

    if (replacement) {
      const coverError = await setCoverInDatabase(replacement.id);
      if (coverError) {
        setBusyKey(null);
        setNotice({
          type: "error",
          message: "No se pudo preparar una portada de reemplazo.",
        });
        return;
      }
    }

    const { error: metadataError } = await supabase
      .from("tour_images")
      .delete()
      .eq("id", image.id)
      .eq("tour_id", tourId);

    if (metadataError) {
      setBusyKey(null);
      setNotice({
        type: "error",
        message: "No se pudo eliminar la imagen del tour.",
      });
      return;
    }

    const { error: storageError } = await supabase.storage
      .from(TOUR_IMAGE_BUCKET)
      .remove([image.storagePath]);

    setImages(
      sortImages(
        remainingImages.map((item) => ({
          ...item,
          isCover: replacement ? item.id === replacement.id : item.isCover,
        })),
      ),
    );
    setBusyKey(null);
    setNotice(
      storageError
        ? {
            type: "error",
            message:
              "La imagen se quitó del tour, pero el archivo no pudo limpiarse de Storage.",
          }
        : { type: "success", message: "Imagen eliminada." },
    );
  }

  async function setCoverInDatabase(imageId: string) {
    const { error } = await supabase.rpc("set_tour_cover", {
      p_tour_id: tourId,
      p_image_id: imageId,
    });
    return error;
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleUpload}
        className="rounded-[1.75rem] border border-[#dce6e0] bg-white p-5 shadow-sm sm:p-7"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e6f0ea] text-[#0f5132]">
            <UploadCloud size={24} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black">Añadir una imagen</h2>
            <p className="mt-1 text-sm leading-6 text-[#71847a]">
              JPG, PNG, WebP o AVIF. Tamaño máximo: 8 MB.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-black text-[#294238]">
              Archivo
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept={TOUR_IMAGE_ACCEPT}
              disabled={isBusy}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="block min-h-13 w-full rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-3 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#e6f0ea] file:px-4 file:py-2 file:font-black file:text-[#0f5132] disabled:opacity-60"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-black text-[#294238]">
              Descripción de la imagen
            </span>
            <input
              type="text"
              required
              minLength={3}
              maxLength={180}
              value={altText}
              disabled={isBusy}
              onChange={(event) => setAltText(event.target.value)}
              placeholder={`Ej. Participantes de ${tourTitle}`}
              className="min-h-13 w-full rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-4 py-3 text-base outline-none transition placeholder:text-[#91a199] focus:border-[#0f5132] focus:ring-4 focus:ring-[#0f5132]/10 disabled:opacity-60"
            />
          </label>

          <button
            type="submit"
            disabled={isBusy}
            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-3 font-black text-[#07130f] transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 sm:hover:bg-lime-300"
          >
            {busyKey === "upload" ? (
              <LoaderCircle size={20} className="animate-spin" />
            ) : (
              <ImagePlus size={20} />
            )}
            Subir imagen
          </button>
        </div>

        <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl bg-[#f4f8f5] px-4 py-2 text-sm font-bold text-[#294238]">
          <input
            type="checkbox"
            checked={makeCover}
            disabled={isBusy || images.length === 0}
            onChange={(event) => setMakeCover(event.target.checked)}
            className="h-5 w-5 accent-[#0f5132]"
          />
          Usar como portada del tour
        </label>
      </form>

      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={`flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold leading-6 ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.type === "error" ? (
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
          )}
          {notice.message}
        </div>
      )}

      {images.length === 0 ? (
        <section className="rounded-[1.75rem] border border-dashed border-[#bdcec4] bg-white px-5 py-12 text-center">
          <ImagePlus
            size={34}
            className="mx-auto text-[#668077]"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-xl font-black">Este tour todavía no tiene imágenes</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#71847a]">
            La primera imagen que subas se establecerá automáticamente como portada.
          </p>
        </section>
      ) : (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">Portada y galería</h2>
              <p className="mt-1 text-sm text-[#71847a]">
                {images.length} {images.length === 1 ? "imagen" : "imágenes"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {images.map((image) => (
              <article
                key={image.id}
                className="overflow-hidden rounded-[1.5rem] border border-[#dce6e0] bg-white shadow-sm"
              >
                <div
                  role="img"
                  aria-label={image.altText || `Imagen de ${tourTitle}`}
                  className="aspect-[4/3] bg-[#e9efeb] bg-cover bg-center"
                  style={{ backgroundImage: `url(${JSON.stringify(image.publicUrl)})` }}
                />
                <div className="p-4">
                  <div className="flex min-h-7 items-center justify-between gap-3">
                    {image.isCover ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1 text-xs font-black text-lime-800">
                        <Star size={13} fill="currentColor" /> Portada
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-[#84958c]">Galería</span>
                    )}
                    <span className="text-xs text-[#91a199]">#{image.position + 1}</span>
                  </div>
                  <p className="mt-3 min-h-10 text-sm leading-5 text-[#52675e]">
                    {image.altText || "Sin descripción"}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isBusy || image.isCover}
                      onClick={() => handleSetCover(image.id)}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-[#cad9d0] px-3 text-xs font-black text-[#0f5132] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {busyKey === `cover-${image.id}` ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <Star size={16} />
                      )}
                      Hacer portada
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDelete(image)}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-red-200 px-3 text-xs font-black text-red-700 disabled:cursor-wait disabled:opacity-45"
                    >
                      {busyKey === `delete-${image.id}` ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function sortImages(images: AdminTourImage[]) {
  return [...images].sort((first, second) => {
    if (first.isCover !== second.isCover) return first.isCover ? -1 : 1;
    return first.position - second.position;
  });
}

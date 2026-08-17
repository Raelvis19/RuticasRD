"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type {
  AdminGalleryImage,
  MediaCategory,
  MediaOrientation,
} from "@/types/media";

const BUCKET = "gallery-images";
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const MAX_BYTES = 8 * 1024 * 1024;
const MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const categories: { value: MediaCategory; label: string }[] = [
  { value: "naturaleza", label: "Naturaleza" },
  { value: "grupo", label: "Grupo / comunidad" },
  { value: "aventura", label: "Aventura" },
  { value: "destino", label: "Destino" },
  { value: "organizacion", label: "Organización" },
];

const orientations: { value: MediaOrientation; label: string }[] = [
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
  { value: "cuadrada", label: "Cuadrada" },
];

type Notice = { type: "success" | "error"; message: string } | null;

export default function GalleryImageManager({
  initialImages,
}: {
  initialImages: AdminGalleryImage[];
}) {
  const [supabase] = useState(() => createClient());
  const [images, setImages] = useState(initialImages);
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<MediaCategory>("aventura");
  const [orientation, setOrientation] =
    useState<MediaOrientation>("horizontal");
  const [featured, setFeatured] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    if (!file || !MIME_TYPES.has(file.type)) {
      setNotice({ type: "error", message: "Selecciona una imagen JPG, PNG, WebP o AVIF." });
      return;
    }
    if (file.size > MAX_BYTES) {
      setNotice({ type: "error", message: "La imagen supera el límite de 8 MB." });
      return;
    }
    if (alt.trim().length < 3 || alt.trim().length > 180) {
      setNotice({ type: "error", message: "La descripción debe tener entre 3 y 180 caracteres." });
      return;
    }

    setBusyKey("upload");
    const storagePath = `${crypto.randomUUID()}.${extensions[file.type]}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      setBusyKey(null);
      setNotice({ type: "error", message: "No se pudo subir. Verifica que la migración de galería esté aplicada en Supabase." });
      return;
    }

    const sourceUrl = supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
    const nextPosition = images.reduce((max, image) => Math.max(max, image.position), -1) + 1;
    const { data, error } = await supabase
      .from("gallery_images")
      .insert({
        source_url: sourceUrl,
        storage_path: storagePath,
        alt_text: alt.trim(),
        location: location.trim() || null,
        category,
        orientation,
        featured,
        position: nextPosition,
      })
      .select("id, source_url, storage_path, alt_text, location, category, orientation, featured, position")
      .single();

    if (error || !data) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      setBusyKey(null);
      setNotice({ type: "error", message: "El archivo subió, pero no se pudo añadir a la galería." });
      return;
    }

    setImages((current) => [...current, toImage(data)]);
    setFile(null);
    setAlt("");
    setLocation("");
    setFeatured(false);
    if (fileRef.current) fileRef.current.value = "";
    setBusyKey(null);
    setNotice({ type: "success", message: "Imagen añadida a la galería." });
  }

  async function saveImage(image: AdminGalleryImage) {
    if (image.alt.trim().length < 3 || image.alt.trim().length > 180) {
      setNotice({ type: "error", message: "La descripción debe tener entre 3 y 180 caracteres." });
      return;
    }
    setBusyKey(`save-${image.id}`);
    setNotice(null);
    const { error } = await supabase
      .from("gallery_images")
      .update({
        alt_text: image.alt.trim(),
        location: image.location?.trim() || null,
        category: image.category,
        orientation: image.orientation,
        featured: image.featured ?? false,
      })
      .eq("id", image.id);

    setBusyKey(null);
    if (error) {
      setNotice({ type: "error", message: "No se pudieron guardar los cambios." });
      return;
    }
    setEditingId(null);
    setNotice({ type: "success", message: "Información de la imagen actualizada." });
  }

  async function replaceImage(image: AdminGalleryImage, replacement: File | null) {
    if (!replacement) return;
    if (!MIME_TYPES.has(replacement.type) || replacement.size > MAX_BYTES) {
      setNotice({ type: "error", message: "El reemplazo debe ser JPG, PNG, WebP o AVIF y pesar menos de 8 MB." });
      return;
    }

    setBusyKey(`replace-${image.id}`);
    setNotice(null);
    const newPath = `${crypto.randomUUID()}.${extensions[replacement.type]}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(newPath, replacement, {
        cacheControl: "31536000",
        contentType: replacement.type,
        upsert: false,
      });

    if (uploadError) {
      setBusyKey(null);
      setNotice({ type: "error", message: "No se pudo subir la imagen de reemplazo." });
      return;
    }

    const newUrl = supabase.storage.from(BUCKET).getPublicUrl(newPath).data.publicUrl;
    const { error } = await supabase
      .from("gallery_images")
      .update({ source_url: newUrl, storage_path: newPath })
      .eq("id", image.id);

    if (error) {
      await supabase.storage.from(BUCKET).remove([newPath]);
      setBusyKey(null);
      setNotice({ type: "error", message: "La nueva imagen subió, pero no pudo vincularse a la galería." });
      return;
    }

    if (image.storagePath) {
      await supabase.storage.from(BUCKET).remove([image.storagePath]);
    }
    updateImage(image.id, { src: newUrl, storagePath: newPath });
    setBusyKey(null);
    setNotice({ type: "success", message: "Archivo de imagen reemplazado." });
  }

  async function deleteImage(image: AdminGalleryImage) {
    if (!window.confirm("¿Seguro que deseas eliminar esta imagen de la galería?")) return;
    setBusyKey(`delete-${image.id}`);
    setNotice(null);

    const { error } = await supabase.from("gallery_images").delete().eq("id", image.id);
    if (error) {
      setBusyKey(null);
      setNotice({ type: "error", message: "No se pudo eliminar la imagen." });
      return;
    }

    const storageError = image.storagePath
      ? (await supabase.storage.from(BUCKET).remove([image.storagePath])).error
      : null;
    setImages((current) => current.filter((item) => item.id !== image.id));
    setBusyKey(null);
    setNotice(storageError
      ? { type: "error", message: "Se retiró de la galería, pero el archivo no pudo limpiarse de Storage." }
      : { type: "success", message: "Imagen eliminada." });
  }

  function updateImage(id: string, changes: Partial<AdminGalleryImage>) {
    setImages((current) => current.map((image) => image.id === id ? { ...image, ...changes } : image));
  }

  const isBusy = busyKey !== null;

  return (
    <div className="space-y-6">
      <form onSubmit={uploadImage} className="rounded-[1.75rem] border border-[#dce6e0] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e6f0ea] text-[#0f5132]"><UploadCloud size={24} /></div>
          <div><h2 className="text-xl font-black">Añadir imagen</h2><p className="mt-1 text-sm text-[#71847a]">JPG, PNG, WebP o AVIF. Máximo 8 MB.</p></div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Archivo"><input ref={fileRef} type="file" accept={ACCEPT} disabled={isBusy} onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="block min-h-13 w-full rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-3 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#e6f0ea] file:px-4 file:py-2 file:font-black file:text-[#0f5132]" /></Field>
          <TextField label="Descripción accesible *" value={alt} onChange={setAlt} placeholder="Ej. Grupo disfrutando la excursión" />
          <TextField label="Ubicación" value={location} onChange={setLocation} placeholder="Ej. Constanza" />
          <SelectField label="Categoría" value={category} onChange={(value) => setCategory(value as MediaCategory)} options={categories} />
          <SelectField label="Orientación" value={orientation} onChange={(value) => setOrientation(value as MediaOrientation)} options={orientations} />
          <label className="flex min-h-13 items-center gap-3 rounded-2xl bg-[#f4f8f5] px-4 font-bold"><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} className="h-5 w-5 accent-[#0f5132]" /> Destacar en portada</label>
        </div>
        <button type="submit" disabled={isBusy} className="mt-6 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-6 font-black text-[#07130f] disabled:opacity-60 sm:w-auto">{busyKey === "upload" ? <LoaderCircle className="animate-spin" size={20} /> : <ImagePlus size={20} />} Subir imagen</button>
      </form>

      {notice && <div role={notice.type === "error" ? "alert" : "status"} className={`flex gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold ${notice.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{notice.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}{notice.message}</div>}

      {images.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-[#bdcec4] bg-white py-12 text-center"><ImagePlus className="mx-auto text-[#668077]" /><h2 className="mt-4 text-xl font-black">La galería está vacía</h2></div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {images.map((image) => {
            const editing = editingId === image.id;
            return <article key={image.id} className="overflow-hidden rounded-[1.5rem] border border-[#dce6e0] bg-white shadow-sm">
              <div role="img" aria-label={image.alt} className="aspect-[4/3] bg-[#e9efeb] bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(image.src)})` }} />
              <div className="space-y-4 p-4">
                {editing ? <>
                  <Field label="Reemplazar fotografía">
                    <input
                      type="file"
                      accept={ACCEPT}
                      disabled={isBusy}
                      onChange={(event) => replaceImage(image, event.target.files?.[0] ?? null)}
                      className="block min-h-13 w-full rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-3 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#e6f0ea] file:px-3 file:py-2 file:font-black file:text-[#0f5132]"
                    />
                  </Field>
                  {busyKey === `replace-${image.id}` && <p className="flex items-center gap-2 text-sm font-bold text-[#0f5132]"><LoaderCircle size={16} className="animate-spin" /> Reemplazando imagen...</p>}
                  <TextField label="Descripción *" value={image.alt} onChange={(value) => updateImage(image.id, { alt: value })} />
                  <TextField label="Ubicación" value={image.location ?? ""} onChange={(value) => updateImage(image.id, { location: value })} />
                  <SelectField label="Categoría" value={image.category} onChange={(value) => updateImage(image.id, { category: value as MediaCategory })} options={categories} />
                  <SelectField label="Orientación" value={image.orientation} onChange={(value) => updateImage(image.id, { orientation: value as MediaOrientation })} options={orientations} />
                  <label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={image.featured ?? false} onChange={(event) => updateImage(image.id, { featured: event.target.checked })} className="h-5 w-5 accent-[#0f5132]" /> Destacar en portada</label>
                </> : <><div className="flex items-center justify-between"><span className="rounded-full bg-[#edf5f0] px-3 py-1 text-xs font-black text-[#0f5132]">{categories.find((item) => item.value === image.category)?.label}</span>{image.featured && <span className="text-xs font-black text-amber-600">Destacada</span>}</div><p className="text-sm leading-6 text-[#52675e]">{image.alt}</p><p className="text-xs font-bold text-[#84958c]">{image.location || "Sin ubicación"}</p></>}
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" disabled={isBusy} onClick={() => editing ? saveImage(image) : setEditingId(image.id)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#cad9d0] text-xs font-black text-[#0f5132]">{busyKey === `save-${image.id}` ? <LoaderCircle size={16} className="animate-spin" /> : editing ? <Save size={16} /> : <Pencil size={16} />}{editing ? "Guardar" : "Editar"}</button>
                  <button type="button" disabled={isBusy} onClick={() => deleteImage(image)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-200 text-xs font-black text-red-700">{busyKey === `delete-${image.id}` ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />} Eliminar</button>
                </div>
              </div>
            </article>;
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-black text-[#294238]">{label}</span>{children}</label>;
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <Field label={label}><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} maxLength={180} className="min-h-13 w-full rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-4 text-base outline-none focus:border-[#0f5132]" /></Field>;
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return <Field label={label}><select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-13 w-full rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-4 text-base outline-none focus:border-[#0f5132]">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>;
}

function toImage(row: Record<string, unknown>): AdminGalleryImage {
  return {
    id: String(row.id), src: String(row.source_url),
    storagePath: row.storage_path ? String(row.storage_path) : null,
    alt: String(row.alt_text), location: row.location ? String(row.location) : undefined,
    category: row.category as MediaCategory, orientation: row.orientation as MediaOrientation,
    featured: Boolean(row.featured), position: Number(row.position),
  };
}

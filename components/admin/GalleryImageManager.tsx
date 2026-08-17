"use client";

import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  FolderPlus,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type {
  AdminGalleryCollection,
  AdminGalleryImage,
  MediaCategory,
  MediaOrientation,
} from "@/types/media";

const BUCKET = "gallery-images";
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const MAX_BYTES = 8 * 1024 * 1024;
const MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
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
  initialCollections,
  initialImages,
}: {
  initialCollections: AdminGalleryCollection[];
  initialImages: AdminGalleryImage[];
}) {
  const [supabase] = useState(() => createClient());
  const [collections, setCollections] = useState(initialCollections);
  const [images, setImages] = useState(initialImages);
  const [selectedCollectionId, setSelectedCollectionId] = useState(
    initialCollections[0]?.id ?? "",
  );
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] =
    useState("");
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [category, setCategory] = useState<MediaCategory>("aventura");
  const [orientation, setOrientation] =
    useState<MediaOrientation>("horizontal");
  const [featured, setFeatured] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedCollection = collections.find(
    (collection) => collection.id === selectedCollectionId,
  );
  const selectedImages = useMemo(
    () =>
      images.filter(
        (image) =>
          image.collectionId === selectedCollectionId ||
          image.id === editingId,
      ),
    [editingId, images, selectedCollectionId],
  );
  const isBusy = busyKey !== null;

  async function createCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    const name = newCollectionName.trim();
    const description = newCollectionDescription.trim();
    const slug = slugify(name);
    if (name.length < 2 || name.length > 100 || !slug) {
      setNotice({
        type: "error",
        message: "El nombre de la carpeta debe tener entre 2 y 100 caracteres.",
      });
      return;
    }
    if (description.length > 500) {
      setNotice({
        type: "error",
        message: "La descripción no puede superar 500 caracteres.",
      });
      return;
    }

    setBusyKey("create-collection");
    const nextPosition =
      collections.reduce(
        (maximum, collection) => Math.max(maximum, collection.position),
        -1,
      ) + 1;
    const { data, error } = await supabase
      .from("gallery_collections")
      .insert({
        name,
        slug,
        description: description || null,
        position: nextPosition,
        published: true,
      })
      .select(
        "id, name, slug, description, position, published, created_at, updated_at",
      )
      .single();

    setBusyKey(null);
    if (error || !data) {
      setNotice({
        type: "error",
        message:
          "No se pudo crear la carpeta. Comprueba que no exista otra con el mismo nombre.",
      });
      return;
    }

    const collection = toCollection(data as Record<string, unknown>);
    setCollections((current) => [...current, collection]);
    setSelectedCollectionId(collection.id);
    setNewCollectionName("");
    setNewCollectionDescription("");
    setNotice({ type: "success", message: `Carpeta “${name}” creada.` });
  }

  async function saveCollection(collection: AdminGalleryCollection) {
    const name = collection.name.trim();
    const description = collection.description?.trim() ?? "";
    if (name.length < 2 || name.length > 100 || description.length > 500) {
      setNotice({
        type: "error",
        message: "Revisa el nombre y la descripción de la carpeta.",
      });
      return;
    }

    setBusyKey(`save-collection-${collection.id}`);
    setNotice(null);
    const { error } = await supabase
      .from("gallery_collections")
      .update({
        name,
        description: description || null,
        published: collection.published,
      })
      .eq("id", collection.id);

    setBusyKey(null);
    if (error) {
      setNotice({
        type: "error",
        message: "No se pudieron guardar los cambios de la carpeta.",
      });
      return;
    }

    setCollections((current) =>
      current.map((item) =>
        item.id === collection.id
          ? { ...item, name, description: description || undefined }
          : item,
      ),
    );
    setImages((current) =>
      current.map((image) =>
        image.collectionId === collection.id
          ? { ...image, location: name }
          : image,
      ),
    );
    setNotice({
      type: "success",
      message: "Información de la carpeta actualizada.",
    });
  }

  async function deleteCollection(collection: AdminGalleryCollection) {
    const imageCount = countCollectionImages(collection.id);
    if (imageCount > 0) {
      setNotice({
        type: "error",
        message:
          "Mueve o elimina las fotografías de esta carpeta antes de eliminarla.",
      });
      return;
    }
    if (!window.confirm(`¿Eliminar la carpeta “${collection.name}”?`)) return;

    setBusyKey(`delete-collection-${collection.id}`);
    setNotice(null);
    const { error } = await supabase
      .from("gallery_collections")
      .delete()
      .eq("id", collection.id);

    setBusyKey(null);
    if (error) {
      setNotice({ type: "error", message: "No se pudo eliminar la carpeta." });
      return;
    }

    const remaining = collections.filter((item) => item.id !== collection.id);
    setCollections(remaining);
    setSelectedCollectionId(remaining[0]?.id ?? "");
    setNotice({ type: "success", message: "Carpeta eliminada." });
  }

  async function uploadImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    if (!selectedCollection) {
      setNotice({
        type: "error",
        message: "Crea o selecciona una carpeta antes de subir fotografías.",
      });
      return;
    }
    if (!file || !MIME_TYPES.has(file.type)) {
      setNotice({
        type: "error",
        message: "Selecciona una imagen JPG, PNG, WebP o AVIF.",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      setNotice({
        type: "error",
        message: "La imagen supera el límite de 8 MB.",
      });
      return;
    }
    if (alt.trim().length < 3 || alt.trim().length > 180) {
      setNotice({
        type: "error",
        message: "La descripción debe tener entre 3 y 180 caracteres.",
      });
      return;
    }

    setBusyKey("upload");
    const storagePath = `${selectedCollection.slug}/${crypto.randomUUID()}.${extensions[file.type]}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      setBusyKey(null);
      setNotice({
        type: "error",
        message: "No se pudo subir la fotografía a Supabase Storage.",
      });
      return;
    }

    const sourceUrl = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath).data.publicUrl;
    const nextPosition =
      images.reduce(
        (maximum, image) => Math.max(maximum, image.position),
        -1,
      ) + 1;
    const { data, error } = await supabase
      .from("gallery_images")
      .insert({
        collection_id: selectedCollection.id,
        source_url: sourceUrl,
        storage_path: storagePath,
        alt_text: alt.trim(),
        location: selectedCollection.name,
        category,
        orientation,
        featured,
        position: nextPosition,
      })
      .select(
        "id, collection_id, source_url, storage_path, alt_text, location, category, orientation, featured, position",
      )
      .single();

    if (error || !data) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      setBusyKey(null);
      setNotice({
        type: "error",
        message: "El archivo subió, pero no se pudo añadir a la carpeta.",
      });
      return;
    }

    setImages((current) => [
      ...current,
      toImage(data as Record<string, unknown>, selectedCollection),
    ]);
    setFile(null);
    setAlt("");
    setFeatured(false);
    if (fileRef.current) fileRef.current.value = "";
    setBusyKey(null);
    setNotice({
      type: "success",
      message: `Imagen añadida a “${selectedCollection.name}”.`,
    });
  }

  async function saveImage(image: AdminGalleryImage) {
    const collection = collections.find(
      (item) => item.id === image.collectionId,
    );
    if (!collection) {
      setNotice({ type: "error", message: "Selecciona una carpeta válida." });
      return;
    }
    if (image.alt.trim().length < 3 || image.alt.trim().length > 180) {
      setNotice({
        type: "error",
        message: "La descripción debe tener entre 3 y 180 caracteres.",
      });
      return;
    }

    setBusyKey(`save-${image.id}`);
    setNotice(null);
    const { error } = await supabase
      .from("gallery_images")
      .update({
        collection_id: collection.id,
        alt_text: image.alt.trim(),
        location: collection.name,
        category: image.category,
        orientation: image.orientation,
        featured: image.featured ?? false,
      })
      .eq("id", image.id);

    setBusyKey(null);
    if (error) {
      setNotice({
        type: "error",
        message: "No se pudieron guardar los cambios de la fotografía.",
      });
      return;
    }

    updateImage(image.id, {
      alt: image.alt.trim(),
      location: collection.name,
      collectionSlug: collection.slug,
    });
    setEditingId(null);
    setNotice({
      type: "success",
      message: "Información de la fotografía actualizada.",
    });
  }

  async function replaceImage(
    image: AdminGalleryImage,
    replacement: File | null,
  ) {
    if (!replacement) return;
    if (!MIME_TYPES.has(replacement.type) || replacement.size > MAX_BYTES) {
      setNotice({
        type: "error",
        message:
          "El reemplazo debe ser JPG, PNG, WebP o AVIF y pesar menos de 8 MB.",
      });
      return;
    }

    const collection = collections.find(
      (item) => item.id === image.collectionId,
    );
    if (!collection) return;

    setBusyKey(`replace-${image.id}`);
    setNotice(null);
    const newPath = `${collection.slug}/${crypto.randomUUID()}.${extensions[replacement.type]}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(newPath, replacement, {
        cacheControl: "31536000",
        contentType: replacement.type,
        upsert: false,
      });

    if (uploadError) {
      setBusyKey(null);
      setNotice({
        type: "error",
        message: "No se pudo subir la imagen de reemplazo.",
      });
      return;
    }

    const newUrl = supabase.storage.from(BUCKET).getPublicUrl(newPath).data
      .publicUrl;
    const { error } = await supabase
      .from("gallery_images")
      .update({ source_url: newUrl, storage_path: newPath })
      .eq("id", image.id);

    if (error) {
      await supabase.storage.from(BUCKET).remove([newPath]);
      setBusyKey(null);
      setNotice({
        type: "error",
        message:
          "La nueva imagen subió, pero no pudo vincularse a la galería.",
      });
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
    if (!window.confirm("¿Eliminar esta fotografía de la galería?")) return;
    setBusyKey(`delete-${image.id}`);
    setNotice(null);

    const { error } = await supabase
      .from("gallery_images")
      .delete()
      .eq("id", image.id);
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
    setNotice(
      storageError
        ? {
            type: "error",
            message:
              "Se retiró de la galería, pero el archivo no pudo limpiarse de Storage.",
          }
        : { type: "success", message: "Imagen eliminada." },
    );
  }

  function updateCollection(
    id: string,
    changes: Partial<AdminGalleryCollection>,
  ) {
    setCollections((current) =>
      current.map((collection) =>
        collection.id === id ? { ...collection, ...changes } : collection,
      ),
    );
  }

  function updateImage(id: string, changes: Partial<AdminGalleryImage>) {
    setImages((current) =>
      current.map((image) =>
        image.id === id ? { ...image, ...changes } : image,
      ),
    );
  }

  function countCollectionImages(collectionId: string) {
    return images.filter((image) => image.collectionId === collectionId).length;
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={createCollection}
        className="rounded-[1.75rem] border border-[#dce6e0] bg-white p-5 shadow-sm sm:p-7"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e6f0ea] text-[#0f5132]">
            <FolderPlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black">Crear carpeta</h2>
            <p className="mt-1 text-sm text-[#71847a]">
              Usa el nombre del destino, por ejemplo Río Partido.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <TextField
            label="Nombre del destino *"
            value={newCollectionName}
            onChange={setNewCollectionName}
            placeholder="Ej. Río Partido"
            maxLength={100}
          />
          <TextAreaField
            label="Descripción opcional"
            value={newCollectionDescription}
            onChange={setNewCollectionDescription}
            placeholder="Breve descripción de la experiencia o el destino"
          />
        </div>
        <button
          type="submit"
          disabled={isBusy}
          className="mt-6 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#0f5132] px-6 font-black text-white disabled:opacity-60 sm:w-auto"
        >
          {busyKey === "create-collection" ? (
            <LoaderCircle className="animate-spin" size={20} />
          ) : (
            <FolderPlus size={20} />
          )}
          Crear carpeta
        </button>
      </form>

      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={`flex gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.type === "error" ? (
            <AlertCircle className="shrink-0" size={20} />
          ) : (
            <CheckCircle2 className="shrink-0" size={20} />
          )}
          {notice.message}
        </div>
      )}

      {collections.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-[#bdcec4] bg-white py-12 text-center">
          <FolderOpen className="mx-auto text-[#668077]" />
          <h2 className="mt-4 text-xl font-black">Crea la primera carpeta</h2>
          <p className="mt-2 text-sm text-[#71847a]">
            Después podrás subir y organizar sus fotografías.
          </p>
        </div>
      ) : (
        <>
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-black">Carpetas de destinos</h2>
              <p className="mt-1 text-sm text-[#71847a]">
                Selecciona una carpeta para administrarla y ver sus fotos.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {collections.map((collection) => {
                const collectionImages = images.filter(
                  (image) => image.collectionId === collection.id,
                );
                const cover =
                  collectionImages.find((image) => image.featured) ??
                  collectionImages[0];
                const selected = collection.id === selectedCollectionId;

                return (
                  <button
                    key={collection.id}
                    type="button"
                    disabled={isBusy}
                    onClick={() => {
                      setSelectedCollectionId(collection.id);
                      setEditingId(null);
                      setNotice(null);
                    }}
                    className={`overflow-hidden rounded-[1.5rem] border bg-white text-left shadow-sm transition ${
                      selected
                        ? "border-[#0f5132] ring-2 ring-[#0f5132]/15"
                        : "border-[#dce6e0] hover:border-[#9db4a7]"
                    }`}
                  >
                    <div
                      className="relative aspect-[16/8] bg-[#e6eee9] bg-cover bg-center"
                      style={
                        cover
                          ? { backgroundImage: `url(${JSON.stringify(cover.src)})` }
                          : undefined
                      }
                    >
                      {!cover && (
                        <FolderOpen
                          className="absolute left-5 top-5 text-[#789086]"
                          size={34}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                        <p className="text-lg font-black">{collection.name}</p>
                        <p className="mt-1 text-xs font-bold text-white/75">
                          {collectionImages.length}{" "}
                          {collectionImages.length === 1 ? "foto" : "fotos"}
                        </p>
                      </div>
                      {!collection.published && (
                        <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
                          Oculta
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {selectedCollection && (
            <section className="rounded-[1.75rem] border border-[#dce6e0] bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <FolderOpen className="text-[#0f5132]" size={23} />
                <div>
                  <h2 className="text-xl font-black">
                    Configurar {selectedCollection.name}
                  </h2>
                  <p className="mt-1 text-xs font-bold text-[#71847a]">
                    URL pública: /galeria/{selectedCollection.slug}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <TextField
                  label="Nombre de la carpeta *"
                  value={selectedCollection.name}
                  onChange={(value) =>
                    updateCollection(selectedCollection.id, { name: value })
                  }
                  maxLength={100}
                />
                <TextAreaField
                  label="Descripción"
                  value={selectedCollection.description ?? ""}
                  onChange={(value) =>
                    updateCollection(selectedCollection.id, {
                      description: value,
                    })
                  }
                />
                <label className="flex min-h-13 items-center gap-3 rounded-2xl bg-[#f4f8f5] px-4 font-bold sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={selectedCollection.published}
                    onChange={(event) =>
                      updateCollection(selectedCollection.id, {
                        published: event.target.checked,
                      })
                    }
                    className="h-5 w-5 accent-[#0f5132]"
                  />
                  Mostrar esta carpeta y sus fotografías en la página pública
                </label>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => saveCollection(selectedCollection)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lime-400 px-5 font-black text-[#07130f] disabled:opacity-60"
                >
                  {busyKey ===
                  `save-collection-${selectedCollection.id}` ? (
                    <LoaderCircle className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Guardar carpeta
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => deleteCollection(selectedCollection)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-red-200 px-5 font-black text-red-700 disabled:opacity-60"
                >
                  <Trash2 size={18} /> Eliminar carpeta
                </button>
              </div>
            </section>
          )}

          {selectedCollection && (
            <form
              onSubmit={uploadImage}
              className="rounded-[1.75rem] border border-[#dce6e0] bg-white p-5 shadow-sm sm:p-7"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e6f0ea] text-[#0f5132]">
                  <UploadCloud size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black">
                    Añadir imagen a {selectedCollection.name}
                  </h2>
                  <p className="mt-1 text-sm text-[#71847a]">
                    JPG, PNG, WebP o AVIF. Máximo 8 MB.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Archivo">
                  <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPT}
                    disabled={isBusy}
                    onChange={(event) =>
                      setFile(event.target.files?.[0] ?? null)
                    }
                    className="block min-h-13 w-full rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-3 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#e6f0ea] file:px-4 file:py-2 file:font-black file:text-[#0f5132]"
                  />
                </Field>
                <TextField
                  label="Descripción accesible *"
                  value={alt}
                  onChange={setAlt}
                  placeholder="Ej. Grupo disfrutando la excursión"
                  maxLength={180}
                />
                <SelectField
                  label="Categoría"
                  value={category}
                  onChange={(value) => setCategory(value as MediaCategory)}
                  options={categories}
                />
                <SelectField
                  label="Orientación"
                  value={orientation}
                  onChange={(value) =>
                    setOrientation(value as MediaOrientation)
                  }
                  options={orientations}
                />
                <label className="flex min-h-13 items-center gap-3 rounded-2xl bg-[#f4f8f5] px-4 font-bold sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(event) => setFeatured(event.target.checked)}
                    className="h-5 w-5 accent-[#0f5132]"
                  />
                  Destacar como portada de la carpeta y en el inicio
                </label>
              </div>
              <button
                type="submit"
                disabled={isBusy}
                className="mt-6 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-6 font-black text-[#07130f] disabled:opacity-60 sm:w-auto"
              >
                {busyKey === "upload" ? (
                  <LoaderCircle className="animate-spin" size={20} />
                ) : (
                  <ImagePlus size={20} />
                )}
                Subir imagen
              </button>
            </form>
          )}

          {selectedCollection && (
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-black">
                  Fotografías de {selectedCollection.name}
                </h2>
                <p className="mt-1 text-sm text-[#71847a]">
                  Puedes mover cada fotografía a otra carpeta al editarla.
                </p>
              </div>

              {selectedImages.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-[#bdcec4] bg-white py-12 text-center">
                  <ImagePlus className="mx-auto text-[#668077]" />
                  <h3 className="mt-4 text-xl font-black">
                    Esta carpeta está vacía
                  </h3>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {selectedImages.map((image) => {
                    const editing = editingId === image.id;
                    const imageCollection = collections.find(
                      (collection) => collection.id === image.collectionId,
                    );

                    return (
                      <article
                        key={image.id}
                        className="overflow-hidden rounded-[1.5rem] border border-[#dce6e0] bg-white shadow-sm"
                      >
                        <div
                          role="img"
                          aria-label={image.alt}
                          className="aspect-[4/3] bg-[#e9efeb] bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${JSON.stringify(image.src)})`,
                          }}
                        />
                        <div className="space-y-4 p-4">
                          {editing ? (
                            <>
                              <Field label="Reemplazar fotografía">
                                <input
                                  type="file"
                                  accept={ACCEPT}
                                  disabled={isBusy}
                                  onChange={(event) =>
                                    replaceImage(
                                      image,
                                      event.target.files?.[0] ?? null,
                                    )
                                  }
                                  className="block min-h-13 w-full rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-3 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#e6f0ea] file:px-3 file:py-2 file:font-black file:text-[#0f5132]"
                                />
                              </Field>
                              {busyKey === `replace-${image.id}` && (
                                <p className="flex items-center gap-2 text-sm font-bold text-[#0f5132]">
                                  <LoaderCircle
                                    size={16}
                                    className="animate-spin"
                                  />
                                  Reemplazando imagen...
                                </p>
                              )}
                              <SelectField
                                label="Carpeta"
                                value={image.collectionId}
                                onChange={(value) =>
                                  updateImage(image.id, {
                                    collectionId: value,
                                  })
                                }
                                options={collections.map((collection) => ({
                                  value: collection.id,
                                  label: collection.name,
                                }))}
                              />
                              <TextField
                                label="Descripción *"
                                value={image.alt}
                                onChange={(value) =>
                                  updateImage(image.id, { alt: value })
                                }
                                maxLength={180}
                              />
                              <SelectField
                                label="Categoría"
                                value={image.category}
                                onChange={(value) =>
                                  updateImage(image.id, {
                                    category: value as MediaCategory,
                                  })
                                }
                                options={categories}
                              />
                              <SelectField
                                label="Orientación"
                                value={image.orientation}
                                onChange={(value) =>
                                  updateImage(image.id, {
                                    orientation: value as MediaOrientation,
                                  })
                                }
                                options={orientations}
                              />
                              <label className="flex items-center gap-3 text-sm font-bold">
                                <input
                                  type="checkbox"
                                  checked={image.featured ?? false}
                                  onChange={(event) =>
                                    updateImage(image.id, {
                                      featured: event.target.checked,
                                    })
                                  }
                                  className="h-5 w-5 accent-[#0f5132]"
                                />
                                Destacar como portada
                              </label>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-between gap-3">
                                <span className="rounded-full bg-[#edf5f0] px-3 py-1 text-xs font-black text-[#0f5132]">
                                  {imageCollection?.name ?? "Sin carpeta"}
                                </span>
                                {image.featured && (
                                  <span className="text-xs font-black text-amber-600">
                                    Portada
                                  </span>
                                )}
                              </div>
                              <p className="text-sm leading-6 text-[#52675e]">
                                {image.alt}
                              </p>
                              <p className="text-xs font-bold text-[#84958c]">
                                {
                                  categories.find(
                                    (item) => item.value === image.category,
                                  )?.label
                                }
                              </p>
                            </>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                editing
                                  ? saveImage(image)
                                  : setEditingId(image.id)
                              }
                              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#cad9d0] text-xs font-black text-[#0f5132]"
                            >
                              {busyKey === `save-${image.id}` ? (
                                <LoaderCircle
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : editing ? (
                                <Save size={16} />
                              ) : (
                                <Pencil size={16} />
                              )}
                              {editing ? "Guardar" : "Editar"}
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => deleteImage(image)}
                              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-200 text-xs font-black text-red-700"
                            >
                              {busyKey === `delete-${image.id}` ? (
                                <LoaderCircle
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={16} />
                              )}
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-[#294238]">
        {label}
      </span>
      {children}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength = 180,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <Field label={label}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="min-h-13 w-full rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-4 text-base outline-none focus:border-[#0f5132]"
      />
    </Field>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={500}
        rows={3}
        className="w-full resize-y rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-4 py-3 text-base outline-none focus:border-[#0f5132]"
      />
    </Field>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-13 w-full rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-4 text-base outline-none focus:border-[#0f5132]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function toImage(
  row: Record<string, unknown>,
  collection: AdminGalleryCollection,
): AdminGalleryImage {
  return {
    id: String(row.id),
    src: String(row.source_url),
    storagePath: row.storage_path ? String(row.storage_path) : null,
    alt: String(row.alt_text),
    collectionId: String(row.collection_id),
    collectionSlug: collection.slug,
    location: collection.name,
    category: row.category as MediaCategory,
    orientation: row.orientation as MediaOrientation,
    featured: Boolean(row.featured),
    position: Number(row.position),
  };
}

function toCollection(row: Record<string, unknown>): AdminGalleryCollection {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: row.description ? String(row.description) : undefined,
    position: Number(row.position),
    published: Boolean(row.published),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    images: [],
  };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

"use client";

import { useMemo, useState } from "react";
import { Mountain, Search, SlidersHorizontal, X } from "lucide-react";

import TourCard from "@/components/tours/TourCard";
import type { Tour, TourCategory, TourDifficulty } from "@/types/tour";

interface ToursCatalogProps {
  tours: Tour[];
}

type CategoryFilter = "todos" | TourCategory;
type DifficultyFilter = "todas" | TourDifficulty;

const categories: { value: CategoryFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "senderismo", label: "Senderismo" },
  { value: "cascada", label: "Cascadas" },
  { value: "montana", label: "Montañas" },
  { value: "playa", label: "Playas" },
  { value: "balneario", label: "Balnearios" },
  { value: "parque_nacional", label: "Parques nacionales" },
  { value: "ecologico", label: "Ecológicos" },
];

const difficulties: { value: DifficultyFilter; label: string }[] = [
  { value: "todas", label: "Todas las dificultades" },
  { value: "facil", label: "Fácil" },
  { value: "moderada", label: "Moderada" },
  { value: "demandante", label: "Demandante" },
];

export default function ToursCatalog({ tours }: ToursCatalogProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("todos");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("todas");

  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      const normalizedSearch = search.trim().toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        tour.title.toLowerCase().includes(normalizedSearch) ||
        tour.location.toLowerCase().includes(normalizedSearch) ||
        tour.province.toLowerCase().includes(normalizedSearch) ||
        tour.shortDescription.toLowerCase().includes(normalizedSearch);

      const matchesCategory = category === "todos" || tour.category === category;
      const matchesDifficulty =
        difficulty === "todas" || tour.difficulty === difficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [tours, search, category, difficulty]);

  const hasFilters =
    search !== "" || category !== "todos" || difficulty !== "todas";

  function clearFilters() {
    setSearch("");
    setCategory("todos");
    setDifficulty("todas");
  }

  return (
    <section className="bg-[#f4f7f5] px-4 py-14 text-[#14231c] sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0f5132] sm:text-sm">
              Próximas experiencias
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Encuentra tu próxima aventura
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-[#597067]">
              Explora nuestras próximas excursiones y encuentra la experiencia
              perfecta para ti.
            </p>
          </div>

          <div aria-live="polite" className="text-sm font-bold text-[#597067]">
            {filteredTours.length}{" "}
            {filteredTours.length === 1
              ? "experiencia disponible"
              : "experiencias disponibles"}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-[#dce5df] bg-white p-4 shadow-sm sm:mt-10 sm:p-5">
          <div className="relative">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#668076]"
            />
            <input
              type="search"
              inputMode="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar destino o experiencia..."
              aria-label="Buscar tours"
              className="min-h-14 w-full rounded-2xl border border-[#dce5df] bg-[#f8faf9] pl-12 pr-4 text-base text-[#14231c] outline-none transition placeholder:text-[#8b9d95] focus:border-[#0f5132] focus:ring-2 focus:ring-[#0f5132]/10"
            />
          </div>

          <div className="mt-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#0f5132]">
              <SlidersHorizontal size={18} />
              Categoría
            </div>

            <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:flex-wrap lg:overflow-visible">
              {categories.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCategory(item.value)}
                  aria-pressed={category === item.value}
                  className={`min-h-11 shrink-0 touch-manipulation rounded-full px-4 py-2 text-sm font-bold transition active:scale-[0.98] ${
                    category === item.value
                      ? "bg-[#0f5132] text-white"
                      : "bg-[#eef3f0] text-[#486056] active:bg-[#dfe9e3] sm:hover:bg-[#dfe9e3]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <select
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as DifficultyFilter)
              }
              aria-label="Filtrar por dificultad"
              className="min-h-12 w-full rounded-2xl border border-[#dce5df] bg-white px-4 text-base font-bold text-[#486056] outline-none focus:border-[#0f5132] sm:w-auto sm:rounded-full sm:text-sm"
            >
              {difficulties.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex min-h-12 touch-manipulation items-center justify-center gap-2 rounded-full px-4 text-sm font-bold text-[#8b423b] transition active:bg-red-50 sm:justify-start sm:hover:bg-red-50"
              >
                <X size={17} />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {filteredTours.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:mt-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {filteredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-[#b8c9c0] bg-white px-5 py-12 text-center sm:mt-10 sm:px-6 sm:py-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef3f0] text-[#0f5132]">
              <Mountain size={30} />
            </div>
            <h3 className="mt-5 text-2xl font-black">No encontramos experiencias</h3>
            <p className="mx-auto mt-3 max-w-md leading-7 text-[#60746b]">
              Intenta cambiar los filtros o buscar otro destino.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 min-h-12 touch-manipulation rounded-full bg-[#0f5132] px-6 py-3 font-extrabold text-white active:scale-[0.98]"
            >
              Mostrar todos los tours
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

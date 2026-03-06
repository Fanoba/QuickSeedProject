/**
 * useProyectos.ts
 * Carga proyectos desde la API. Si falla (o en modo MOCK),
 * usa los datos estáticos de mockData como fallback.
 */
import { useEffect, useState } from "react";
import { proyectosService, ApiException } from "@/data";
import type { Proyecto } from "@/data";

// mockData como fallback visual
import { projects as mockProjects, categories as mockCategories } from "@/data/mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// Adapta el formato del mockData al tipo Proyecto del backend
function adaptMock(): Proyecto[] {
  return mockProjects.map((p) => ({
    id: Number(p.id),
    titulo: p.title,
    descripcion: p.description,
    categoria_id: 1,
    categoria: { id: 1, nombre: p.category },
    imagen_url: p.image,
    meta: p.goal,
    recaudado: p.raised,
    porcentaje: Math.round((p.raised / p.goal) * 100),
    activo: true,
    created_at: new Date().toISOString(),
  }));
}

export function useProyectos(params?: { categoria_id?: number }) {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [categorias, setCategorias] = useState<string[]>(mockCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      if (USE_MOCK) {
        setProyectos(adaptMock());
        setUsingMock(true);
        setLoading(false);
        return;
      }

      try {
        const [data, cats] = await Promise.all([
          proyectosService.getAll(params),
          proyectosService.getCategorias(),
        ]);
        setProyectos(data);
        setCategorias(["Todos", ...cats.map((c) => c.nombre)]);
        setUsingMock(false);
      } catch (err) {
        // Fallback a mockData si la API no responde
        console.warn("[useProyectos] API no disponible, usando mockData", err);
        setProyectos(adaptMock());
        setCategorias(mockCategories);
        setUsingMock(true);
        if (err instanceof ApiException && err.status !== 0) {
          setError(`Error ${err.status}: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params?.categoria_id]);

  return { proyectos, categorias, loading, error, usingMock };
}

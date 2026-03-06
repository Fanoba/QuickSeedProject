import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, WifiOff } from "lucide-react";
import { useProyectos } from "@/hooks/useProyectos";

const Projects = () => {
  const [activeCategoria, setActiveCategoria] = useState("Todos");
  const { proyectos, categorias, loading, error, usingMock } = useProyectos();

  const filtered =
    activeCategoria === "Todos"
      ? proyectos
      : proyectos.filter((p) => p.categoria.nombre === activeCategoria);

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Nuestros Proyectos</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Explora los proyectos que están generando impacto real en comunidades de México.
            </p>
          </div>

          {/* Badge modo mock */}
          {usingMock && (
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 text-xs bg-secondary/10 text-secondary border border-secondary/30 px-3 py-1.5 rounded-full">
                <WifiOff className="h-3 w-3" /> Mostrando datos de demostración
              </span>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categorias.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={activeCategoria === cat ? "default" : "outline"}
                onClick={() => setActiveCategoria(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={project.imagen_url ?? ""}
                    alt={project.titulo}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-5">
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {project.categoria.nombre}
                    </span>
                    <h3 className="text-lg font-bold mt-3 mb-2">{project.titulo}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{project.descripcion}</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">
                          ${(project.recaudado / 1000000).toFixed(1)}M
                        </span>
                        <span className="text-muted-foreground">
                          Meta: ${(project.meta / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <Progress value={project.porcentaje} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{project.porcentaje}% completado</span>
                      <Link to={`/donate?project=${project.id}`}>
                        <Button size="sm">Donar</Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Projects;

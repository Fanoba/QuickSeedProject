import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Shield, Users, TrendingUp, Sprout, FileCheck, CreditCard, Zap, Copy, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useProyectos } from "@/hooks/useProyectos";

const CLABE = "012 180 0123 4567 8901";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Index = () => {
  const { proyectos, loading } = useProyectos();

  const featured = proyectos.slice(0, 3);
  const totalRaised = proyectos.reduce((s, p) => s + p.recaudado, 0);
  const totalDonors = proyectos.reduce((s, p) => s + 0, 0); // suma de donantes viene del analytics

  const handleCopyClabe = () => {
    navigator.clipboard.writeText(CLABE.replace(/\s/g, ""));
    toast.success("CLABE copiada al portapapeles");
  };

  return (
    <Layout>
      {/* Quick Donation Banner */}
      <section className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card border-2 border-primary/20 rounded-xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Quick Donation – Transferencia Directa</h3>
                <p className="text-sm text-muted-foreground">Transfiere al instante sin registro. Sin registro para montos menores a $100,000.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-muted rounded-lg px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">CLABE Interbancaria</p>
                <p className="font-mono font-bold text-base">{CLABE}</p>
                <p className="text-xs text-muted-foreground">BBVA · QuickSeed Fundación A.C.</p>
              </div>
              <Button size="sm" variant="outline" onClick={handleCopyClabe}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Link to="/donate">
              <Button size="sm" variant="outline">Más opciones →</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sprout className="h-4 w-4" /> Plataforma de donaciones verificada
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Planta una Semilla para<br />
              <span className="text-primary">un Futuro Mejor</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Dona de forma segura y transparente. Cada contribución es verificada con tecnología de
              cumplimiento legal para garantizar tu tranquilidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/donate">
                <Button size="lg" className="text-base px-8">
                  <Heart className="mr-2 h-5 w-5" /> Donar Ahora
                </Button>
              </Link>
              <Link to="/projects">
                <Button size="lg" variant="outline" className="text-base px-8">
                  Ver Proyectos
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: TrendingUp, label: "Recaudado", value: `$${(totalRaised / 1000000).toFixed(1)}M` },
              { icon: Sprout, label: "Proyectos", value: proyectos.length.toString() },
              { icon: Users, label: "Donantes", value: "1,421" },
              { icon: Shield, label: "Transparencia", value: "100%" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <stat.icon className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <p className="text-3xl md:text-4xl font-bold">{stat.value}</p>
                <p className="text-sm opacity-70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Proyectos Destacados</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Conoce los proyectos que están transformando comunidades en todo México.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {featured.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img src={project.imagen_url ?? ""} alt={project.titulo} className="w-full h-48 object-cover" />
                  <div className="p-5">
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {project.categoria.nombre}
                    </span>
                    <h3 className="text-lg font-bold mt-3 mb-2">{project.titulo}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.descripcion}</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">${(project.recaudado / 1000000).toFixed(1)}M recaudados</span>
                        <span className="text-muted-foreground">{project.porcentaje}%</span>
                      </div>
                      <Progress value={project.porcentaje} className="h-2" />
                    </div>
                    <Link to={`/donate?project=${project.id}`}>
                      <Button size="sm" className="w-full">Donar a este proyecto</Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/projects">
              <Button variant="outline" size="lg">Ver todos los proyectos</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="about" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Cómo Funciona?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Un proceso simple, seguro y transparente.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: CreditCard, title: "1. Elige y Dona", desc: "Selecciona un proyecto y el monto que deseas donar. Aceptamos múltiples métodos de pago." },
              { icon: FileCheck, title: "2. Verificación", desc: "Si tu donación supera el umbral, validamos tus documentos con tecnología AML/KYC automática." },
              { icon: Shield, title: "3. Impacto Seguro", desc: "Tu donación llega verificada al proyecto. Recibe reportes de impacto y deducibilidad fiscal." },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

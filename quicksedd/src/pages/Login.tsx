import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Sprout, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usuariosService, ApiException } from "@/data";
import { toast } from "sonner";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rfc, setRfc] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        // 1. Crear cuenta
        await usuariosService.create({ nombre, email, password, telefono, rfc });
        toast.success("Cuenta creada. Iniciando sesión...");
      }
      
      // 2. Login (¡Aquí atrapamos al usuario que nos devuelve el context!)
      const user = await login(email, password);
      toast.success("Bienvenido de vuelta");

      // 3. Redirige según el rol
      if (user?.rol === "admin") {
        navigate("/admin");
      } else {
        navigate("/"); // Si es 'donante' o cualquier otro, va a la página de inicio
      }
      
    } catch (err) {
      const msg = err instanceof ApiException ? err.message : "Error al iniciar sesión";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-card border rounded-lg p-8">
            <div className="text-center mb-6">
              <Sprout className="h-10 w-10 text-primary mx-auto mb-3" />
              <h1 className="text-2xl font-bold">
                {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isRegister ? "Únete a la comunidad QuickSeed" : "Bienvenido de vuelta"}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {isRegister && (
                <>
                  <div>
                    <label className="text-sm font-medium block mb-1">Nombre completo</label>
                    <Input
                      placeholder="Tu nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Teléfono</label>
                    <Input
                      type="tel"
                      placeholder="+52 55 1234-5678"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">RFC</label>
                    <Input
                      placeholder="XXXX000000XXX"
                      value={rfc}
                      onChange={(e) => setRfc(e.target.value.toUpperCase())}
                      maxLength={13}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium block mb-1">Correo electrónico</label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Contraseña</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isRegister ? "Registrarse" : "Entrar"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-primary font-medium hover:underline"
              >
                {isRegister ? "Inicia sesión" : "Regístrate"}
              </button>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;

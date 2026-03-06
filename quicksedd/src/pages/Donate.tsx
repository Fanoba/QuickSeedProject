import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Shield, Upload, CheckCircle, AlertTriangle, FileCheck, Zap, Copy, Camera, LogIn, UserPlus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useProyectos } from "@/hooks/useProyectos";
import { donacionesService, usuariosService, ApiException } from "@/data";

const THRESHOLD = 100000;
const presetAmounts = [1000, 5000, 10000, 50000, 100000];
const CLABE = "012 180 0123 4567 8901";

type Step = "method" | "amount" | "login" | "verification" | "confirmation";

const Donate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login, isAuthenticated } = useAuth();
  const preselectedProject = searchParams.get("project") || "";
  const isProjectDirect = !!preselectedProject;

  const { proyectos } = useProyectos();

  const [step, setStep] = useState<Step>(isProjectDirect ? "amount" : "method");
  const [method, setMethod] = useState<"online" | "quick" | null>(isProjectDirect ? "online" : null);
  const [amount, setAmount] = useState("");
  const [project, setProject] = useState(preselectedProject);
  const [needsDeductible, setNeedsDeductible] = useState(false);
  const [rfc, setRfc] = useState(user?.rfc ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanDone, setScanDone] = useState(false);
  const [ineUploaded, setIneUploaded] = useState(false);
  const [csfUploaded, setCsfUploaded] = useState(false);
  const [loginMode, setLoginMode] = useState<"login" | "register">("register");
  const [loginLoading, setLoginLoading] = useState(false);
  const [donating, setDonating] = useState(false);

  // Login form state
  const [loginNombre, setLoginNombre] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginTelefono, setLoginTelefono] = useState("");
  const [loginRfc, setLoginRfc] = useState("");

  const numAmount = parseFloat(amount) || 0;
  const needsVerification = numAmount >= THRESHOLD;

  const handleCopyClabe = () => {
    navigator.clipboard.writeText(CLABE.replace(/\s/g, ""));
    toast.success("CLABE copiada al portapapeles");
  };

  const handleProceed = () => {
    if (!amount || !project) return;
    if (needsDeductible && (rfc.length < 12 || !email)) {
      toast.error("Completa tu RFC y correo para el recibo deducible.");
      return;
    }
    if (needsVerification) {
      if (isAuthenticated) {
        setStep("verification");
      } else {
        setStep("login");
      }
    } else {
      handleCreateDonacion();
    }
  };

  const handleCreateDonacion = async () => {
    setDonating(true);
    try {
      await donacionesService.create({
        proyecto_id: Number(project),
        monto: numAmount,
        metodo_pago: method === "quick" ? "transferencia" : "online",
      });
      setStep("confirmation");
    } catch (err) {
      // Si no hay sesión para montos pequeños, igual confirmamos (transferencia directa)
      if (err instanceof ApiException && err.status === 401) {
        setStep("confirmation");
      } else {
        toast.error(err instanceof ApiException ? err.message : "Error al procesar donación");
      }
    } finally {
      setDonating(false);
    }
  };

  const handleLoginProceed = async () => {
    setLoginLoading(true);
    try {
      if (loginMode === "register") {
        await usuariosService.create({
          nombre: loginNombre,
          email: loginEmail,
          password: loginPassword,
          telefono: loginTelefono,
          rfc: loginRfc,
        });
        toast.success("Cuenta creada");
      }
      await login(loginEmail, loginPassword);
      toast.success("Sesión iniciada");
      setStep("verification");
      setScanProgress(0);
      setScanDone(false);
    } catch (err) {
      toast.error(err instanceof ApiException ? err.message : "Error de autenticación");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleStartVerification = () => {
    if (!ineUploaded && !csfUploaded) {
      toast.error("Debes subir al menos un documento para continuar.");
      return;
    }
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setScanDone(true);
      }
      setScanProgress(progress);
    }, 400);
  };

  const selectedProject = proyectos.find((p) => String(p.id) === project);

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-3">Hacer una Donación</h1>
            <p className="text-muted-foreground">Seguro, transparente y con impacto verificado.</p>
          </div>

          <AnimatePresence mode="wait">

            {/* Step 1: Método */}
            {step === "method" && (
              <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div
                  className={`bg-card border-2 rounded-lg p-6 cursor-pointer transition-colors ${method === "quick" ? "border-primary" : "border-border hover:border-primary/50"}`}
                  onClick={() => setMethod("quick")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">Transferencia Directa</h3>
                      <p className="text-sm text-muted-foreground">Transfiere por SPEI. Sin registro para montos menores a $100,000.</p>
                    </div>
                  </div>
                </div>
                <div
                  className={`bg-card border-2 rounded-lg p-6 cursor-pointer transition-colors ${method === "online" ? "border-primary" : "border-border hover:border-primary/50"}`}
                  onClick={() => setMethod("online")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-bold">Donación en Línea</h3>
                      <p className="text-sm text-muted-foreground">Selecciona proyecto y monto. Verificación automática para montos mayores a $100,000.</p>
                    </div>
                  </div>
                </div>

                {method === "quick" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card border rounded-lg p-6 space-y-4">
                    <h3 className="font-bold text-center">Datos para Transferencia</h3>
                    <div className="bg-muted rounded-lg p-4 space-y-3">
                      <div><p className="text-xs text-muted-foreground">Banco</p><p className="font-medium">BBVA México</p></div>
                      <div><p className="text-xs text-muted-foreground">Beneficiario</p><p className="font-medium">QuickSeed Fundación A.C.</p></div>
                      <div>
                        <p className="text-xs text-muted-foreground">CLABE Interbancaria</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold text-lg">{CLABE}</p>
                          <Button size="sm" variant="outline" onClick={handleCopyClabe}><Copy className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <Button className="w-full" size="lg" disabled={!method} onClick={() => setStep("amount")}>
                  Continuar
                </Button>
              </motion.div>
            )}

            {/* Step 2: Monto */}
            {step === "amount" && (
              <motion.div key="amount" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-card border rounded-lg p-6 space-y-5">
                  {!isProjectDirect && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Proyecto</label>
                      <Select value={project} onValueChange={setProject}>
                        <SelectTrigger><SelectValue placeholder="Selecciona un proyecto" /></SelectTrigger>
                        <SelectContent>
                          {proyectos.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>{p.titulo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {isProjectDirect && selectedProject && (
                    <div className="bg-muted rounded-lg p-3 flex items-center gap-3">
                      <img src={selectedProject.imagen_url ?? ""} alt="" className="w-12 h-12 rounded object-cover" />
                      <div>
                        <p className="text-xs text-muted-foreground">Proyecto seleccionado</p>
                        <p className="font-medium text-sm">{selectedProject.titulo}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Monto (MXN)</label>
                    <Input type="number" placeholder="$0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {presetAmounts.map((a) => (
                        <Button key={a} size="sm" variant="outline" onClick={() => setAmount(a.toString())}>${a.toLocaleString()}</Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch checked={needsDeductible} onCheckedChange={setNeedsDeductible} />
                    <label className="text-sm font-medium">Necesito recibo deducible de impuestos</label>
                  </div>

                  {needsDeductible && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                      <div>
                        <label className="text-sm font-medium block mb-1">RFC</label>
                        <Input placeholder="XXXX000000XXX" value={rfc} onChange={(e) => setRfc(e.target.value.toUpperCase())} maxLength={13} />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">Correo para recibo</label>
                        <Input type="email" placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                    </motion.div>
                  )}

                  {needsVerification && (
                    <div className="flex items-start gap-3 bg-destructive/5 border border-destructive/30 rounded-lg p-4">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Verificación obligatoria</p>
                        <p className="text-xs text-muted-foreground">Donaciones ≥ $100,000 MXN requieren cuenta verificada con documentos KYC.</p>
                      </div>
                    </div>
                  )}

                  {!needsVerification && numAmount > 0 && (
                    <div className="bg-muted rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Transferencia rápida disponible</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold">{CLABE}</p>
                        <Button size="sm" variant="outline" onClick={handleCopyClabe}><Copy className="h-3 w-3" /></Button>
                      </div>
                      <p className="text-xs text-muted-foreground">BBVA · QuickSeed Fundación A.C.</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {!isProjectDirect && <Button variant="outline" onClick={() => setStep("method")}>Atrás</Button>}
                    <Button
                      className="flex-1" size="lg"
                      onClick={handleProceed}
                      disabled={!amount || !project || donating}
                    >
                      {donating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {needsVerification ? "Continuar a Registro" : "Confirmar Donación"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Login / Registro */}
            {step === "login" && (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-card border rounded-lg p-6 space-y-5">
                  <div className="text-center">
                    <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
                    <h2 className="text-xl font-bold">Cuenta Requerida</h2>
                    <p className="text-sm text-muted-foreground">Para donaciones ≥ $100,000 MXN necesitas una cuenta verificada.</p>
                  </div>
                  <div className="flex rounded-lg border overflow-hidden">
                    <button className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${loginMode === "login" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`} onClick={() => setLoginMode("login")}>
                      <LogIn className="h-4 w-4" /> Iniciar Sesión
                    </button>
                    <button className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${loginMode === "register" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`} onClick={() => setLoginMode("register")}>
                      <UserPlus className="h-4 w-4" /> Crear Cuenta
                    </button>
                  </div>

                  {loginMode === "login" ? (
                    <>
                      <div><label className="text-sm font-medium block mb-1">Correo</label><Input type="email" placeholder="correo@ejemplo.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} /></div>
                      <div><label className="text-sm font-medium block mb-1">Contraseña</label><Input type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} /></div>
                    </>
                  ) : (
                    <>
                      <div><label className="text-sm font-medium block mb-1">Nombre completo</label><Input placeholder="Tu nombre" value={loginNombre} onChange={(e) => setLoginNombre(e.target.value)} /></div>
                      <div><label className="text-sm font-medium block mb-1">Correo</label><Input type="email" placeholder="correo@ejemplo.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} /></div>
                      <div><label className="text-sm font-medium block mb-1">RFC</label><Input placeholder="XXXX000000XXX" value={loginRfc} onChange={(e) => setLoginRfc(e.target.value.toUpperCase())} maxLength={13} /></div>
                      <div><label className="text-sm font-medium block mb-1">Teléfono</label><Input type="tel" placeholder="+52 55 1234-5678" value={loginTelefono} onChange={(e) => setLoginTelefono(e.target.value)} /></div>
                      <div><label className="text-sm font-medium block mb-1">Contraseña</label><Input type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} /></div>
                    </>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep("amount")}>Atrás</Button>
                    <Button className="flex-1" size="lg" onClick={handleLoginProceed} disabled={loginLoading}>
                      {loginLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {loginMode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Verificación KYC */}
            {step === "verification" && (
              <motion.div key="verification" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-card border rounded-lg p-6 space-y-5">
                  <div className="text-center">
                    <FileCheck className="h-10 w-10 text-primary mx-auto mb-3" />
                    <h2 className="text-xl font-bold">Verificación de Identidad</h2>
                    <p className="text-sm text-muted-foreground">Sube tus documentos para completar la verificación AML/KYC.</p>
                  </div>
                  <div className="grid gap-3">
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${ineUploaded ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"}`}
                      onClick={() => { setIneUploaded(true); toast.success("INE/CURP subida (simulado)"); }}
                    >
                      {ineUploaded ? <CheckCircle className="h-6 w-6 text-primary mx-auto mb-1" /> : <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />}
                      <p className="text-sm font-medium">{ineUploaded ? "INE/CURP ✓" : "Subir INE o CURP"}</p>
                      <p className="text-xs text-muted-foreground">PDF o imagen escaneada</p>
                    </div>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${csfUploaded ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"}`}
                      onClick={() => { setCsfUploaded(true); toast.success("Constancia Fiscal subida (simulado)"); }}
                    >
                      {csfUploaded ? <CheckCircle className="h-6 w-6 text-primary mx-auto mb-1" /> : <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />}
                      <p className="text-sm font-medium">{csfUploaded ? "Constancia Fiscal ✓" : "Subir Constancia de Situación Fiscal"}</p>
                      <p className="text-xs text-muted-foreground">PDF del SAT</p>
                    </div>
                  </div>

                  {scanProgress > 0 && (
                    <div className="space-y-2">
                      <Progress value={scanProgress} className="h-2" />
                      <p className={`text-xs text-center font-medium ${scanProgress < 50 ? "text-primary" : ""}`}>✓ Verificación de identidad (INE/CURP)</p>
                      <p className={`text-xs text-center font-medium ${scanProgress > 50 ? "text-primary" : ""}`}>✓ Validación de constancia fiscal</p>
                      <p className={`text-xs text-center font-medium ${scanProgress > 80 ? "text-primary" : ""}`}>✓ Revisión antilavado (AML/KYC)</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep("login")}>Atrás</Button>
                    {scanProgress === 0 ? (
                      <Button className="flex-1" size="lg" onClick={handleStartVerification} disabled={!ineUploaded && !csfUploaded}>
                        Iniciar Verificación
                      </Button>
                    ) : (
                      <Button className="flex-1" size="lg" disabled={!scanDone} onClick={() => handleCreateDonacion()}>
                        {scanDone ? "Verificación Completa – Confirmar Donación" : "Verificando..."}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Confirmación */}
            {step === "confirmation" && (
              <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
                <div className="bg-card border rounded-lg p-8">
                  <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">¡Donación Exitosa!</h2>
                  <p className="text-muted-foreground mb-6">
                    Gracias por tu generosidad. Tu donación de <strong>${numAmount.toLocaleString()} MXN</strong> ha sido registrada.
                  </p>
                  <div className="bg-muted rounded-lg p-4 text-sm text-left space-y-2 mb-6">
                    {selectedProject && <p><strong>Proyecto:</strong> {selectedProject.titulo}</p>}
                    <p><strong>Monto:</strong> ${numAmount.toLocaleString()} MXN</p>
                    <p><strong>Estado:</strong> {needsVerification ? "En revisión AML/KYC" : "Confirmada"}</p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => navigate("/projects")}>Ver más proyectos</Button>
                    <Button onClick={() => navigate("/")}>Volver al inicio</Button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>
    </Layout>
  );
};

export default Donate;

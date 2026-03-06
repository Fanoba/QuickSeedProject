import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fraudScatterData, locationMapData } from "@/data/mockData";
import { Shield, AlertTriangle, Eye, DollarSign, Users, TrendingUp, LogOut, BarChart3, Calendar, FileCheck, CheckCircle, XCircle, FileText, Download, MapPin, Filter, X, WifiOff, Loader2, RefreshCw, Sprout } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, ZAxis } from "recharts";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/hooks/useDashboard";
import type { Usuario } from "@/data";

const riskColors = { low: "bg-primary/10 text-primary", medium: "bg-secondary/10 text-secondary", high: "bg-destructive/10 text-destructive" };
const statusColors = { verified: "bg-primary/10 text-primary", pending: "bg-secondary/10 text-secondary", flagged: "bg-destructive/10 text-destructive" };

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    donaciones, alertas, usuarios, summary, monthlyData,
    loading, usingMock, reload,
    updateDonacionStatus, resolveAlerta,
  } = useDashboard();

  const [tab, setTab] = useState<"donations" | "analytics" | "alerts" | "donors" | "fraud" | "map">("donations");
  const [selectedDonor, setSelectedDonor] = useState<Usuario | null>(null);
  const [selectedFraudPoint, setSelectedFraudPoint] = useState<typeof fraudScatterData[0] | null>(null);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [fraudDateFrom, setFraudDateFrom] = useState("");
  const [fraudDateTo, setFraudDateTo] = useState("");

  const pendingCount = donaciones.filter((d) => d.status === "pending").length;
  const flaggedCount = donaciones.filter((d) => d.status === "flagged").length;
  const totalAmount = summary?.total_recaudado || 0;
  
  const riskData = [
    { name: "Bajo", value: donaciones.filter((d) => d.nivel_riesgo === "low").length, color: "hsl(145, 45%, 28%)" },
    { name: "Medio", value: donaciones.filter((d) => d.nivel_riesgo === "medium").length, color: "hsl(35, 60%, 50%)" },
    { name: "Alto", value: donaciones.filter((d) => d.nivel_riesgo === "high").length, color: "hsl(0, 84%, 60%)" },
  ];

  const timelineData = monthlyData.map((m) => ({ ...m, amount: (m.amount ?? 0) / 1000000 }));

  const locationData = donaciones.reduce<Record<string, number>>((acc, d) => {
    if (d.ubicacion) acc[d.ubicacion] = (acc[d.ubicacion] || 0) + d.monto;
    return acc;
  }, {});
  const locationChartData = Object.entries(locationData)
    .map(([name, amount]) => ({ name, amount: amount / 1000000 }))
    .sort((a, b) => b.amount - a.amount);

  const filteredFraudData = useMemo(() => {
    let data = fraudScatterData;
    if (fraudDateFrom) {
      const from = new Date(fraudDateFrom).getTime();
      data = data.filter((d) => d.dateTimestamp >= from);
    }
    if (fraudDateTo) {
      const to = new Date(fraudDateTo).getTime() + 86400000;
      data = data.filter((d) => d.dateTimestamp <= to);
    }
    return data;
  }, [fraudDateFrom, fraudDateTo]);

  const expiringDonors = usuarios.filter((u) => {
    if (!u.constancia_expiry) return false;
    const expiry = new Date(u.constancia_expiry);
    const diffMonths = (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
    return diffMonths <= 3 && diffMonths > 0;
  });

  const mapWidth = 800;
  const mapHeight = 400;
  const toMapX = (lng: number) => ((lng + 180) / 360) * mapWidth;
  const toMapY = (lat: number) => ((90 - lat) / 180) * mapHeight;

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleStatusChange = async (id: number, status: "verified" | "pending" | "flagged") => {
    await updateDonacionStatus(id, status);
    toast.success(`Donación ${id} → ${status}`);
  };
  const handleDownloadPDF = () => {
    // Cerramos el modal
    setShowReportPreview(false);
    toast.success("Preparando PDF...");
    
    // Un pequeño retraso para que el modal se cierre antes de abrir el diálogo de impresión
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold">QuickSeed Admin</h1>
          {usingMock && (
            <span className="inline-flex items-center gap-1 text-xs bg-secondary/10 text-secondary border border-secondary/30 px-2 py-0.5 rounded-full">
              <WifiOff className="h-3 w-3" /> Demo
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="ghost" onClick={reload}><RefreshCw className="h-4 w-4" /></Button>
          <Button onClick={() => setShowReportPreview(true)} className="bg-primary hover:bg-primary/90">
            <FileText className="h-4 w-4 mr-2" /> Generar Reporte PDF
          </Button>
          <span className="text-sm text-muted-foreground">{user?.nombre ?? "Admin"}</span>
          <Button size="sm" variant="ghost" onClick={handleLogout}><LogOut className="h-4 w-4 mr-1" /> Salir</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: DollarSign, label: "Total Recaudado", value: `$${(totalAmount / 1000000).toFixed(1)}M`, color: "text-primary" },
            { icon: Users, label: "Donantes", value: usuarios.length, color: "text-primary" },
            { icon: AlertTriangle, label: "Pendientes", value: pendingCount, color: "text-secondary" },
            { icon: Shield, label: "Flagged", value: flaggedCount, color: "text-destructive" },
          ].map((kpi, i) => (
            <div key={i} className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 flex-wrap">
          {(["donations", "analytics", "alerts", "donors", "fraud", "map"] as const).map((t) => (
            <Button key={t} size="sm" variant={tab === t ? "default" : "ghost"} onClick={() => setTab(t)}>
              {t === "donations" && "Donaciones"}
              {t === "analytics" && "Analytics"}
              {t === "alerts" && `Alertas ${alertas.filter((a) => !a.resuelta).length > 0 ? `(${alertas.filter((a) => !a.resuelta).length})` : ""}`}
              {t === "donors" && "Donantes"}
              {t === "fraud" && "Fraude"}
              {t === "map" && "Mapa"}
              
            </Button>
          ))}
        </div>
        {/*<Button onClick={() => setShowReportPreview(true)} className="bg-primary hover:bg-primary/90">
            <FileText className="h-4 w-4 mr-2" /> Generar Reporte PDF
          </Button>
          */}

        {/* Tab: Donations */}
        {tab === "donations" && (
          <div className="bg-card rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Donante</th>
                  <th className="px-4 py-3 text-left">Monto</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Match</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Riesgo</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {donaciones.map((d) => (
                  <tr key={d.id} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono text-xs">{d.codigo}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-muted-foreground">{d.ubicacion}</div>
                    </td>
                    <td className="px-4 py-3 font-bold">${(d.monto / 1000000).toFixed(2)}M</td>
                    <td className="px-4 py-3 text-xs">{d.fecha_donacion}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${d.document_match}%` }} />
                        </div>
                        <span className="text-xs">{d.document_match}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={statusColors[d.status]}>{d.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={riskColors[d.nivel_riesgo]}>{d.nivel_riesgo}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {d.status !== "verified" && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-primary" onClick={() => handleStatusChange(d.id, "verified")}>
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {d.status !== "flagged" && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleStatusChange(d.id, "flagged")}>
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab: Analytics */}
        {tab === "analytics" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Recaudación por Proyecto (Millones)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationChartData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `$${v.toFixed(1)}M`} />
                  <Bar dataKey="amount" fill="hsl(145, 45%, 28%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Users className="h-4 w-4" /> Clasificación de Riesgo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={riskData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-lg border p-6 lg:col-span-2">
              <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Timeline de Donaciones</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `$${v.toFixed(1)}M`} />
                  <Area type="monotone" dataKey="amount" stroke="hsl(145, 45%, 28%)" fill="hsl(145, 45%, 28%, 0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab: Alerts */}
        {tab === "alerts" && (
          <div className="space-y-3">
            {alertas.map((alert) => (
              <div key={alert.id} className={`bg-card rounded-lg border p-4 flex items-start gap-3 ${alert.severidad === "high" ? "border-destructive/30" : "border-secondary/30"} ${alert.resuelta ? "opacity-50" : ""}`}>
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${alert.severidad === "high" ? "text-destructive" : "text-secondary"}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.mensaje}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.fecha}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={alert.severidad === "high" ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"}>
                    {alert.severidad}
                  </Badge>
                  {!alert.resuelta && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => resolveAlerta(alert.id)}>
                      Resolver
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Donors */}
        {tab === "donors" && (
          <div className="space-y-4">
            {expiringDonors.length > 0 && (
              <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-secondary" />
                <p className="text-sm font-medium">{expiringDonors.length} donante(s) con constancia fiscal por vencer en los próximos 3 meses.</p>
              </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usuarios.map((donor) => {
                const isExpiring = expiringDonors.some((e) => e.id === donor.id);
                return (
                  <div key={donor.id} className={`bg-card border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${isExpiring ? "border-secondary/50" : ""}`} onClick={() => setSelectedDonor(donor)}>
                    <div className="flex items-center gap-3 mb-3">
                      <img src={donor.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(donor.nombre)}&size=40`} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{donor.nombre}</p>
                        <p className="text-xs text-muted-foreground truncate">{donor.email}</p>
                      </div>
                      <Badge variant="outline" className={riskColors[donor.nivel_riesgo]}>{donor.nivel_riesgo}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><p className="text-muted-foreground">Total donado</p><p className="font-bold">${(donor.total_donado / 1000000).toFixed(1)}M</p></div>
                      <div><p className="text-muted-foreground">RFC</p><p className="font-bold font-mono">{donor.rfc ?? "N/A"}</p></div>
                    </div>
                    {isExpiring && (
                      <div className="mt-3 bg-secondary/10 border border-secondary/30 rounded-lg p-2 text-xs flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-secondary" />
                        <span>Constancia vence: {donor.constancia_expiry}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Fraud */}
        {tab === "fraud" && (
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-destructive" /> Gráfica de Dispersión – Donaciones por Fecha
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Input type="date" value={fraudDateFrom} onChange={(e) => setFraudDateFrom(e.target.value)} className="h-8 w-40 text-xs" placeholder="Desde" />
                <span className="text-xs text-muted-foreground">–</span>
                <Input type="date" value={fraudDateTo} onChange={(e) => setFraudDateTo(e.target.value)} className="h-8 w-40 text-xs" placeholder="Hasta" />
                {(fraudDateFrom || fraudDateTo) && (
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => { setFraudDateFrom(""); setFraudDateTo(""); }}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="dateTimestamp"
                    name="Fecha"
                    tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}`; }}
                    type="number"
                    domain={["dataMin - 86400000", "dataMax + 86400000"]}
                  />
                  <YAxis dataKey="amount" name="Monto (M)" />
                  <ZAxis dataKey="totalDonations" range={[80, 400]} name="Total Donaciones" />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-card border rounded-lg p-3 shadow-lg text-xs space-y-1">
                          <p className="font-bold">{d.donorName} ({d.donorId})</p>
                          <p>Proyecto: {d.project}</p>
                          <p>Monto: ${d.amount.toFixed(1)}M</p>
                          <p>Fecha: {d.date}</p>
                          <p>IP: {d.ip}</p>
                          <p>Ubicación: {d.location}</p>
                          {d.suspicious && <p className="text-destructive font-bold">⚠️ SOSPECHOSO</p>}
                        </div>
                      );
                    }}
                  />
                  <Scatter
                    data={filteredFraudData}
                    fill="hsl(0, 84%, 60%)"
                    shape={(props: any) => {
                      const { cx, cy, payload } = props;
                      return <circle cx={cx} cy={cy} r={payload.suspicious ? 8 : 5} fill={payload.suspicious ? "hsl(0,84%,60%)" : "hsl(145,45%,28%)"} opacity={0.8} />;
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab: Map */}
        {tab === "map" && (
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Mapa de Ubicaciones de Donaciones</h3>
              <div className="relative bg-muted rounded-lg overflow-hidden" style={{ paddingBottom: "50%" }}>
                <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="absolute inset-0 w-full h-full" style={{ background: "hsl(210,50%,90%)" }}>
                  {locationMapData.map((loc) => {
                    const x = toMapX(loc.lng);
                    const y = toMapY(loc.lat);
                    const radius = Math.max(8, Math.min(30, (loc.amount / 500000)));
                    return (
                      <g key={loc.name}>
                        <circle cx={x} cy={y} r={radius + 4} fill="hsl(0, 84%, 60%)" opacity={0.15} />
                        <circle cx={x} cy={y} r={radius} fill="hsl(0, 84%, 60%)" opacity={0.7} stroke="white" strokeWidth={2} />
                        <text x={x} y={y - radius - 6} textAnchor="middle" fontSize={9} fill="hsl(0,0%,30%)" fontWeight="bold">
                          {loc.name.split(",")[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                {locationMapData.sort((a, b) => b.amount - a.amount).map((loc) => (
                  <div key={loc.name} className="bg-muted rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1"><MapPin className="h-3 w-3 text-destructive" /><span className="font-bold text-xs">{loc.name}</span></div>
                    <p className="text-xs text-muted-foreground">{loc.donations} donaciones · ${(loc.amount / 1000000).toFixed(1)}M</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Donor Detail Dialog */}
      <Dialog open={!!selectedDonor} onOpenChange={() => setSelectedDonor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Perfil del Donante</DialogTitle>
          </DialogHeader>
          {selectedDonor && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img src={selectedDonor.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDonor.nombre)}&size=60`} alt="" className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h3 className="font-bold text-lg">{selectedDonor.nombre}</h3>
                  <p className="text-sm text-muted-foreground">{selectedDonor.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedDonor.telefono}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted rounded-lg p-3"><p className="text-xs text-muted-foreground">Total Donado</p><p className="font-bold">${(selectedDonor.total_donado / 1000000).toFixed(1)}M</p></div>
                <div className="bg-muted rounded-lg p-3"><p className="text-xs text-muted-foreground">Donaciones</p><p className="font-bold">{selectedDonor.conteo_donaciones}</p></div>
                <div className="bg-muted rounded-lg p-3"><p className="text-xs text-muted-foreground">RFC</p><p className="font-bold font-mono text-xs">{selectedDonor.rfc ?? "N/A"}</p></div>
                <div className="bg-muted rounded-lg p-3"><p className="text-xs text-muted-foreground">Constancia Expiry</p><p className="font-bold text-xs">{selectedDonor.constancia_expiry ?? "N/A"}</p></div>
              </div>
              <Badge variant="outline" className={riskColors[selectedDonor.nivel_riesgo]}>Riesgo: {selectedDonor.nivel_riesgo}</Badge>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      {/* Report Dialog (PDF Template Preview) */}
      {/* Report Dialog (PDF Template Preview) */}
      <Dialog open={showReportPreview} onOpenChange={setShowReportPreview}>
        {/* Usamos max-w-4xl para que el preview se vea amplio en pantalla */}
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-muted/30">
          <DialogHeader className="print:hidden">
            <DialogTitle>Vista Previa del Documento</DialogTitle>
          </DialogHeader>
          
          {/* 👇 PLANTILLA A4 👇 */}
          <div className="bg-white text-black p-10 rounded-sm shadow-md mx-auto w-full max-w-[21cm] min-h-[29.7cm] flex flex-col print:shadow-none print:m-0 print:p-0 print:w-full">
            
            {/* 1. Encabezado y Fecha */}
            <div className="flex justify-between items-start border-b-2 border-primary/20 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg print:border print:border-primary">
                  <Sprout className="h-8 w-8 text-white print:text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-serif text-primary">QuickSeed</h2>
                  <p className="text-sm text-gray-500">Plataforma de Donaciones Inteligentes</p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-xl uppercase tracking-wider text-gray-800">Reporte Analítico</h3>
                {/* Aquí está la fecha detallada */}
                <p className="text-sm text-gray-600 font-mono mt-1 capitalize">
                  {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-xs text-gray-500 font-mono mt-1">Generado por: {user?.nombre || 'Admin'}</p>
              </div>
            </div>

            <div className="flex-1 space-y-8">
              {/* 2. Resumen (Summary) */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-primary pl-3">Resumen Operativo</h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="bg-gray-50 p-4 rounded border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-bold">Total Recaudado</p>
                    <p className="text-2xl font-bold text-primary mt-1">${(totalAmount / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-bold">Donantes</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{usuarios.length}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-bold">Transacciones</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{donaciones.length}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-bold">Alertas Activas</p>
                    <p className="text-2xl font-bold text-destructive mt-1">{alertas.filter(a => !a.resuelta).length}</p>
                  </div>
                </div>
              </div>

              {/* 3. Analytics (Gráficas) */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-primary pl-3">Análisis de Datos</h4>
                <div className="grid grid-cols-2 gap-6">
                  
                  {/* Gráfica: Proyectos */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-bold text-xs text-gray-600 mb-4 uppercase">Recaudación por Proyecto (MXN)</h5>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={locationChartData.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} interval={0} tickFormatter={(val) => val.split(',')[0]} />
                          <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} />
                          {/* isAnimationActive={false} para que cargue instantáneo para el PDF */}
                          <Bar dataKey="amount" fill="hsl(145, 45%, 28%)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Gráfica: Riesgo */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-bold text-xs text-gray-600 mb-4 uppercase">Distribución de Riesgo</h5>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={riskData} cx="50%" cy="50%" outerRadius={65} dataKey="value" isAnimationActive={false}
                               label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: '10px' }}>
                            {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Gráfica: Timeline (Ocupa las dos columnas) */}
                  <div className="border border-gray-200 rounded-lg p-4 col-span-2">
                    <h5 className="font-bold text-xs text-gray-600 mb-4 uppercase">Línea de Tiempo de Donaciones</h5>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timelineData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} />
                          <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                          <Area type="monotone" dataKey="amount" stroke="hsl(145, 45%, 28%)" fill="hsl(145, 45%, 28%, 0.1)" isAnimationActive={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* 4. Pie de Página */}
            <div className="border-t-2 border-gray-100 pt-4 mt-8 flex justify-between items-center text-[10px] text-gray-400 font-mono uppercase">
              <p>Ref: QS-{Date.now().toString().slice(-6)}-{new Date().getFullYear()}</p>
              <p>Documento Oficial QuickSeed © {new Date().getFullYear()}</p>
            </div>
          </div>

          {/* Botones de Acción (No se imprimen) */}
          <div className="flex justify-end gap-3 mt-4 print:hidden">
            <Button variant="outline" onClick={() => setShowReportPreview(false)}>Cerrar Vista Previa</Button>
            <Button onClick={handleDownloadPDF} className="bg-primary hover:bg-primary/90 text-white shadow-lg">
              <Download className="h-4 w-4 mr-2" /> Imprimir / Guardar como PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;

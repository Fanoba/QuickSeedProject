# 🌱 QuickSeed — Plataforma de Donaciones con Cumplimiento Legal

> Donar debería ser simple, seguro y transparente. QuickSeed lo hace posible.

---

## ¿De qué trata el proyecto?

**QuickSeed** es una plataforma web mexicana que conecta a personas que quieren donar dinero con proyectos sociales y ambientales de alto impacto. No es un simple botón de pago — es un sistema completo que garantiza que cada peso llegue a donde debe llegar, con respaldo legal y trazabilidad.

La plataforma cubre todo el proceso de principio a fin:

1. **El donante elige un proyecto** — desde reforestar la Sierra Norte de Puebla hasta llevar agua potable a comunidades indígenas en Chiapas.
2. **Selecciona el monto y método de pago** — con montos sugeridos o personalizados.
3. **Si la donación supera cierto umbral**, el sistema pide documentos de identidad (INE, CURP, Constancia Fiscal del SAT) y los valida automáticamente con tecnología antilavado de dinero (AML/KYC).
4. **La donación queda registrada y verificada**, y el donante recibe constancia para deducibilidad fiscal.

---

## ¿Qué problemas resuelve?

- **Falta de confianza:** muchas plataformas de donación no tienen transparencia ni respaldo legal. QuickSeed verifica identidades y mantiene un historial auditable.
- **Cumplimiento legal:** en México, las donaciones grandes requieren documentación fiscal. La plataforma automatiza ese proceso para que ni el donante ni la organización tengan que preocuparse por ello.
- **Detección de fraude:** el panel administrativo incluye alertas automáticas para detectar comportamientos sospechosos, como múltiples donaciones desde la misma cuenta a distintos proyectos.

---

## ¿Qué puede hacer un administrador?

El **panel de administración** es el corazón operativo de la plataforma. Desde ahí, el equipo puede:

- Ver un resumen en tiempo real de donaciones, donantes activos y alertas pendientes.
- Revisar el perfil completo de cada donante: documentos, RFC, historial de donaciones, nivel de riesgo.
- Consultar gráficas de recaudación mensual y por proyecto.
- Recibir alertas automáticas de posible fraude o documentos próximos a vencer.
- Explorar un mapa de puntos de donación para detectar patrones sospechosos.

---


## Herramientas que se usaron

### Lo que ven los usuarios (Frontend)
- **React** — la librería principal para construir la interfaz. Permite que la página sea dinámica sin recargar cada vez que el usuario hace algo.
- **TypeScript** — una versión más robusta de JavaScript que ayuda a evitar errores antes de que lleguen al usuario.
- **Tailwind CSS** — sistema de estilos que permite diseñar rápido con consistencia visual.
- **Framer Motion** — librería de animaciones para hacer transiciones y efectos suaves al navegar.
- **Recharts** — para las gráficas del panel administrativo (barras, pasteles, dispersión).
- **Lucide React** — set de íconos modernos usados en toda la interfaz.
- **shadcn/ui** — componentes de interfaz prediseñados y accesibles (botones, modales, tablas, etc.).

### Navegación y estructura
- **React Router** — maneja la navegación entre páginas (inicio, proyectos, donación, admin) sin recargar el sitio.
- **Vite** — herramienta de desarrollo que hace que el proyecto compile rápido durante la construcción.

### Calidad del código
- **ESLint** — revisa el código automáticamente para mantener buenas prácticas.
- **Vitest** — herramienta para hacer pruebas automatizadas.

---

## Flujo de una donación (paso a paso)

```
Inicio → Explorar proyectos → Seleccionar proyecto
       → Elegir monto → Crear cuenta / Iniciar sesión
       → (Si monto alto) Subir documentos → Verificación AML/KYC
       → Confirmación + constancia fiscal
```

---

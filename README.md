# H4 — Asignación de horas

Aplicación Next.js (App Router + TypeScript) que reemplaza a Bildin para el
registro de horas en obra. Esta primera entrega cubre **la base con la parte
gráfica**, usando los componentes del
[Adelante Design System](https://github.com/DavidpcAD/adelante-design-system).
Todavía **no hay conexión a base de datos**: los datos viven en memoria
(`src/lib/mock-data.ts`).

## Cómo correr

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción + chequeo de tipos
```

## Credenciales demo (login)

El login valida usuario + contraseña contra la "tabla" `Usuario` comparando el
hash **SHA-256** de la contraseña (no se guarda la contraseña en claro).

| Usuario  | Contraseña   |
| -------- | ------------ |
| `admin`  | `admin123`   |
| `jperez` | `obra2024`   |
| `mlopez` | `cuadrilla1` |

## Flujo de asignación

Cambia respecto a Bildin: la jerarquía es **Etapa → Actividad → Subactividad**
(la "Etapa" cumple el rol del antiguo "grupo"). La subactividad se elige al
final, al asignar las horas.

1. **Proyecto → Etapa → Actividad** (selección en cascada).
2. Al elegir la actividad aparece su **Cuadrilla** con sus **colaboradores**.
3. A cada colaborador se le asignan horas **distribuidas por subactividad**:
   cada colaborador puede tener varias líneas (p. ej. 3 h en una subactividad,
   4 h en otra y 1 h en una tercera). El total por colaborador y el total
   general se calculan en vivo.

## Estructura

```
src/
  app/
    layout.tsx            # carga design-system.css + AuthProvider
    login/page.tsx        # módulo de login (mock auth)
    (app)/                # área autenticada (protegida por RequireAuth)
      layout.tsx
      page.tsx            # flujo de asignación de horas
  components/
    RequireAuth.tsx       # gate de rutas autenticadas
    Selector.tsx          # envoltura de un solo valor sobre SelectionDropdown
    HoursStepper.tsx      # control +/- de horas
    ColaboradorCard.tsx   # distribución de horas por colaborador
  lib/
    types.ts              # modelo de dominio
    mock-data.ts          # datos en memoria (sustituye la BD por ahora)
    auth.tsx              # contexto de autenticación (SHA-256 + localStorage)
  design-system/          # subconjunto vendorizado del Adelante Design System
```

## Sobre el Design System

El repositorio del design system no es un paquete npm publicado, así que se
copió **solo el subconjunto de componentes que la app usa** bajo
`src/design-system/` (Icon, Button, Form, Card, SelectionDropdown, TabsMenu,
QuantitySelector, ToggleCards + `design-system.css` y los tokens). Se importan
desde `@/design-system`. Para usar un componente nuevo, se copia su carpeta
desde el repo y se agrega al barrel `src/design-system/index.ts`.

## Próximos pasos (no incluidos en esta entrega)

- Conexión a base de datos real y API para usuarios, catálogos y persistencia
  de las asignaciones (la capa de tipos en `lib/types.ts` ya está lista).
- Persistir/guardar la asignación (hoy "Guardar" solo confirma en pantalla).
- Selección de subactividad pendiente de definir si se hace por código.

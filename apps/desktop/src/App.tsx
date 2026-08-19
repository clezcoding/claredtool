import {
  Building2,
  Calculator,
  FileImage,
  FileText,
  Users,
} from "lucide-react";
import {
  NavLink,
  Outlet,
  RouterProvider,
  createHashRouter,
} from "react-router";
import { useMemo } from "react";
import { PdfScreen } from "./routes/pdf";
import { RechnungScreen } from "./routes/rechnung";

const NAV_ITEMS = [
  { to: "/", label: "Rechnung", icon: FileText },
  { to: "/entities", label: "Entities", icon: Building2 },
  { to: "/kunden", label: "Kunden", icon: Users },
  { to: "/tax", label: "Tax", icon: Calculator },
  { to: "/pdf", label: "PDF", icon: FileImage },
] as const;

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
    </div>
  );
}

export function AppShell() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <nav className="flex w-48 shrink-0 flex-col gap-1 border-r border-border p-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const router = useMemo(
    () =>
      createHashRouter([
        {
          path: "/",
          element: <AppShell />,
          children: [
            { index: true, element: <RechnungScreen /> },
            { path: "entities", element: <PlaceholderScreen title="Entities" /> },
            { path: "kunden", element: <PlaceholderScreen title="Kunden" /> },
            { path: "tax", element: <PlaceholderScreen title="Tax" /> },
            { path: "pdf", element: <PdfScreen /> },
          ],
        },
      ]),
    [],
  );

  return <RouterProvider router={router} />;
}

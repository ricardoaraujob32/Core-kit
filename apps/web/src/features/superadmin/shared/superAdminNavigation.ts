// apps/web/src/features/superadmin/shared/superAdminNavigation.ts

export type SuperAdminNavigationItem = {
  label: string;
  to: string;
  icon: string;
  end?: boolean;
};

export const SUPERADMIN_NAV_ITEMS: SuperAdminNavigationItem[] = [
  {
    label: "Dashboard",
    to: "/plataforma",
    icon: "📊",
    end: true,
  },
  {
    label: "Locatários",
    to: "/plataforma/locatarios",
    icon: "🏢",
  },
  {
    label: "Novo locatário",
    to: "/plataforma/locatarios/novo",
    icon: "➕",
  },
];

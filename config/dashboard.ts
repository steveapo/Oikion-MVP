import { UserRole } from "@prisma/client";

import { SidebarNavItem } from "types";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "navigation.sidebar.sections.menu",
    items: [
      { href: "/dashboard", icon: "dashboard", title: "navigation.sidebar.menu.dashboard" },
      { href: "/dashboard/properties", icon: "home", title: "navigation.sidebar.menu.properties" },
      { href: "/dashboard/relations", icon: "users", title: "navigation.sidebar.menu.relations" },
      { href: "/dashboard/oikosync", icon: "activity", title: "navigation.sidebar.menu.oikosync" },
      {
        href: "/dashboard/members",
        icon: "users",
        title: "navigation.sidebar.menu.members",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/dashboard/billing",
        icon: "billing",
        title: "navigation.sidebar.menu.billing",
        authorizeOnly: UserRole.ORG_OWNER,
      },
    ],
  },
  {
    title: "navigation.sidebar.sections.options",
    items: [
      { href: "/dashboard/settings", icon: "settings", title: "navigation.sidebar.options.settings" },
      { href: "/docs", icon: "bookOpen", title: "navigation.sidebar.options.documentation" },
      {
        href: "#",
        icon: "messages",
        title: "navigation.sidebar.options.support",
        disabled: true,
      },
    ],
  },
];

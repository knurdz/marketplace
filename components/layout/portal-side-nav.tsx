import {
  Banknote,
  ChartColumn,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Package,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
  Star,
  Store,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
  Flag,
  type LucideIcon,
} from "lucide-react";

/**
 * Icons are referenced by name so server layouts can declare nav config
 * without passing non-serializable components across the client boundary.
 */
export const NAV_ICONS = {
  dashboard: LayoutDashboard,
  listings: Package,
  categories: FolderTree,
  coupons: Ticket,
  orders: Receipt,
  sellers: Store,
  performance: TrendingUp,
  users: Users,
  trust: ShieldCheck,
  reports: Flag,
  bankSlips: Banknote,
  notifyLogs: ScrollText,
  analytics: ChartColumn,
  settings: Settings,
  audit: ClipboardList,
  shop: Store,
  messages: MessageSquare,
  earnings: Wallet,
  reviews: Star,
} satisfies Record<string, LucideIcon>;

export type PortalNavIcon = keyof typeof NAV_ICONS;

export type PortalNavItem = {
  href: string;
  label: string;
  icon?: PortalNavIcon;
  /** Red notification dot on the sidebar link (e.g. pending queue). */
  showDot?: boolean;
};

export type PortalNavGroup = {
  title?: string;
  items: PortalNavItem[];
};

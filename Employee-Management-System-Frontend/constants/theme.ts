/**
 * Design System Tokens for Employee Management System (EMS)
 * Derived from the official EMS UI/UX Design Guide
 */

export const AppColors = {
  // Primary
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#DBEAFE",

  // Surfaces & Backgrounds
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceMuted: "#F1F5F9",
  card: "#FFFFFF",

  // Typography / Text Colors
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#64748B",
  textDisabled: "#94A3B8",

  // Borders
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",

  // Semantic Status Colors
  success: "#16A34A",
  successLight: "#DCFCE7",
  warning: "#D97706",
  warningLight: "#FEF3C7",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  info: "#0284C7",
  infoLight: "#E0F2FE",
  pending: "#F59E0B",
  pendingLight: "#FEF3C7",

  // Neutral / Accents
  purple: "#7C3AED",
  purpleLight: "#EDE9FE",
  indigo: "#4F46E5",
  indigoLight: "#E0E7FF",
};

export const AppSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

export const AppRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
};

export const AppShadows = {
  subtle: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  card: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  elevated: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
};

export const AppTypography = {
  screenTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: AppColors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: AppColors.text,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: AppColors.text,
  },
  body: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: AppColors.text,
  },
  secondary: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: AppColors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    color: AppColors.textMuted,
  },
  button: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
};

export const Colors = {
  light: {
    text: AppColors.text,
    background: AppColors.background,
    tint: AppColors.primary,
    icon: AppColors.textMuted,
    tabIconDefault: AppColors.textMuted,
    tabIconSelected: AppColors.primary,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: AppColors.primaryLight,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: AppColors.primaryLight,
  },
};

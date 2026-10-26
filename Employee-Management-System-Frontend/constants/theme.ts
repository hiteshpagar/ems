/**
 * Centralized Design System Tokens for EMS Super Admin Mobile App
 * Production Enterprise Theme Specification
 */

export const AppColors = {
  // Primary & Action Colors
  primary: "#173B7A",
  primaryPressed: "#123064",
  accent: "#2563EB",
  accentLight: "#EFF6FF",

  // Backgrounds & Surfaces
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceMuted: "#F1F5F9",
  card: "#FFFFFF",

  // Text Typography Colors
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  textOnPrimary: "#FFFFFF",

  // Backwards compatibility aliases for existing codebase
  text: "#0F172A",
  primaryDark: "#123064",
  primaryLight: "#EFF6FF",

  // Borders & Dividers
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  divider: "#E2E8F0",
  focusBorder: "#2563EB",

  // Semantic Status Colors
  success: "#16A34A",
  successBackground: "#DCFCE7",
  successLight: "#DCFCE7",

  warning: "#D97706",
  warningBackground: "#FEF3C7",
  warningLight: "#FEF3C7",

  danger: "#DC2626",
  dangerBackground: "#FEE2E2",
  dangerLight: "#FEE2E2",

  info: "#4F46E5",
  infoBackground: "#E0E7FF",
  infoLight: "#E0E7FF",

  pending: "#D97706",
  pendingLight: "#FEF3C7",

  // Neutral Accents
  purple: "#7C3AED",
  purpleLight: "#F3E8FF",
  indigo: "#4F46E5",
  indigoLight: "#E0E7FF",
};

export const AppSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const AppRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  pill: 999,
};

export const AppShadows = {
  subtle: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  card: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  elevated: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const AppTypography = {
  screenTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: AppColors.textPrimary,
  },
  kpiValue: {
    fontSize: 30,
    fontWeight: "700" as const,
    color: AppColors.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: AppColors.textPrimary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: AppColors.textPrimary,
  },
  body: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: AppColors.textPrimary,
    lineHeight: 20,
  },
  button: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  input: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: AppColors.textPrimary,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: AppColors.textSecondary,
  },
  secondary: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
  badge: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  metadata: {
    fontSize: 12,
    fontWeight: "400" as const,
    color: AppColors.textMuted,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    color: AppColors.textMuted,
  },
};

export const Colors = {
  light: {
    text: AppColors.textPrimary,
    background: AppColors.background,
    tint: AppColors.accent,
    icon: AppColors.textSecondary,
    tabIconDefault: AppColors.textMuted,
    tabIconSelected: AppColors.accent,
  },
  dark: {
    text: "#ECEDEE",
    background: "#0F172A",
    tint: AppColors.accentLight,
    icon: "#94A3B8",
    tabIconDefault: "#64748B",
    tabIconSelected: AppColors.accent,
  },
};

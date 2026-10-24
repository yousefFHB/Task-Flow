import { createTheme } from "@mui/material/styles";

export const createAppTheme = (direction = "ltr", mode = "light") => {
  const isRtl = direction === "rtl";
  const isDark = mode === "dark";

  return createTheme({
    direction: isRtl ? "rtl" : "ltr",

    // ==========================================
    // COLOR PALETTE (Light / Dark)
    // ==========================================
    palette: {
      mode: isDark ? "dark" : "light",

      primary: isDark
        ? {
            main: "#6366F1", // Indigo 500
            light: "#818CF8",
            dark: "#4F46E5",
            contrastText: "#FFFFFF",
          }
        : {
            main: "#243B6B",
            light: "#405A91",
            dark: "#17284B",
            contrastText: "#FFFFFF",
          },

      secondary: isDark
        ? {
            main: "#38BDF8", // Sky 400
            light: "#7DD3FC",
            dark: "#0284C7",
            contrastText: "#0B0F19",
          }
        : {
            main: "#4F46E5",
            light: "#818CF8",
            dark: "#3730A3",
            contrastText: "#FFFFFF",
          },

      background: isDark
        ? {
            default: "#0B0F19",
            paper: "#111827",
          }
        : {
            default: "#F8FAFC",
            paper: "#FFFFFF",
          },

      text: isDark
        ? {
            primary: "#F9FAFB",
            secondary: "#9CA3AF",
            disabled: "#4B5563",
          }
        : {
            primary: "#1E293B",
            secondary: "#64748B",
            disabled: "#94A3B8",
          },

      divider: isDark ? "#1F2937" : "#E2E8F0",

      action: isDark
        ? {
            active: "#9CA3AF",
            hover: "rgba(255, 255, 255, 0.05)",
            selected: "rgba(99, 102, 241, 0.16)",
            disabled: "#4B5563",
            disabledBackground: "rgba(255, 255, 255, 0.04)",
          }
        : {
            active: "#64748B",
            hover: "rgba(15, 23, 42, 0.04)",
            selected: "rgba(36, 59, 107, 0.08)",
            disabled: "#94A3B8",
            disabledBackground: "rgba(15, 23, 42, 0.04)",
          },

      success: isDark
        ? {
            main: "#22C55E",
            light: "#14532D",
            dark: "#16A34A",
            contrastText: "#FFFFFF",
          }
        : {
            main: "#16A34A",
            light: "#DCFCE7",
            dark: "#166534",
            contrastText: "#FFFFFF",
          },

      warning: isDark
        ? {
            main: "#F59E0B",
            light: "#78350F",
            dark: "#D97706",
            contrastText: "#FFFFFF",
          }
        : {
            main: "#D97706",
            light: "#FEF3C7",
            dark: "#92400E",
            contrastText: "#FFFFFF",
          },

      error: isDark
        ? {
            main: "#EF4444",
            light: "#7F1D1D",
            dark: "#DC2626",
            contrastText: "#FFFFFF",
          }
        : {
            main: "#DC2626",
            light: "#FEE2E2",
            dark: "#991B1B",
            contrastText: "#FFFFFF",
          },

      info: isDark
        ? {
            main: "#38BDF8",
            light: "#0C4A6E",
            dark: "#0284C7",
            contrastText: "#0B0F19",
          }
        : {
            main: "#0284C7",
            light: "#E0F2FE",
            dark: "#075985",
            contrastText: "#FFFFFF",
          },
    },

    // ==========================================
    // TYPOGRAPHY (with Vazirmatn for Persian)
    // ==========================================
    typography: {
      fontFamily: isRtl
        ? '"Vazirmatn", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Tahoma, Arial, sans-serif'
        : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',

      h1: {
        fontSize: "2rem",
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: isRtl ? "normal" : "-0.04em",
      },

      h2: {
        fontSize: "1.75rem",
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: isRtl ? "normal" : "-0.03em",
      },

      h3: {
        fontSize: "1.375rem",
        fontWeight: 650,
        lineHeight: 1.4,
      },

      h4: {
        fontSize: "1.125rem",
        fontWeight: 650,
        lineHeight: 1.5,
      },

      h5: {
        fontSize: "1rem",
        fontWeight: 600,
        lineHeight: 1.5,
      },

      h6: {
        fontSize: "0.9375rem",
        fontWeight: 600,
        lineHeight: 1.5,
      },

      subtitle1: {
        fontSize: "0.9375rem",
        fontWeight: 500,
      },

      subtitle2: {
        fontSize: "0.8125rem",
        fontWeight: 600,
      },

      body1: {
        fontSize: "0.9375rem",
        lineHeight: 1.65,
      },

      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.65,
      },

      button: {
        fontSize: "0.875rem",
        fontWeight: 600,
        textTransform: "none",
      },

      overline: {
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        lineHeight: 1.5,
        display: "block",
      },

      caption: {
        fontSize: "0.75rem",
        lineHeight: 1.5,
      },
    },

    // ==========================================
    // SPACING AND SHAPE
    // ==========================================
    spacing: 8,

    shape: {
      borderRadius: 10,
    },

    // ==========================================
    // COMPONENT DEFAULTS AND OVERRIDES
    // ==========================================
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark ? "#374151 transparent" : "#CBD5E1 transparent",
            scrollbarWidth: "thin",
            backgroundColor: isDark ? "#0B0F19" : "#F8FAFC",
            color: isDark ? "#F9FAFB" : "#1E293B",
            fontFamily: isRtl
              ? '"Vazirmatn", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Tahoma, Arial, sans-serif'
              : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          },

          "::selection": {
            backgroundColor: isDark ? "#4F46E5" : "#C7D2FE",
            color: isDark ? "#FFFFFF" : "#1E293B",
          },
        },
      },

      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },

        styleOverrides: {
          root: {
            minHeight: 40,
            borderRadius: 9,
            padding: "8px 16px",
            fontWeight: 600,
            transition: "background-color 150ms ease, box-shadow 150ms ease",
          },

          containedPrimary: {
            "&:hover": {
              backgroundColor: isDark ? "#4F46E5" : "#17284B",
            },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 9,
            color: isDark ? "#9CA3AF" : "#64748B",
            transition: "all 150ms ease",
            "&:hover": {
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.04)",
              color: isDark ? "#F9FAFB" : "#1E293B",
            },
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          fullWidth: true,
          size: "small",
          variant: "outlined",
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 9,
            backgroundColor: isDark ? "#141E30" : "#FFFFFF",

            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "#283449" : "#CBD5E1",
            },

            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "#4B5563" : "#94A3B8",
            },

            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderWidth: 1.5,
              borderColor: isDark ? "#6366F1" : "#4F46E5",
            },
          },

          input: {
            padding: "11px 14px",
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: "0.875rem",
            color: isDark ? "#9CA3AF" : "#64748B",
            "&.Mui-focused": {
              color: isDark ? "#818CF8" : "#4F46E5",
            },
          },
        },
      },

      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },

        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
          },
          rounded: {
            borderRadius: 12,
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            border: isDark ? "1px solid #1F2937" : "1px solid #E2E8F0",
            borderRadius: 12,
            boxShadow: isDark
              ? "0 4px 24px rgba(0, 0, 0, 0.5)"
              : "0 1px 4px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.04)",
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
            transition: "box-shadow 0.2s ease, border-color 0.2s ease",
          },
        },
      },

      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: "24px",
            "&:last-child": {
              paddingBottom: "24px",
            },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 600,
            fontSize: "0.75rem",
            borderColor: isDark ? "#374151" : "#E2E8F0",
          },

          sizeSmall: {
            height: 24,
          },

          colorSuccess: {
            backgroundColor: isDark ? "rgba(34, 197, 94, 0.15)" : "#DCFCE7",
            color: isDark ? "#22C55E" : "#16A34A",
            borderColor: isDark ? "rgba(34, 197, 94, 0.3)" : "#BBF7D0",
          },

          colorWarning: {
            backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7",
            color: isDark ? "#F59E0B" : "#D97706",
            borderColor: isDark ? "rgba(245, 158, 11, 0.3)" : "#FDE68A",
          },

          colorError: {
            backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : "#FEE2E2",
            color: isDark ? "#EF4444" : "#DC2626",
            borderColor: isDark ? "rgba(239, 68, 68, 0.3)" : "#FECACA",
          },

          colorInfo: {
            backgroundColor: isDark ? "rgba(56, 189, 248, 0.15)" : "#E0F2FE",
            color: isDark ? "#38BDF8" : "#0284C7",
            borderColor: isDark ? "rgba(56, 189, 248, 0.3)" : "#BAE6FD",
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isDark ? "1px solid #1F2937" : "1px solid #F1F5F9",
            padding: "12px 16px",
          },

          head: {
            backgroundColor: isDark ? "#151E2E" : "#F8FAFC",
            color: isDark ? "#9CA3AF" : "#64748B",
            fontWeight: 700,
            fontSize: "0.6875rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            borderBottom: isDark ? "1px solid #1F2937" : "1px solid #E2E8F0",
          },

          body: {
            color: isDark ? "#E5E7EB" : "#334155",
            fontSize: "0.8125rem",
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: "background-color 0.12s ease",
            "&:hover": {
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.025)" : "rgba(15, 23, 42, 0.018)",
            },
            "&.MuiTableRow-head:hover": {
              backgroundColor: "transparent",
            },
          },
        },
      },

      MuiAvatar: {
        styleOverrides: {
          root: {
            fontWeight: 700,
          },
          rounded: {
            borderRadius: 10,
          },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontSize: "0.875rem",
            border: "1px solid",
          },
          standardSuccess: {
            backgroundColor: isDark ? "rgba(34, 197, 94, 0.1)" : "#F0FDF4",
            borderColor: isDark ? "rgba(34, 197, 94, 0.25)" : "#BBF7D0",
            color: isDark ? "#22C55E" : "#15803D",
            "& .MuiAlert-icon": {
              color: isDark ? "#22C55E" : "#16A34A",
            },
          },
          standardError: {
            backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "#FFF1F2",
            borderColor: isDark ? "rgba(239, 68, 68, 0.25)" : "#FECACA",
            color: isDark ? "#EF4444" : "#991B1B",
            "& .MuiAlert-icon": {
              color: isDark ? "#EF4444" : "#DC2626",
            },
          },
          standardWarning: {
            backgroundColor: isDark ? "rgba(245, 158, 11, 0.1)" : "#FFFBEB",
            borderColor: isDark ? "rgba(245, 158, 11, 0.25)" : "#FDE68A",
            color: isDark ? "#F59E0B" : "#92400E",
            "& .MuiAlert-icon": {
              color: isDark ? "#F59E0B" : "#D97706",
            },
          },
          standardInfo: {
            backgroundColor: isDark ? "rgba(56, 189, 248, 0.1)" : "#F0F9FF",
            borderColor: isDark ? "rgba(56, 189, 248, 0.25)" : "#BAE6FD",
            color: isDark ? "#38BDF8" : "#075985",
            "& .MuiAlert-icon": {
              color: isDark ? "#38BDF8" : "#0284C7",
            },
          },
          message: {
            padding: "2px 0",
          },
          icon: {
            padding: "4px 0",
          },
        },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 99,
            height: 6,
            backgroundColor: isDark ? "#1F2937" : "#E2E8F0",
          },
          bar: {
            borderRadius: 99,
          },
        },
      },

      MuiSelect: {
        styleOverrides: {
          select: {
            borderRadius: 9,
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: "background-color 0.15s ease, color 0.15s ease",
          },
        },
      },

      MuiBadge: {
        styleOverrides: {
          badge: {
            fontSize: "0.625rem",
            fontWeight: 700,
            minWidth: 18,
            height: 18,
            padding: "0 4px",
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            border: isDark ? "1px solid #2D3748" : "1px solid #E2E8F0",
            boxShadow: isDark
              ? "0 24px 60px rgba(0, 0, 0, 0.7)"
              : "0 20px 50px rgba(15, 23, 42, 0.12)",
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
          },
        },
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: {
            padding: "20px 24px 12px",
            fontWeight: 700,
            fontSize: "1rem",
          },
        },
      },

      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: "12px 24px 20px",
          },
          dividers: {
            padding: "16px 24px",
            borderColor: isDark ? "#1F2937" : "#E2E8F0",
          },
        },
      },

      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: "12px 24px 16px",
            gap: 8,
            "& > :not(:first-of-type)": {
              marginLeft: 0,
            },
          },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 6,
            fontSize: "0.75rem",
            fontWeight: 500,
            padding: "6px 10px",
            backgroundColor: isDark ? "#1F2937" : "#1E293B",
            color: "#FFFFFF",
          },
          arrow: {
            color: isDark ? "#1F2937" : "#1E293B",
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? "#1F2937" : "#E2E8F0",
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontSize: "0.875rem",
            minHeight: 36,
            margin: "1px 4px",
            "&.Mui-selected": {
              backgroundColor: isDark ? "rgba(99, 102, 241, 0.15)" : "rgba(36, 59, 107, 0.08)",
              "&:hover": {
                backgroundColor: isDark ? "rgba(99, 102, 241, 0.22)" : "rgba(36, 59, 107, 0.12)",
              },
            },
          },
        },
      },

      MuiInputAdornment: {
        styleOverrides: {
          root: {
            color: isDark ? "#6B7280" : "#94A3B8",
          },
        },
      },
    },
  });
};

const theme = createAppTheme("ltr", "light");
export default theme;

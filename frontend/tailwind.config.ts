import { NodeNextRequest } from "next/dist/server/base-http/node";
import { Londrina_Solid } from "next/font/google";
import { type Config } from "tailwindcss";

const plugin = require("tailwindcss/plugin");

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        typeface_primary: "#292929",
        typeface_secondary: "#999999",
        typeface_tertiary: "#BFBFBF",
        typeface_highlight: "#FFFFFF",
        action_bg_primary: "#292929",
        action_bg_primary_hover: "#404040",
        action_bg_primary_press: "#1C1C1C",
        action_bg_secondary: "#FFFFFF",
        action_bg_secondary_hover: "#F5F5F5",
        action_bg_secondary_press: "#EDEDED",
        action_bg_tertiary: "#EDEDED",
        action_border_primary: "#D9D9D9",
        action_border_secondary: "#EDEDED",
        surface_bg_primary: "#999999",
        surface_bg_secondary: "#EDEDED",
        surface_bg_tertiary: "#FAFAFA",
        surface_bg_highlight: "#FFFFFF",
        surface_bg_dark: "#999999",
        surface_bg_darker: "#5B5B5B",
        surface_bg_darkest: "#404040",
        surface_border_primary: "#BFBFBF",
        surface_border_secondary: "#D9D9D9",
        surface_border_tertiary: "#EDEDED",
        status_fg_positive: "#27C000",
        status_bg_positive: "#DAFFD1",
        status_fg_negative: "#FE0909",
        status_bg_negative: "#FFE1E1",
        status_fg_info: "#339ED3",
        status_bg_info: "#E1F1FF",
      },
      fontMetrics: {
        inter: {
          capHeight: 2048,
          ascent: 2728,
          descent: -680,
          lineGap: 0,
          unitsPerEm: 2816,
        },
      },
      lineHeight: {
        "cap-height": "0.8",
      },
      height: {
        "to-bottom": "calc(100vh - 64px)",
      },
      dropShadow: {
        "25": ["0 1px 2px rgba(0, 0, 0, 0.05)", "0 0 2px rgba(0, 0, 0, 0.05)"],
        "50": "0 2px 4px rgba(0, 0, 0, 0.07)",
        "75": "0 4px 20px rgba(0, 0, 0, 0.05)",
        "100": [
          "0 8px 8px rgba(0, 0, 0, 0.02)",
          "0 2px 8px rgba(0, 0, 0, 0.08)",
        ],
        "150": "0 12px 48px rgba(0, 0, 0, 0.08)",
        "200": "0 24px 64px rgba(0, 0, 0, 0.07)",
      },
    },
  },
  plugins: [
    require("tailwindcss-capsize"),
    function ({ addBase, theme }) {
      addBase({
        ":root": {
          "--typeface_primary": theme("colors.typeface_primary"),
          "--typeface_secondary": theme("colors.typeface_secondary"),
          "--typeface_tertiary": theme("colors.typeface_tertiary"),
          "--typeface_highlight": theme("colors.typeface_highlight"),
          "--action_bg_primary": theme("colors.action_bg_primary"),
          "--action_bg_primary_hover": theme("colors.action_bg_primary_hover"),
          "--action_bg_primary_press": theme("colors.action_bg_primary_press"),
          "--action_bg_secondary": theme("colors.action_bg_secondary"),
          "--action_bg_secondary_hover": theme(
            "colors.action_bg_secondary_hover"
          ),
          "--action_bg_secondary_press": theme(
            "colors.action_bg_secondary_press"
          ),
          "--action_bg_tertiary": theme("colors.action_bg_tertiary"),
          "--action_border_primary": theme("colors.action_border_primary"),
          "--action_border_secondary": theme("colors.action_border_secondary"),
          "--surface_bg_primary": theme("colors.surface_bg_primary"),
          "--surface_bg_secondary": theme("colors.surface_bg_secondary"),
          "--surface_bg_tertiary": theme("colors.surface_bg_tertiary"),
          "--surface_bg_highlight": theme("colors.surface_bg_highlight"),
          "--surface_bg_dark": theme("colors.surface_bg_dark"),
          "--surface_bg_darker": theme("colors.surface_bg_darker"),
          "--surface_bg_darkest": theme("colors.surface_bg_darkest"),
          "--surface_border_primary": theme("colors.surface_border_primary"),
          "--surface_border_secondary": theme(
            "colors.surface_border_secondary"
          ),
          "--surface_border_tertiary": theme("colors.surface_border_tertiary"),
          "--status_fg_positive": theme("colors.status_fg_positive"),
          "--status_bg_positive": theme("colors.status_bg_positive"),
          "--status_fg_negative": theme("colors.status_fg_negative"),
          "--status_bg_negative": theme("colors.status_bg_negative"),
          "--status_fg_info": theme("colors.status_fg_info"),
          "--status_bg_info": theme("colors.status_bg_info"),
        },
      });
    },
    plugin(function ({ addComponents, theme }) {
      addComponents({
        ".button-primary": {
          backgroundColor: theme("colors.action_bg_primary"),
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "-0.28px",
          lineHeight: "0.8",
          color: theme("colors.typeface_highlight"),
          "&:hover": {
            backgroundColor: theme("colors.action_bg_primary_hover"),
          },
          "&:active": {
            backgroundColor: theme("colors.action_bg_primary_press"),
          },
        },
        ".button-secondary": {
          backgroundColor: theme("colors.action_bg_secondary"),
          outline: "1px solid " + theme("colors.action_border_primary"),
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "-0.28px", // -2% of 14px
          lineHeight: "0.8",
          color: theme("colors.typeface_primary"),
          "&:hover": {
            backgroundColor: theme("colors.action_bg_secondary_hover"),
            outline: "1px solid " + theme("colors.surface_border_tertiary"),
          },
          "&:active": {
            backgroundColor: theme("colors.action_bg_secondary_press"),
            outline: "1px solid " + theme("colors.surface_border_tertiary"),
          },
        },
        ".navbutton-selected": {
          backgroundColor: theme("colors.action_bg_secondary"),
          boxShadow: "0px 1px 2px 0px rgb(0 0 0 / 7%)",
          fontWeight: 600,
          fontSize: "14px",
          letterSpacing: "-0.28px", // -2% of 14px
          lineHeight: "0.8",
          color: theme("colors.typeface_primary"),
        },
        ".navbutton": {
          backgroundColor: "transparent",
          fontSize: "14px",
          fontWeight: 500,
          letterSpacing: "-0.28px", // -2% of 14px
          lineHeight: "0.8",
          color: theme("colors.typeface_primary"),
          "&:hover": {
            backgroundColor: theme("colors.action_bg_tertiary"),
          },
          "&:disabled": {
            color: theme("colors.typeface_tertiray"),
          },
        },
      });
    }),
    function ({ addUtilities, theme }) {
      addUtilities({
        ".text-h1": {
          fontSize: "26px",
          fontWeight: 400,
          letterSpacing: "-0.52px", // -2% of 26px
          lineHeight: "26px",
        },
        ".text-h2": {
          fontSize: "20px",
          fontWeight: 500,
          letterSpacing: "0px", // 0%
          lineHeight: "24px",
        },
        ".text-h3": {
          fontSize: "18px",
          fontWeight: 500,
          letterSpacing: "-0.36px", // -2% of 18px
          lineHeight: "22px",
        },
        ".text-body-regular": {
          fontSize: "14px",
          fontWeight: 400,
          letterSpacing: "-0.14px", // -1% of 14px
          lineHeight: "24px",
        },
        ".text-body-medium": {
          fontSize: "14px",
          fontWeight: 500,
          letterSpacing: "-0.28px", // -2% of 14px
          lineHeight: "17px",
        },
        ".text-body-semibold": {
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "-0.28px", // -2% of 14px
          lineHeight: "17px",
        },
        ".text-body-regular-cap-height": {
          fontSize: "14px",
          fontWeight: 400,
          letterSpacing: "-0.14px", // -1% of 14px
          lineHeight: "0.8",
        },
        ".text-body-medium-cap-height": {
          fontSize: "14px",
          fontWeight: 500,
          letterSpacing: "-0.28px", // -2% of 14px
          lineHeight: "0.8",
        },
        ".text-body-semibold-cap-height": {
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "-0.28px", // -2% of 14px
          lineHeight: "0.8",
        },
        ".center-atop-svg": {
          position: "absolute",
          left: "50%",
          top: "50%",
          "--tw-translate-x": "-50%",
          "--tw-translate-y": "-50%",
          transform: "translate(var(--tw-translate-x), var(--tw-translate-y))",
        },
        ".button-disabled": {
          cursor: "not-allowed",
          backgroundColor: theme("colors.surface_bg_secondary"),
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "-0.28px", // -2% of 14px
          lineHeight: "0.8",
          color: theme("colors.typeface_tertiary"),
        },
        ".no-scrollbar": {
          "-ms-overflow-style": "none",
          /* Firefox */
          "scrollbar-width": "none",
          /* Safari and Chrome */
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
    },
    plugin(function ({ addUtilities, theme }) {
      const colors = theme("colors");
      const outlineUtilities = Object.entries(colors).map(
        ([colorName, value]) => {
          return {
            [`.outline-${colorName}`]: {
              outline: `1px solid ${value}`,
              "outline-offset": "-1px", // This ensures the outline is inside
            },
            [`.outline-dashed-${colorName}`]: {
              outline: `1px dashed ${value}`,
              "outline-offset": "-1px", // This ensures the outline is inside
            },
          };
        }
      );

      addUtilities(outlineUtilities);
    }),
  ],
} satisfies Config;

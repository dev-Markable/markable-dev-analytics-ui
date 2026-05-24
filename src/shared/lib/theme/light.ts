import type { ThemeConfig } from 'antd';

export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#5b6cff',
    colorInfo: '#5b6cff',
    colorSuccess: '#00b87c',
    colorWarning: '#f5a524',
    colorError: '#ef4444',

    colorTextBase: '#0a0a0a',
    colorBgBase: '#ffffff',

    // Page + topbar — лёгкий серый, чтобы elevated-панели (cards/sidebar) лежали сверху.
    colorBgLayout: '#eef0f4',
    // Elevated-панели: сайдбар, карточки.
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',

    colorBorder: '#dbdfe6',
    colorBorderSecondary: '#e6e9ee',
    colorSplit: '#e6e9ee',

    colorTextSecondary: '#5b6271',
    colorTextTertiary: '#8a909c',
    colorTextQuaternary: '#b0b6c0',

    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 28,
    fontSizeHeading2: 22,
    fontSizeHeading3: 18,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,
    fontWeightStrong: 600,
    lineHeight: 1.5,

    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    controlHeight: 36,
    controlHeightLG: 40,
    controlHeightSM: 28,

    boxShadow:
      '0 1px 3px rgba(15,17,21,0.06), 0 1px 2px rgba(15,17,21,0.05)',
    boxShadowSecondary:
      '0 8px 24px rgba(15,17,21,0.08), 0 2px 6px rgba(15,17,21,0.05)',
    boxShadowTertiary: '0 1px 2px rgba(15,17,21,0.04)',

    wireframe: false,
    motion: true,
  },
  components: {
    Card: { borderRadiusLG: 12, paddingLG: 20, headerBg: 'transparent' },
    Button: {
      borderRadius: 8,
      fontWeight: 500,
      controlHeight: 36,
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
    },
    Table: {
      headerBg: '#f7f8fa',
      headerColor: '#5b6271',
      rowHoverBg: '#f7f8fa',
      cellPaddingBlock: 12,
      headerSplitColor: '#e6e9ee',
    },
    Input: { borderRadius: 8, paddingBlock: 8 },
    Select: { borderRadius: 8 },
    Menu: {
      itemBorderRadius: 8,
      itemHeight: 36,
      itemHoverBg: '#eef0f4',
      itemSelectedBg: '#eef0ff',
      itemSelectedColor: '#5b6cff',
      itemMarginInline: 8,
    },
    Tag: { borderRadiusSM: 6, defaultBg: '#eef0f4', defaultColor: '#5b6271' },
    // Sider — elevated (= card BG, белый). Header — низкий уровень (= page BG, серый).
    Layout: { headerBg: '#eef0f4', siderBg: '#ffffff', bodyBg: '#eef0f4' },
    Tooltip: { colorBgSpotlight: '#0a0a0a' },
    Statistic: { titleFontSize: 13, contentFontSize: 28 },
    Modal: { borderRadiusLG: 12 },
    Drawer: { borderRadiusLG: 12 },
    Segmented: { borderRadius: 8, controlHeight: 32, itemSelectedBg: '#ffffff' },
  },
};

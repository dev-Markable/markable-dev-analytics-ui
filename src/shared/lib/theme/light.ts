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

    colorBgLayout: '#fafafa',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',

    colorBorder: '#e6e8eb',
    colorBorderSecondary: '#eef0f2',
    colorSplit: '#eef0f2',

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
      '0 1px 2px rgba(15,17,21,.04), 0 0 0 1px rgba(15,17,21,.04)',
    boxShadowSecondary:
      '0 4px 16px rgba(15,17,21,.06), 0 0 0 1px rgba(15,17,21,.04)',
    boxShadowTertiary: '0 1px 2px rgba(15,17,21,.03)',

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
      headerBg: '#fafafa',
      headerColor: '#5b6271',
      rowHoverBg: '#fafafa',
      cellPaddingBlock: 12,
      headerSplitColor: '#eef0f2',
    },
    Input: { borderRadius: 8, paddingBlock: 8 },
    Select: { borderRadius: 8 },
    Menu: {
      itemBorderRadius: 8,
      itemHeight: 36,
      itemHoverBg: '#f4f5f7',
      itemSelectedBg: '#eef0ff',
      itemSelectedColor: '#5b6cff',
      itemMarginInline: 8,
    },
    Tag: { borderRadiusSM: 6, defaultBg: '#f4f5f7', defaultColor: '#5b6271' },
    Layout: { headerBg: '#ffffff', siderBg: '#ffffff', bodyBg: '#fafafa' },
    Tooltip: { colorBgSpotlight: '#0a0a0a' },
    Statistic: { titleFontSize: 13, contentFontSize: 28 },
    Modal: { borderRadiusLG: 12 },
    Drawer: { borderRadiusLG: 12 },
    Segmented: { borderRadius: 8, controlHeight: 32, itemSelectedBg: '#ffffff' },
  },
};

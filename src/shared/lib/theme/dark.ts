import { theme, type ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#7c8aff',
    colorInfo: '#7c8aff',
    colorSuccess: '#00d97e',
    colorWarning: '#f5a524',
    colorError: '#f87171',

    colorBgBase: '#0a0a0b',
    colorBgLayout: '#0a0a0b',
    colorBgContainer: '#101113',
    colorBgElevated: '#16181c',

    colorBorder: '#1d1f23',
    colorBorderSecondary: '#16181c',
    colorSplit: '#1d1f23',

    colorTextBase: '#f4f5f7',
    colorTextSecondary: '#8a909c',
    colorTextTertiary: '#6a7280',
    colorTextQuaternary: '#4a525e',

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

    boxShadow: '0 0 0 1px rgba(255,255,255,.04)',
    boxShadowSecondary: '0 4px 16px rgba(0,0,0,.4), 0 0 0 1px rgba(255,255,255,.06)',
    boxShadowTertiary: 'none',

    wireframe: false,
    motion: true,
  },
  components: {
    Card: { borderRadiusLG: 12, paddingLG: 20, headerBg: 'transparent', colorBgContainer: '#101113' },
    Button: {
      borderRadius: 8,
      fontWeight: 500,
      controlHeight: 36,
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
    },
    Table: {
      headerBg: '#101113',
      headerColor: '#8a909c',
      rowHoverBg: '#16181c',
      cellPaddingBlock: 12,
      borderColor: '#1d1f23',
      headerSplitColor: '#1d1f23',
    },
    Input: { borderRadius: 8, paddingBlock: 8 },
    Select: { borderRadius: 8 },
    Menu: {
      itemBorderRadius: 8,
      itemHeight: 36,
      itemHoverBg: '#16181c',
      itemSelectedBg: 'rgba(124,138,255,.12)',
      itemSelectedColor: '#7c8aff',
      itemMarginInline: 8,
    },
    Tag: { borderRadiusSM: 6, defaultBg: '#16181c', defaultColor: '#8a909c' },
    Layout: { headerBg: '#0a0a0b', siderBg: '#0a0a0b', bodyBg: '#0a0a0b' },
    Tooltip: { colorBgSpotlight: '#1d1f23' },
    Statistic: { titleFontSize: 13, contentFontSize: 28 },
    Modal: { borderRadiusLG: 12 },
    Drawer: { borderRadiusLG: 12 },
    Segmented: { borderRadius: 8, controlHeight: 32, itemSelectedBg: '#16181c' },
  },
};

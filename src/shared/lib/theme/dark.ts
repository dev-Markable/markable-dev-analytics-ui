import { theme, type ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#7c8aff',
    colorInfo: '#7c8aff',
    colorSuccess: '#00d97e',
    colorWarning: '#f5a524',
    colorError: '#f87171',

    // Page bg — самый тёмный уровень.
    colorBgBase: '#06070a',
    colorBgLayout: '#06070a',
    // Все панели — единый elevated-уровень. Сайдбар = топбар = карточки.
    colorBgContainer: '#15171c',
    colorBgElevated: '#1c1f25',

    colorBorder: '#2a2e36',
    colorBorderSecondary: '#22252c',
    colorSplit: '#22252c',

    colorTextBase: '#f4f5f7',
    colorTextSecondary: '#9099a4',
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

    boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
    boxShadowSecondary: '0 8px 24px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)',
    boxShadowTertiary: '0 1px 2px rgba(0,0,0,0.3)',

    wireframe: false,
    motion: true,
  },
  components: {
    Card: { borderRadiusLG: 12, paddingLG: 20, headerBg: 'transparent', colorBgContainer: '#15171c' },
    Button: {
      borderRadius: 8,
      fontWeight: 500,
      controlHeight: 36,
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
    },
    Table: {
      headerBg: '#1a1d22',
      headerColor: '#9099a4',
      rowHoverBg: '#1a1d22',
      cellPaddingBlock: 12,
      borderColor: '#2a2e36',
      headerSplitColor: '#2a2e36',
    },
    Input: { borderRadius: 8, paddingBlock: 8 },
    Select: { borderRadius: 8 },
    Menu: {
      itemBorderRadius: 8,
      itemHeight: 36,
      itemHoverBg: '#1c1f25',
      itemSelectedBg: 'rgba(124,138,255,.14)',
      itemSelectedColor: '#7c8aff',
      itemMarginInline: 8,
    },
    Tag: { borderRadiusSM: 6, defaultBg: '#1c1f25', defaultColor: '#9099a4' },
    // Sider = Header = Card BG. Page (bodyBg) — темнее на пару уровней.
    Layout: { headerBg: '#15171c', siderBg: '#15171c', bodyBg: '#06070a' },
    Tooltip: { colorBgSpotlight: '#2a2e36' },
    Statistic: { titleFontSize: 13, contentFontSize: 28 },
    Modal: { borderRadiusLG: 12 },
    Drawer: { borderRadiusLG: 12 },
    Segmented: { borderRadius: 8, controlHeight: 32, itemSelectedBg: '#1c1f25' },
  },
};

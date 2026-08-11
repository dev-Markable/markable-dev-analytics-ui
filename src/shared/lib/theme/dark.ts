import { theme, type ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#7c8aff',
    colorInfo: '#7c8aff',
    colorSuccess: '#00d97e',
    colorWarning: '#f5a524',
    colorError: '#f87171',

    // Page + topbar — низкий уровень.
    colorBgBase: '#0a0c10',
    colorBgLayout: '#0a0c10',
    // Elevated-панели: сайдбар, карточки.
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

    borderRadius: 10,
    borderRadiusLG: 16,
    borderRadiusSM: 8,

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
    Card: { borderRadiusLG: 16, paddingLG: 20, headerBg: 'transparent', colorBgContainer: '#15171c' },
    Button: {
      borderRadius: 10,
      fontWeight: 500,
      controlHeight: 36,
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
    },
    Table: {
      // Шапка без заливки: таблица читается как список, а не как «сетка Excel».
      headerBg: 'transparent',
      headerColor: '#6a7280',
      rowHoverBg: 'rgba(124,138,255,.06)',
      cellPaddingBlock: 16,
      borderColor: '#22252c',
      headerSplitColor: 'transparent',
    },
    Input: { borderRadius: 10, paddingBlock: 8 },
    Select: { borderRadius: 10 },
    Menu: {
      itemBorderRadius: 10,
      itemHeight: 36,
      itemHoverBg: '#1c1f25',
      itemSelectedBg: 'rgba(124,138,255,.14)',
      itemSelectedColor: '#7c8aff',
      itemMarginInline: 8,
    },
    Tag: { borderRadiusSM: 6, defaultBg: '#1c1f25', defaultColor: '#9099a4' },
    // Sider — elevated. Header — низкий уровень (= page BG).
    Layout: { headerBg: '#0a0c10', siderBg: '#15171c', bodyBg: '#0a0c10' },
    Tooltip: { colorBgSpotlight: '#2a2e36' },
    Statistic: { titleFontSize: 13, contentFontSize: 28 },
    Modal: { borderRadiusLG: 16 },
    Drawer: { borderRadiusLG: 16 },
    Segmented: { borderRadius: 10, controlHeight: 32, itemSelectedBg: '#1c1f25' },
  },
};

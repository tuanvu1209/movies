import { ThemeConfig } from 'antd'

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#e50914', // Netflix red
    colorBgContainer: 'rgba(0, 0, 0, 0.6)',
    colorText: '#ffffff',
    colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 4,
    fontFamily: 'Netflix Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  components: {
    Input: {
      colorBgContainer: 'rgba(0, 0, 0, 0.5)',
      colorBorder: '#525252',
      colorTextPlaceholder: '#a3a3a3',
      activeBorderColor: '#ffffff',
      hoverBorderColor: '#ffffff',
    },
    Button: {
      primaryColor: '#ffffff',
      fontWeight: 500,
    },
    Checkbox: {
      colorBorder: 'rgba(255, 255, 255, 0.3)',
      colorWhite: '#ffffff',
    },
  },
}

export default theme

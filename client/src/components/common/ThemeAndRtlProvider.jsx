import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { useAppSelector } from '../../Store/hooks.js';
import { selectThemeMode } from '../../Store/Slice/themeSlice.js';
import { createAppTheme } from '../../themes/theme.js';

// Pre-create Emotion caches for RTL and LTR
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const cacheLtr = createCache({
  key: 'muiltr',
});

export default function ThemeAndRtlProvider({ children }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const isRtl = currentLang === 'fa';
  const mode = useAppSelector(selectThemeMode);

  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.colorScheme = mode;
  }, [currentLang, isRtl, mode]);

  const theme = useMemo(() => createAppTheme(isRtl ? 'rtl' : 'ltr', mode), [isRtl, mode]);

  return (
    <CacheProvider value={isRtl ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}

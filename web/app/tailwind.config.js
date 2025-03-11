/** @type {import('tailwindcss').Config} */
const svgToDataUri = require('mini-svg-data-uri');
const uiConfig = require('./ui.config.js');
const deepMerge = require('deepmerge');
const headlessuiPlugin = require('@headlessui/tailwindcss');

module.exports = deepMerge(
  {
    content: [
      './components/**/*.tsx',
      './pages/**/*.tsx',
      './_blog/*.mdx',
      './utils/**/*.ts',
      './node_modules/@supabase/ui/dist/config/default-theme.js',
      './styles/**/*.css',
      './src/**/*.{js,jsx,ts,tsx}', // Added from the new config
    ],
    theme: {
      extend: {
        borderRadius: {
          '4xl': '2rem',
          '5xl': '2.5rem',
        },
        fontFamily: {
          sans: 'var(--font-inter)',
          display: 'var(--font-dm-sans)',
        },
        maxWidth: {
          '2xl': '40rem',
        },
        colors: {
          scale: {
            100: 'var(--colors-scale100, #f9fafb)',
            200: 'var(--colors-scale200, #f2f4f7)',
            300: 'var(--colors-scale300, #e4e7ec)',
            400: 'var(--colors-scale400, #d0d5dd)',
            500: 'var(--colors-scale500, #98a2b3)',
            600: 'var(--colors-scale600, #667085)',
            700: 'var(--colors-scale700, #475467)',
            800: 'var(--colors-scale800, #344054)',
            900: 'var(--colors-scale900, #1d2939)',
            1000: 'var(--colors-scale1000, #101828)',
            1100: 'var(--colors-scale1100, #0d1520)',
            1200: 'var(--colors-scale1200, #030712)',
          },
          brand: {
            100: 'var(--colors-brand100, #f0f9ff)',
            200: 'var(--colors-brand200, #e0f2fe)',
            300: 'var(--colors-brand300, #bae6fd)',
            400: 'var(--colors-brand400, #7dd3fc)',
            500: 'var(--colors-brand500, #38bdf8)',
            600: 'var(--colors-brand600, #0ea5e9)',
            700: 'var(--colors-brand700, #0284c7)',
            800: 'var(--colors-brand800, #0369a1)',
            900: 'var(--colors-brand900, #075985)',
          },
        },
        typography: ({ theme }) => ({
          DEFAULT: {
            css: {
              'code::before': {
                content: '""',
              },
              'code::after': {
                content: '""',
              },
              '--tw-prose-body': theme('colors.scale.1100'),
              '--tw-prose-headings': theme('colors.scale.1200'),
              '--tw-prose-lead': theme('colors.scale.1100'),
              '--tw-prose-links': theme('colors.brand.900'),
              '--tw-prose-bold': theme('colors.scale.1100'),
              '--tw-prose-counters': theme('colors.scale.1100'),
              '--tw-prose-bullets': theme('colors.scale.900'),
              '--tw-prose-hr': theme('colors.scale.500'),
              '--tw-prose-quotes': theme('colors.scale.1100'),
              '--tw-prose-quote-borders': theme('colors.scale.500'),
              '--tw-prose-captions': theme('colors.scale.700'),
              '--tw-prose-code': theme('colors.scale.1200'),
              '--tw-prose-pre-code': theme('colors.scale.900'),
              '--tw-prose-pre-bg': theme('colors.scale.400'),
              '--tw-prose-th-borders': theme('colors.scale.500'),
              '--tw-prose-td-borders': theme('colors.scale.200'),
              '--tw-prose-invert-body': theme('colors.scale.200'),
              '--tw-prose-invert-headings': theme('colors.white'),
              '--tw-prose-invert-lead': theme('colors.scale.500'),
              '--tw-prose-invert-links': theme('colors.white'),
              '--tw-prose-invert-bold': theme('colors.white'),
              '--tw-prose-invert-counters': theme('colors.scale.400'),
              '--tw-prose-invert-bullets': theme('colors.scale.600'),
              '--tw-prose-invert-hr': theme('colors.scale.700'),
              '--tw-prose-invert-quotes': theme('colors.scale.100'),
              '--tw-prose-invert-quote-borders': theme('colors.scale.700'),
              '--tw-prose-invert-captions': theme('colors.scale.400'),
              'h1, h2, h3, h4, h5': {
                fontWeight: '400',
              },
              h2: {
                fontWeight: '400',
              },
              p: {
                fontWeight: '400',
              },
              a: {
                fontWeight: '400',
              },
              pre: {
                background: 'none',
                padding: 0,
                marginBottom: '32px',
              },
              'p img': {
                border: '1px solid var(--colors-scale4)',
                borderRadius: '4px',
                overflow: 'hidden',
              },
            },
          },
          toc: {
            css: {
              ul: {
                'list-style-type': 'none',
                'padding-left': 0,
                margin: 0,
                li: {
                  'padding-left': 0,
                },
                a: {
                  display: 'block',
                  'text-decoration': 'none',
                  fontSize: '0.8rem',
                  fontWeight: '200',
                  color: theme('colors.scale.1100'),
                  '&:hover': {
                    color: theme('colors.scale.1200'),
                  },
                  'font-weight': '400',
                },
                ul: {
                  'list-style-type': 'none',
                  li: {
                    marginTop: '0.2rem',
                    marginBottom: '0.2rem',
                    'padding-left': '0 !important',
                    'margin-left': '0.5rem',
                  },
                  a: {
                    fontWeight: '200',
                    color: theme('colors.scale.1000'),
                    '&:hover': {
                      color: theme('colors.scale.1200'),
                    },
                  },
                },
              },
            },
          },
        }),
        backgroundImage: {
          squiggle: `url("${svgToDataUri(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 3" enable-background="new 0 0 6 3" width="6" height="3" fill="#facc15"><polygon points="5.5,0 2.5,3 1.1,3 4.1,0"/><polygon points="4,0 6,2 6,0.6 5.4,0"/><polygon points="0,2 1,3 2.4,3 0,0.6"/></svg>`
          )}")`,
        },
        keyframes: {
          'flash-code': {
            '0%': { backgroundColor: 'rgba(63, 207, 142, 0.1)' },
            '100%': { backgroundColor: 'transparent' },
          },
        },
        animation: {
          'flash-code': 'flash-code 1s forwards',
          'flash-code-slow': 'flash-code 2s forwards',
        },
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
      headlessuiPlugin,
      function ({ addBase, theme }) {
        let allColors = {};
        Object.entries(theme('colors')).forEach(([key, value]) => {
          if (typeof value === 'object') {
            Object.entries(value).forEach(([subKey, subValue]) => {
              allColors[`--${key}-${subKey}`] = subValue;
            });
          } else {
            allColors[`--${key}`] = value;
          }
        });

        addBase({
          ':root': allColors,
        });
      },
    ],
  },
  uiConfig
);
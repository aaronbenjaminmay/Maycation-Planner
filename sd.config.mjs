import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({
  hooks: {
    fileHeaders: {
      'with-regen': async (defaultMessages) => [
        ...defaultMessages,
        'Run `npm run build:tokens` to regenerate.',
      ],
    },
  },
  source: ['tokens/source/*.tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'tokens/generated/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          filter: (token) => !token.path.includes('primitive'),
          options: {
            outputReferences: false,
            selector: ':root',
            fileHeader: 'with-regen',
          },
        },
      ],
    },
    ts: {
      // name/camel: camelCase export names
      // color/css:  rgba() strings for transparent colors, hex for opaque
      // shadow/css/shorthand: converts composite shadow object to CSS shorthand string
      transforms: ['name/camel', 'color/css', 'shadow/css/shorthand'],
      buildPath: 'tokens/generated/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'javascript/es6',
          filter: (token) => !token.path.includes('primitive'),
          options: {
            outputReferences: false,
            fileHeader: 'with-regen',
          },
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();

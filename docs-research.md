# API Extractor

### Addressed issues
- would be nice to detect PRs that break API contracts, flag them. Approving every PR by an experienced developer is not feasible.
- for a great developing experience every dependency needs to be exported (eg. definition types of method params)
- accidental exports must be avoided since the beginning
- nice to have alfa/beta APIs classification (alfa -> beta -> public lifecycle)
- TypeScript first documentation tool

### Characteristics

It is a **TypeScript analysis tool** invoked at build time and outputs:
1. API report for facilitating reviews and warn about mistakes
2. d.ts files trimmed according to release type (alfa, beta, public)
3. API documentation: ease to integrate & portable format


# Node and Browser bundling

- tsc: compiles code to es5 and creates d.ts files for type declarations

### Webpack + tsc + npm

Create three outputs:
1. tsc compiled + d.ts + source maps. CommonJS modules for supporting the majority of bundlers (tsc)
2. same as ^, with ES6 module syntax to perform tree shaking for reducing bundle sizes (tsc)
3. UMD bundle compiled to ES5 that works in browser and expose a global variable (webpack)

What needs to be published on NPM

```
    _bundles/		// UMD bundles
    lib/			// ES5(commonjs) + source + .d.ts
    lib-esm/		// ES5(esmodule) + source + .d.ts
    package.json
    README.md
```


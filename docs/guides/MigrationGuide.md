# 1.x Migration Guide

This migration guide is divided into 4 parts:
- [Project overview](#project-overview)
- [Apps and shared code](#apps-and-shared-code)
- [Configuration](#configuration)
- [Other breaking changes](#other-breaking-changes)

## Project overview

Before diving deeper, it's essential to familiarize yourself with the new project structure.

Here is project `src` directory tree generated by the `gluestick new` command:
```
src
├── apps
│   └── main
│       ├── Index.js
│       ├── actions
│       ├── components
│       │   ├── Home.css
│       │   ├── Home.js
│       │   ├── MasterLayout.js
│       │   └── __tests__
│       │       ├── Home.test.js
│       │       └── MasterLayout.test.js
│       ├── containers
│       │   ├── HomeApp.js
│       │   ├── NoMatchApp.js
│       │   └── __tests__
│       │       ├── HomeApp.test.js
│       │       └── NoMatchApp.test.js
│       ├── reducers
│       │   └── index.js
│       └── routes.js
├── config
│   ├── .Dockerfile
│   ├── application.js
│   ├── application.server.js
│   ├── caching.server.js
│   ├── init.browser.js
│   ├── redux-middleware.js
│   └── webpack-additions.js
├── entries.json
├── gluestick.hooks.js
├── gluestick.plugins.js
├── shared
│   ├── actions
│   ├── components
│   ├── containers
│   └── reducers
│       └── index.js
└── webpack.hooks.js
```

> Apart from the `src` directory, the `new` command will also create other files in the root folder, outside of `src`, such as `.eslintrc`, `.flowconfig`, `package.json` etc. However, they do not need any special treatment.

The `src` directory consists of 3 essential parts:
- `apps` - contains apps
- `config` - project-wide configurations
- `shared` - shared actions, components, containers, etc between apps

# Apps and shared code

As described in the previous section all apps reside inside the `src/apps` directory. Each app has its own folder and each one must have at least one root component (by default it's `Index.js`), routes (`routes.js`) and a reducers object (`reducers/index.js`).

As you can see, it is similar to the GlueStick 0.x project structure, so you will only need to update the paths in `import` statements and the reducers index.

For example, if previously there was:
```
import SomeComponent from 'components/SomeComponent';
```
now you must specify *who owns this component* - whether it's `shared` or inside some app:
```
import SomeComponent from 'shared/components/SomeComponent';
// or
import SomeComponent from 'myApp/components/SomeComponent';
```
The same goes for `actions`, `containers` etc.

Here is the list of all available aliases:
- `<appName>` - path to `appName` app
- `root` - path to project root directory
- `src` - path to project source directory
- `assets` - path to assets directory (`<root>/assets`)
- `shared` - path to shared code (`<src>/shared`)
- `config` - path to configurations (`<src>/config`)
- `apps` - path to apps (`<src>/apps`)
- `compiled` - path to `node_modules` module which needs to be parsed by webpack loaders (by default all modules from `node_modules` will be marked as external in server bundle, which means they won't be parsed by loaders, so in case you need the module to be transpiled or if it's a css/scss file you need to prefix it with this alias eg: `import 'compiled/normalize.css'`)

Previously the `reducers/index.js` file was re-exporting reducers:
```
export { default as myReducer } from './myReducer';
```
but now it needs to export a single object with `key`: `reducer` pairs:
```
import myReducer from './myReducer';

export default {
  myReducer,
}
```

## Configuration
The most important file is `entries.json`, since it defines every entrypoint for webpack:
```json
{
  "/": {
    "component": "src/apps/main/Index.js",
    "routes": "src/apps/main/routes.js",
    "reducers": "src/apps/main/reducers"
  }
}
```

> An app is also referred to as an `entrypoint`, since every app will later become a single webpack entrypoint.

`entries.json` must be an object with `key`: `object` pairs. Each entry defines single entrypoint for webpack.

- `key` (in this example it's `"/"`) is a url-like path to where entrypoint is mounted
- `component` is a path to root app component
- `routes` is a path to app routes
- `reducers` is a path to reducers object (reducers index)`

> __IMPORTANT__: entrypoint `key` must be the same as `path` prop in top-level `<Route>` component in `routes` file.

If the entrypoint `key` is too verbose you can specify an alternative alias using the `name` field:
```
{
  "/very-long-entry-key": {
    "name": "shortName",
    ...
  }
}
```

More about `entries.json` can be found [here](./Apps.md)

There are also other files:
- [`gluestick.hooks.js`](./CachingAndHooks.md#hooks) - `init.server.js` is no longer supported and the code should be moved to `preInitServer` hook
- [`gluestick.plugins.js`](./Plugins.md) - specify plugins to use
- [`webpack.hooks.js`](./CachingAndHooks.md#webpack-hooks) - overwrite webpack config
- [`caching.server.js`](./CachingAndHooks.md#caching)

To use `config/webpack-additions.js` and/or `config/application.server.js` you must need `gluestick-config-legacy` plugin installed and enabled, however the recommended approach is to use `webpack.hooks.js`, since at some point in the future `gluestick-config-legacy` will be deprecated.

`config/redux-middleware.js` and `config/application.js` works as before.

# Other breaking changes
- `promiseMiddleware` returns `payload` instead of `value` in `action` object used by reducers
- `axios` (update to `0.15.3`) in `catch` handler passes instance of `Error` with `response` property instead of just `response`, see associated PR [here](https://github.com/mzabriskie/axios/pull/345/files#diff-b19c56bc1192e2f4840a79ffebfe1d7bR18).
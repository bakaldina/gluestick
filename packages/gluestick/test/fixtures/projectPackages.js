export const validProjectPackage = {
  "name": "AppName",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "gluestick start",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "axios": "0.12.0",
    "babel-core": "6.22.1",
    "babel-loader": "6.2.4",
    "babel-plugin-gluestick": "0.0.1",
    "babel-plugin-transform-decorators-legacy": "1.3.4",
    "babel-preset-es2015": "6.22.0",
    "babel-preset-react": "6.22.0",
    "babel-preset-stage-0": "6.22.0",
    "babel-register": "6.22.0",
    "babel-runtime": "6.9.2",
    "babel-traverse": "6.21.0",
    "css-loader": "0.23.1",
    "electrode-react-ssr-caching": "0.1.5",
    "file-loader": "0.8.5",
    "gluestick-shared": "0.4.22",
    "history": "3.0.0",
    "image-webpack-loader": "2.0.0",
    "json-loader": "0.5.4",
    "node-sass": "3.7.0",
    "oy-vey": "0.8.0",
    "radium": "0.18.1",
    "react": "15.4.2",
    "react-dom": "15.4.2",
    "react-helmet": "3.1.0",
    "react-redux": "5.0.2",
    "react-router": "3.0.2",
    "redux": "3.6.0",
    "sass-loader": "3.2.0",
    "style-loader": "0.13.1",
    "webpack": "1.13.2"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "babel-eslint": "7.1.1",
    "babel-plugin-react-transform": "2.0.2",
    "enzyme": "2.7.1",
    "eslint": "3.14.0",
    "eslint-plugin-react": "6.9.0",
    "react-addons-test-utils": "15.4.2",
    "react-hot-loader": "1.3.1",
    "react-transform-catch-errors": "1.0.2",
    "react-transform-hmr": "1.0.4",
    "redbox-react": "1.3.3",
    "webpack-hot-middleware": "2.15.0"
  }
};

export const validLargerProjectPackage = {
  ...validProjectPackage,
  dependencies: {
    ...validProjectPackage.dependencies,
    "axios": "9.9.9"
  }
};

export const invalidProjectPackage = {
  ...validProjectPackage,
  dependencies: {
    ...validProjectPackage.dependencies,
    "axios": "0.0.1"
  }
};

const missingProjectPackage = {
  ...validProjectPackage,
  dependencies: {
    ...validProjectPackage.dependencies
  }
};
delete missingProjectPackage.dependencies.axios;
export { missingProjectPackage };
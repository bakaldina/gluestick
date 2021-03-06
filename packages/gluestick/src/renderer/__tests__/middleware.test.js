/* @flow */
import type { Request, Response, Entries } from '../../types';

const contextMock = require('../../__tests__/mocks/context');

/* eslint-disable react/no-multi-comp */
jest.mock('../../../shared', () => ({
  getHttpClient: jest.fn(),
  createStore: jest.fn(() => ({})),
  prepareRoutesWithTransitionHooks: jest.fn(val => val),
  runBeforeRoutes: jest.fn(() => new Promise(r => r())),
}));
jest.mock('../helpers/matchRoute.js', () =>
  jest.fn((ctx, req, routes) => ({
    redirectLocation: routes().mockBehaviour.redirect
      ? {
          pathname: 'pathname',
          search: 'search',
        }
      : null,
    renderProps: routes().mockBehaviour.renderProps,
  })),
);
jest.mock('../helpers/errorHandler.js', () => jest.fn());
jest.mock('../render.js', () =>
  jest.fn(() => ({
    responseString: 'output',
  })),
);
jest.mock('../helpers/cacheManager.js', () =>
  jest.fn(() => ({
    getCachedIfProd: jest.fn(req => (req.url === '/cached' ? 'cached' : null)),
    enableComponentCaching: jest.fn(),
  })),
);
jest.mock('../response/getStatusCode.js', () => jest.fn(() => 200));
jest.mock('project-entries-config', () => ({
  default: contextMock.entriesConfig,
}));
jest.mock('../../config', () => contextMock.config);

const React = require('react');

const request: Request = contextMock.request;

const response: Response = {
  send: jest.fn(),
  set: jest.fn(),
  status: jest.fn(() => response),
  sendStatus: jest.fn(),
  redirect: jest.fn(),
  header: jest.fn(),
  json: jest.fn(),
};

const getHooks = () => ({
  preRenderFromCache: jest.fn(v => v),
  postRenderRequirements: jest.fn(v => v),
  preRedirect: jest.fn(v => v),
  postRenderProps: jest.fn(v => v),
  postGetCurrentRoute: jest.fn(v => v),
  postRender: jest.fn(v => v),
  error: jest.fn(v => v),
});

const getEntries = (routes): { default: Entries, plugins: Plugin[] } => ({
  default: {
    '/': {
      component: class extends React.Component {
        render() {
          return <div>Index</div>;
        }
      },
      reducers: {},
      routes: () => routes,
    },
  },
  plugins: [],
});

const assets = {};

describe('renderer/middleware', () => {
  beforeEach(() => {
    response.send.mockReset();
    jest.resetModules();
  });

  it('should render output', async () => {
    jest.mock('project-entries', () =>
      getEntries({
        mockBehaviour: {
          renderProps: {
            routes: [{}],
          },
        },
      }),
    );
    const hooks = getHooks();
    jest.mock('gluestick-hooks', () => ({ default: hooks }));
    const middleware = require('../middleware');
    await middleware(request, response, {
      assets,
    });
    expect(hooks.preRenderFromCache).toHaveBeenCalledTimes(0);
    expect(hooks.postRenderRequirements).toHaveBeenCalledTimes(1);
    expect(hooks.preRedirect).toHaveBeenCalledTimes(0);
    expect(hooks.postRenderProps).toHaveBeenCalledTimes(1);
    expect(hooks.postGetCurrentRoute).toHaveBeenCalledTimes(1);
    expect(hooks.postRender).toHaveBeenCalledTimes(1);
    expect(hooks.error).toHaveBeenCalledTimes(0);
    expect(response.status.mock.calls[0]).toEqual([200]);
    expect(response.send.mock.calls[0]).toEqual(['output']);
  });

  it('should redirect', async () => {
    jest.mock('project-entries', () =>
      getEntries({
        mockBehaviour: {
          redirect: true,
        },
      }),
    );
    const hooks = getHooks();
    jest.mock('gluestick-hooks', () => ({ default: hooks }));
    const middleware = require('../middleware');
    await middleware(request, response, {
      assets,
      hooks,
    });
    expect(hooks.preRenderFromCache).toHaveBeenCalledTimes(0);
    expect(hooks.postRenderRequirements).toHaveBeenCalledTimes(1);
    expect(hooks.preRedirect).toHaveBeenCalledTimes(1);
    expect(hooks.postRenderProps).toHaveBeenCalledTimes(1);
    expect(hooks.postGetCurrentRoute).toHaveBeenCalledTimes(0);
    expect(hooks.postRender).toHaveBeenCalledTimes(0);
    expect(hooks.error).toHaveBeenCalledTimes(0);
    expect(response.redirect.mock.calls[0]).toEqual([301, 'pathnamesearch']);
  });

  it('should send 404 status', async () => {
    jest.mock('project-entries', () =>
      getEntries({
        mockBehaviour: {
          renderProps: null,
        },
      }),
    );
    const hooks = getHooks();
    jest.mock('gluestick-hooks', () => ({ default: hooks }));
    const middleware = require('../middleware');
    await middleware(request, response, {
      assets,
      hooks,
    });
    expect(hooks.preRenderFromCache).toHaveBeenCalledTimes(0);
    expect(hooks.postRenderRequirements).toHaveBeenCalledTimes(1);
    expect(hooks.preRedirect).toHaveBeenCalledTimes(0);
    expect(hooks.postRenderProps).toHaveBeenCalledTimes(1);
    expect(hooks.postGetCurrentRoute).toHaveBeenCalledTimes(0);
    expect(hooks.postRender).toHaveBeenCalledTimes(0);
    expect(hooks.error).toHaveBeenCalledTimes(0);
    expect(response.sendStatus.mock.calls[0]).toEqual([404]);
  });

  it('should call errorHandler', async () => {
    jest.mock('project-entries', () => ({ default: {}, plugins: [] }));
    const hooks = getHooks();
    jest.mock('gluestick-hooks', () => ({ default: hooks }));
    const errorHandler = require('../helpers/errorHandler');
    const middleware = require('../middleware');
    await middleware(request, response, {
      assets,
      hooks,
    });
    expect(hooks.error).toHaveBeenCalledTimes(1);
    expect(errorHandler).toHaveBeenCalledTimes(1);
  });

  describe('in production', () => {
    it('should send cached output', async () => {
      jest.mock('project-entries', () =>
        getEntries({
          mockBehaviour: {
            renderProps: {
              routes: [{}],
            },
          },
        }),
      );
      const hooks = getHooks();
      jest.mock('gluestick-hooks', () => ({ default: hooks }));
      const middleware = require('../middleware');
      await middleware(Object.assign(request, { url: '/cached' }), response, {
        assets,
        hooks,
      });
      expect(hooks.preRenderFromCache).toHaveBeenCalledTimes(1);
      expect(hooks.postRenderRequirements).toHaveBeenCalledTimes(0);
      expect(hooks.preRedirect).toHaveBeenCalledTimes(0);
      expect(hooks.postRenderProps).toHaveBeenCalledTimes(0);
      expect(hooks.postGetCurrentRoute).toHaveBeenCalledTimes(0);
      expect(hooks.postRender).toHaveBeenCalledTimes(0);
      expect(hooks.error).toHaveBeenCalledTimes(0);
      expect(response.status.mock.calls[0]).toEqual([200]);
      expect(response.send.mock.calls[0]).toEqual(['cached']);
    });
  });
});

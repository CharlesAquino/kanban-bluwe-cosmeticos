// Polyfills para APIs de browser que podem não estar disponíveis no ambiente de teste

// TransformStream polyfill simples
if (typeof globalThis.TransformStream === 'undefined') {
  (globalThis as any).TransformStream = class MockTransformStream {
    readable = {};
    writable = {};
  };
}

// Polyfill para Request/Response se necessário
if (typeof globalThis.Request === 'undefined') {
  (globalThis as any).Request = class MockRequest {
    constructor(url: string) {
      this.url = url;
    }
    url: string;
  };
}

if (typeof globalThis.Response === 'undefined') {
  (globalThis as any).Response = class MockResponse {
    constructor(body?: any) {
      this.body = body;
    }
    body: any;
  };
}

/**
 * @remix-run/node v2.9.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function installGlobals({
  nativeFetch
} = {}) {
  if (true) {
    let {
      File: UndiciFile,
      fetch: undiciFetch,
      FormData: UndiciFormData,
      Headers: UndiciHeaders,
      Request: UndiciRequest,
      Response: UndiciResponse
    } = require("undici");
    global.File = UndiciFile;
    global.Headers = UndiciHeaders;
    global.Request = UndiciRequest;
    global.Response = UndiciResponse;
    global.fetch = undiciFetch;
    global.FormData = UndiciFormData;
  } else {
    let {
      File: RemixFile,
      fetch: RemixFetch,
      FormData: RemixFormData,
      Headers: RemixHeaders,
      Request: RemixRequest,
      Response: RemixResponse
    } = require("@remix-run/web-fetch");
    global.File = RemixFile;
    global.Headers = RemixHeaders;
    global.Request = RemixRequest;
    global.Response = RemixResponse;
    global.fetch = RemixFetch;
    global.FormData = RemixFormData;
  }
}

exports.installGlobals = installGlobals;

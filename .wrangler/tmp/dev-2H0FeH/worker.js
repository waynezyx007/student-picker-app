var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-85l0IO/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-85l0IO/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// worker.js
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return handleCors();
    }
    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest(request, env, url);
    }
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\u5B66\u751F\u9009\u62E9\u5668\u5E94\u7528</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            text-align: center;
            color: #333;
        }
        #app {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        button {
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
        }
        #student-info {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h1>\u5B66\u751F\u9009\u62E9\u5668\u5E94\u7528</h1>
    <div id="app">
        <button id="random-student">\u968F\u673A\u9009\u62E9\u5B66\u751F</button>
        <button id="save-student">\u4FDD\u5B58\u5B66\u751F\u6570\u636E</button>
        <div id="student-info">
            <h3>\u5B66\u751F\u4FE1\u606F</h3>
            <p id="student-name">\u7B49\u5F85\u9009\u62E9...</p>
        </div>
    </div>

    <script>
        // \u7B80\u5355\u7684\u5B66\u751F\u9009\u62E9\u5668\u5E94\u7528
        const randomStudentBtn = document.getElementById('random-student');
        const saveStudentBtn = document.getElementById('save-student');
        const studentNameEl = document.getElementById('student-name');

        // \u6A21\u62DF\u5B66\u751F\u6570\u636E
        let students = [];

        // \u4ECEAPI\u83B7\u53D6\u5B66\u751F\u6570\u636E
        async function fetchStudents() {
            try {
                const response = await fetch('/api/students');
                students = await response.json();
                console.log('\u5B66\u751F\u6570\u636E:', students);
            } catch (error) {
                console.error('\u83B7\u53D6\u5B66\u751F\u6570\u636E\u5931\u8D25:', error);
            }
        }

        // \u968F\u673A\u9009\u62E9\u5B66\u751F
        randomStudentBtn.addEventListener('click', async () => {
            if (students.length === 0) {
                await fetchStudents();
            }
            if (students.length > 0) {
                const randomIndex = Math.floor(Math.random() * students.length);
                const selectedStudent = students[randomIndex];
                studentNameEl.textContent = selectedStudent.name + ' (' + selectedStudent.id + ')';
            } else {
                studentNameEl.textContent = '\u6CA1\u6709\u5B66\u751F\u6570\u636E';
            }
        });

        // \u4FDD\u5B58\u5B66\u751F\u6570\u636E
        saveStudentBtn.addEventListener('click', async () => {
            const newStudent = {
                id: Date.now().toString(),
                name: prompt('\u8BF7\u8F93\u5165\u5B66\u751F\u59D3\u540D:'),
                class: prompt('\u8BF7\u8F93\u5165\u5B66\u751F\u73ED\u7EA7:')
            };
            if (newStudent.name && newStudent.class) {
                try {
                    await fetch('/api/students', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newStudent)
                    });
                    alert('\u5B66\u751F\u6570\u636E\u4FDD\u5B58\u6210\u529F');
                    await fetchStudents(); // \u91CD\u65B0\u83B7\u53D6\u6570\u636E
                } catch (error) {
                    console.error('\u4FDD\u5B58\u5B66\u751F\u6570\u636E\u5931\u8D25:', error);
                    alert('\u4FDD\u5B58\u5931\u8D25');
                }
            }
        });

        // \u521D\u59CB\u5316\u83B7\u53D6\u5B66\u751F\u6570\u636E
        fetchStudents();
    <\/script>
</body>
</html>
    `;
    return new Response(htmlContent, {
      headers: { "Content-Type": "text/html" }
    });
  }
};
async function handleApiRequest(request, env, url) {
  const path = url.pathname.substring(4);
  try {
    switch (path) {
      case "/students":
        if (request.method === "GET") {
          return handleCors(await getAllStudents(env));
        } else if (request.method === "POST") {
          const studentData = await request.json();
          return handleCors(await saveStudent(env, studentData));
        }
        break;
      case "/students/all":
        if (request.method === "PUT") {
          const allData = await request.json();
          return handleCors(await saveAllStudents(env, allData));
        } else if (request.method === "DELETE") {
          return handleCors(await deleteAllStudents(env));
        }
        break;
      case "/backup":
        if (request.method === "GET") {
          return handleCors(await getBackup(env));
        }
        break;
      default:
        return handleCors(new Response("Not Found", { status: 404 }));
    }
  } catch (error) {
    return handleCors(new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    }));
  }
  return handleCors(new Response("Method Not Allowed", { status: 405 }));
}
__name(handleApiRequest, "handleApiRequest");
async function getAllStudents(env) {
  const studentsData = await env.STUDENT_DATA.get("all_students");
  if (!studentsData) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" }
    });
  }
  return new Response(studentsData, {
    headers: { "Content-Type": "application/json" }
  });
}
__name(getAllStudents, "getAllStudents");
async function saveStudent(env, studentData) {
  let students = [];
  const existingData = await env.STUDENT_DATA.get("all_students");
  if (existingData) {
    students = JSON.parse(existingData);
  }
  const existingIndex = students.findIndex((s) => s.id === studentData.id);
  if (existingIndex >= 0) {
    students[existingIndex] = studentData;
  } else {
    students.push(studentData);
  }
  await env.STUDENT_DATA.put("all_students", JSON.stringify(students));
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
__name(saveStudent, "saveStudent");
async function saveAllStudents(env, allData) {
  await env.STUDENT_DATA.put("all_students", JSON.stringify(allData));
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
__name(saveAllStudents, "saveAllStudents");
async function deleteAllStudents(env) {
  await env.STUDENT_DATA.delete("all_students");
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
__name(deleteAllStudents, "deleteAllStudents");
async function getBackup(env) {
  const studentsData = await env.STUDENT_DATA.get("all_students");
  return new Response(studentsData || "[]", {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="student_backup.json"'
    }
  });
}
__name(getBackup, "getBackup");
function handleCors(response = null) {
  if (!response) {
    response = new Response(null, { status: 204 });
  }
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (response instanceof Response) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  return response;
}
__name(handleCors, "handleCors");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-85l0IO/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-85l0IO/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map

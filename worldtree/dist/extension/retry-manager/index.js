"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRetryManager = exports.bindRetryHooks = exports.RetryManager = void 0;
const retry_manager_1 = require("./retry-manager");
var retry_manager_2 = require("./retry-manager");
Object.defineProperty(exports, "RetryManager", { enumerable: true, get: function () { return retry_manager_2.RetryManager; } });
var hooks_1 = require("./hooks");
Object.defineProperty(exports, "bindRetryHooks", { enumerable: true, get: function () { return hooks_1.bindRetryHooks; } });
exports.defaultRetryManager = new retry_manager_1.RetryManager();

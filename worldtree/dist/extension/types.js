"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionPoint = void 0;
var ExtensionPoint;
(function (ExtensionPoint) {
    ExtensionPoint["NODE_CREATE"] = "node:create";
    ExtensionPoint["NODE_DELETE"] = "node:delete";
    ExtensionPoint["NODE_UPDATE"] = "node:update";
    ExtensionPoint["AGENT_SPAWN"] = "agent:spawn";
    ExtensionPoint["AGENT_TERMINATE"] = "agent:terminate";
    ExtensionPoint["KNOWLEDGE_INSERT"] = "knowledge:insert";
    ExtensionPoint["KNOWLEDGE_QUERY"] = "knowledge:query";
    ExtensionPoint["PERM_CHECK"] = "perm:check";
    ExtensionPoint["RESOURCE_ALLOCATE"] = "resource:allocate";
    ExtensionPoint["RESOURCE_RELEASE"] = "resource:release";
})(ExtensionPoint || (exports.ExtensionPoint = ExtensionPoint = {}));

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiAgentScheduler = void 0;
const permission_1 = require("./permission");
const utils_1 = require("./utils");
class MultiAgentScheduler {
    constructor(config = {}) {
        this.roundRobinCounter = 0;
        this.config = {
            loadBalanceStrategy: 'least-load',
            autoRecycleThreshold: 300000,
            maxAgentInstances: 10,
            enforceSummaryLimit: 500,
            ...config
        };
        this.permissionController = new permission_1.PermissionController();
        this.startAutoRecycleJob();
    }
    selectAgentByStrategy(strategy, eligibleAgents) {
        if (eligibleAgents.length === 0)
            return null;
        switch (strategy) {
            case 'round-robin':
                const idx = this.roundRobinCounter % eligibleAgents.length;
                this.roundRobinCounter++;
                return eligibleAgents[idx];
            case 'least-load':
                return eligibleAgents.sort((a, b) => a.currentLoad - b.currentLoad)[0];
            case 'random':
                return eligibleAgents[Math.floor(Math.random() * eligibleAgents.length)];
            default:
                return eligibleAgents[0];
        }
    }
    async scheduleTask(task) {
        if (!this.permissionController.validateTaskCompliance(task))
            return null;
        const { agentManager } = await Promise.resolve().then(() => __importStar(require('@worldtree/core/agent-manager')));
        const allAgents = await agentManager.list();
        const eligibleAgents = allAgents.filter(agent => this.permissionController.validateAgentPermission(agent, task));
        const selectedAgent = this.selectAgentByStrategy(this.config.loadBalanceStrategy, eligibleAgents);
        if (!selectedAgent)
            return null;
        await utils_1.MemoryBase.writeTaskResult(task.taskId, { assignedAgent: selectedAgent.id, status: 'pending' });
        await agentManager.dispatch(selectedAgent.id, task);
        return selectedAgent.id;
    }
    startAutoRecycleJob() {
        setInterval(async () => {
            const { agentManager } = await Promise.resolve().then(() => __importStar(require('@worldtree/core/agent-manager')));
            const allAgents = await agentManager.list();
            const now = Date.now();
            for (const agent of allAgents) {
                if (agent.status === 'idle' && now - agent.lastActive > this.config.autoRecycleThreshold) {
                    await (0, utils_1.autoRecycleAgent)(agent.id);
                }
            }
        }, 60000);
    }
}
exports.MultiAgentScheduler = MultiAgentScheduler;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseGateway {
    constructor(name, config = {}) {
        this.name = name;
        this.config = config;
        this.isEnabled = config.enabled !== false;
    }
    isAvailable() {
        return this.isEnabled && this.healthCheck();
    }
    healthCheck() {
        return true;
    }
}
exports.default = BaseGateway;
//# sourceMappingURL=BaseGateway.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numericTransformer = void 0;
exports.numericTransformer = {
    to(value) {
        if (value === null || value === undefined) {
            return null;
        }
        return value;
    },
    from(value) {
        if (value === null || value === undefined) {
            return null;
        }
        return typeof value === 'number' ? value : Number(value);
    },
};
//# sourceMappingURL=numeric.transformer.js.map
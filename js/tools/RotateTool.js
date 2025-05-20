// js/tools/RotateTool.js
export class RotateTool {
    constructor(app) {
        this.app = app;
        this.name = 'Rotate';
    }

    activate() { }
    deactivate() { }
    applyEdit(params) {
        return true;
    }
}

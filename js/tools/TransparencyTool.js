// js/tools/TransparencyTool.js
export class TransparencyTool {
    constructor(app) {
        this.app = app;
        this.name = 'Transparency';
    }

    activate() { }
    deactivate() { }
    applyEdit(params) {
        return true;
    }
}

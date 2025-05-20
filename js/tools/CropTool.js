// js/tools/CropTool.js
export class CropTool {
    constructor(app) {
        this.app = app;
        this.name = 'Crop';
    }

    activate() { }
    deactivate() { }
    applyEdit(params) {
        return true;
    }
}

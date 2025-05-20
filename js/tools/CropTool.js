// js/tools/CropTool.js
export class CropTool {
  constructor(app) {
    this.app = app;
    this.name = 'Crop';
  }

  activate() {}
  deactivate() {}

  applyEdit({ x, y, width, height }) {
    const ctx = this.app.canvasManager.getContext();
    const cropped = ctx.getImageData(x, y, width, height);

    const canvas = this.app.canvas;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.putImageData(cropped, 0, 0);
    return true;
  }
}

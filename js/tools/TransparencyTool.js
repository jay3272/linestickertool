// js/tools/TransparencyTool.js
export class TransparencyTool {
  constructor(app) {
    this.app = app;
    this.name = 'Transparency';
  }

  activate() { }
  deactivate() { }

  applyEdit({ tolerance }) {
    const canvasManager = this.app.canvasManager;
    const canvas = canvasManager.canvas;
    const ctx = canvasManager.ctx;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r > 255 - tolerance && g > 255 - tolerance && b > 255 - tolerance) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }
}

// js/tools/TransparencyTool.js
export class TransparencyTool {
  constructor(app) {
    this.app = app;
    this.name = 'Transparency';
  }

  activate() {}
  deactivate() {}

  applyEdit({ threshold = 240 }) {
    const ctx = this.app.canvasManager.getContext();
    const imageData = ctx.getImageData(0, 0, this.app.canvas.width, this.app.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (r > threshold && g > threshold && b > threshold) {
        data[i + 3] = 0; // 變透明
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return true;
  }
}

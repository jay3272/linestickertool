// js/tools/BrightnessTool.js
export class BrightnessTool {
  constructor(app) {
    this.app = app;
    this.name = 'Brightness';
  }

  activate() {}
  deactivate() {}

  applyEdit({ brightness }) {
    const ctx = this.app.canvasManager.getContext();
    const imageData = ctx.getImageData(0, 0, this.app.canvas.width, this.app.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] + brightness);     // R
      data[i + 1] = Math.min(255, data[i + 1] + brightness); // G
      data[i + 2] = Math.min(255, data[i + 2] + brightness); // B
    }

    ctx.putImageData(imageData, 0, 0);
    return true;
  }
}

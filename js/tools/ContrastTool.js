// js/tools/ContrastTool.js
export class ContrastTool {
  constructor(app) {
    this.app = app;
    this.name = 'Contrast';
  }

  activate() {}
  deactivate() {}

  applyEdit({ contrast }) {
    const ctx = this.app.canvasManager.getContext();
    const imageData = ctx.getImageData(0, 0, this.app.canvas.width, this.app.canvas.height);
    const data = imageData.data;

    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
      data[i] = factor * (data[i] - 128) + 128;     // R
      data[i + 1] = factor * (data[i + 1] - 128) + 128; // G
      data[i + 2] = factor * (data[i + 2] - 128) + 128; // B
    }

    ctx.putImageData(imageData, 0, 0);
    return true;
  }
}

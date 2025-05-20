// js/tools/RotateTool.js
export class RotateTool {
  constructor(app) {
    this.app = app;
    this.name = 'Rotate';
  }

  activate() {}
  deactivate() {}

  applyEdit({ angle }) {
    const canvas = this.app.canvas;
    const ctx = this.app.canvasManager.getContext();

    const radians = angle * Math.PI / 180;
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;

    offscreen.width = width;
    offscreen.height = height;
    offCtx.drawImage(canvas, 0, 0);

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(radians);
    ctx.drawImage(offscreen, -width / 2, -height / 2);
    ctx.restore();

    return true;
  }
}

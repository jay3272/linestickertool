// js/tools/ResizeTool.js
export class ResizeTool {
  constructor(app) {
    this.app = app;
    this.name = 'Resize';
  }

  activate() { }
  deactivate() { }

  applyEdit({ width, height }) {
    const canvasManager = this.app.canvasManager;
    const canvas = canvasManager.canvas;
    const ctx = canvasManager.ctx;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;

    tempCtx.drawImage(canvas, 0, 0, width, height);

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(tempCanvas, 0, 0);

    // 更新內部工作畫布與圖像大小
    canvasManager.resizeImage(width, height);
    this.app.historyManager.saveState('調整大小');
  }
}

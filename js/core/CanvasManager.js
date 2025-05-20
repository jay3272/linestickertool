import { DomHelper } from '../utils/DomHelper.js';
import * as ImageHelper from '../utils/ImageHelper.js';
import { CANVAS_SIZE, STICKER_SIZES } from '../utils/Constants.js';

export class CanvasManager {
    constructor(editorApp) {
        this.editorApp = editorApp;
        this.canvas = null;
        this.ctx = null;
        this.workCanvas = null;
        this.workCtx = null;
        this.currentImage = null;
        this.imagePosition = { x: 0, y: 0 };
        this.imageScale = 1;
        this.imageRotation = 0;
        this.canvasBackgroundColor = '#ffffff';
        this.canvasSize = { ...CANVAS_SIZE };
        this.selectedStickerSize = STICKER_SIZES.STANDARD;
    }

    //#region 初始化與事件綁定
    initCanvas() {
        this.canvas = DomHelper.get('#mainCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = this.canvasSize.width;
        this.canvas.height = this.canvasSize.height;

        this.workCanvas = document.createElement('canvas');
        this.workCtx = this.workCanvas.getContext('2d');

        this.clearCanvas();
        this.setupCanvasEvents();
    }

    setupCanvasEvents() {
        let isDragging = false;
        let lastPosition = { x: 0, y: 0 };

        this.canvas.addEventListener('mousedown', (e) => {
            if (this.editorApp.state.currentMode === 'move' && this.currentImage) {
                isDragging = true;
                const rect = this.canvas.getBoundingClientRect();
                lastPosition = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const rect = this.canvas.getBoundingClientRect();
                const currentPosition = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
                const deltaX = currentPosition.x - lastPosition.x;
                const deltaY = currentPosition.y - lastPosition.y;

                this.imagePosition.x += deltaX;
                this.imagePosition.y += deltaY;
                lastPosition = currentPosition;
                this.redrawCanvas();
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.editorApp.historyManager.saveState('移動圖片');
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            isDragging = false;
        });
    }
    //#endregion

    //#region 畫面重繪與清除
    redrawCanvas() {
        this.clearCanvas();
        if (!this.currentImage) return;

        this.ctx.save();

        const centerX = this.imagePosition.x + (this.currentImage.width * this.imageScale) / 2;
        const centerY = this.imagePosition.y + (this.currentImage.height * this.imageScale) / 2;

        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.imageRotation * Math.PI / 180);
        this.ctx.translate(-centerX, -centerY);

        this.ctx.drawImage(
            this.workCanvas,
            this.imagePosition.x,
            this.imagePosition.y,
            this.currentImage.width * this.imageScale,
            this.currentImage.height * this.imageScale
        );

        this.ctx.restore();

        if (this.editorApp.state.currentTool === 'crop') {
            this.editorApp.tools.crop.drawCropOverlay();
        }
    }

    clearCanvas() {
        this.ctx.fillStyle = this.canvasBackgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    //#endregion

    //#region 圖片載入與位置重設
    loadImage(image) {
        this.currentImage = image;

        const scaleX = this.canvas.width / image.width;
        const scaleY = this.canvas.height / image.height;
        this.imageScale = Math.min(scaleX, scaleY, 1) * 0.9;

        this.imagePosition = {
            x: (this.canvas.width - image.width * this.imageScale) / 2,
            y: (this.canvas.height - image.height * this.imageScale) / 2
        };

        this.imageRotation = 0;

        this.workCanvas.width = image.width;
        this.workCanvas.height = image.height;
        this.workCtx.drawImage(image, 0, 0);

        this.redrawCanvas();
    }

    resetImagePosition() {
        const scaleX = this.canvas.width / this.currentImage.width;
        const scaleY = this.canvas.height / this.currentImage.height;
        this.imageScale = Math.min(scaleX, scaleY, 1) * 0.9;

        this.imagePosition = {
            x: (this.canvas.width - this.currentImage.width * this.imageScale) / 2,
            y: (this.canvas.height - this.currentImage.height * this.imageScale) / 2
        };
    }
    //#endregion

    //#region 圖片處理功能：裁切、縮放、旋轉
    resizeImage(width, height) {
        if (!this.currentImage) return false;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = width;
        tempCanvas.height = height;

        tempCtx.drawImage(this.workCanvas, 0, 0, width, height);

        this.workCanvas.width = width;
        this.workCanvas.height = height;
        this.workCtx.drawImage(tempCanvas, 0, 0);

        this.currentImage.width = width;
        this.currentImage.height = height;

        this.resetImagePosition();
        this.redrawCanvas();
        return true;
    }

    cropImage(x, y, width, height) {
        if (!this.currentImage) return false;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = width;
        tempCanvas.height = height;

        tempCtx.drawImage(this.workCanvas, x, y, width, height, 0, 0, width, height);

        this.workCanvas.width = width;
        this.workCanvas.height = height;
        this.workCtx.drawImage(tempCanvas, 0, 0);

        this.currentImage.width = width;
        this.currentImage.height = height;

        this.resetImagePosition();
        this.redrawCanvas();
        return true;
    }

    rotateImage(angle) {
        if (!this.currentImage) return false;

        this.imageRotation = (this.imageRotation + angle) % 360;

        if (angle % 180 === 90) {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = this.workCanvas.height;
            tempCanvas.height = this.workCanvas.width;

            tempCtx.save();
            tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
            tempCtx.rotate(angle * Math.PI / 180);
            tempCtx.drawImage(this.workCanvas, -this.workCanvas.width / 2, -this.workCanvas.height / 2);
            tempCtx.restore();

            this.workCanvas.width = tempCanvas.width;
            this.workCanvas.height = tempCanvas.height;
            this.workCtx.drawImage(tempCanvas, 0, 0);

            this.currentImage.width = tempCanvas.width;
            this.currentImage.height = tempCanvas.height;

            this.imageRotation = 0;
            this.resetImagePosition();
        }

        this.redrawCanvas();
        return true;
    }
    //#endregion

    //#region 顏色處理功能：亮度、對比、去背
    adjustBrightness(value) {
        if (!this.currentImage) return false;
        ImageHelper.adjustBrightness(this.workCanvas, this.workCtx, value);
        this.redrawCanvas();
        return true;
    }

    adjustContrast(value) {
        if (!this.currentImage) return false;
        ImageHelper.adjustContrast(this.workCanvas, this.workCtx, value);
        this.redrawCanvas();
        return true;
    }

    makeTransparent(tolerance) {
        if (!this.currentImage) return false;
        ImageHelper.makeBackgroundTransparent(this.workCanvas, this.workCtx, tolerance);
        this.canvasBackgroundColor = 'transparent';
        this.redrawCanvas();
        return true;
    }
    //#endregion

    //#region 匯出與尺寸設定
    setStickerSize(sizeType) {
        this.selectedStickerSize = STICKER_SIZES[sizeType];
        this.redrawCanvas();
    }

    exportCanvas() {
        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');

        exportCanvas.width = this.selectedStickerSize.width;
        exportCanvas.height = this.selectedStickerSize.height;

        if (this.canvasBackgroundColor === 'transparent') {
            exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
        } else {
            exportCtx.fillStyle = this.canvasBackgroundColor;
            exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        }

        const scaleX = exportCanvas.width / this.currentImage.width;
        const scaleY = exportCanvas.height / this.currentImage.height;
        const scale = Math.min(scaleX, scaleY, 1);

        const x = (exportCanvas.width - this.currentImage.width * scale) / 2;
        const y = (exportCanvas.height - this.currentImage.height * scale) / 2;

        exportCtx.drawImage(
            this.workCanvas,
            x, y,
            this.currentImage.width * scale,
            this.currentImage.height * scale
        );

        return exportCanvas.toDataURL('image/png');
    }
    //#endregion

    //#region 狀態保存與還原
    getCanvasData() {
        return {
            imageData: this.workCanvas.toDataURL(),
            position: { ...this.imagePosition },
            scale: this.imageScale,
            rotation: this.imageRotation,
            dimensions: {
                width: this.currentImage ? this.currentImage.width : 0,
                height: this.currentImage ? this.currentImage.height : 0
            },
            backgroundColor: this.canvasBackgroundColor
        };
    }

    restoreCanvasData(state) {
        if (!state) return;

        this.canvasBackgroundColor = state.backgroundColor;

        if (state.imageData) {
            const img = new Image();
            img.onload = () => {
                this.workCanvas.width = state.dimensions.width;
                this.workCanvas.height = state.dimensions.height;
                this.workCtx.drawImage(img, 0, 0);

                if (!this.currentImage) {
                    this.currentImage = new Image();
                }
                this.currentImage.width = state.dimensions.width;
                this.currentImage.height = state.dimensions.height;

                this.imagePosition = { ...state.position };
                this.imageScale = state.scale;
                this.imageRotation = state.rotation;

                this.redrawCanvas();
            };
            img.src = state.imageData;
        } else {
            this.currentImage = null;
            this.clearCanvas();
        }
    }
    //#endregion

    getCurrentDimensions() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }

    getImageData() {
        if (!this.workCanvas || this.workCanvas.width === 0 || this.workCanvas.height === 0) {
            console.warn("無效的畫布尺寸，無法取得 ImageData");
            return null;
        }
        return this.workCtx.getImageData(0, 0, this.workCanvas.width, this.workCanvas.height);
    }

}

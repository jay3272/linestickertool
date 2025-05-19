// CanvasManager.js
import { DomHelper } from '../utils/DomHelper.js';
import { ImageHelper } from '../utils/ImageHelper.js';
import { CANVAS_SIZE, LINE_STICKER_SIZES } from '../utils/Constants.js';

export class CanvasManager {
    constructor(editorApp) {
        this.editorApp = editorApp;
        this.canvas = null;
        this.ctx = null;
        this.workCanvas = null; // 用於處理圖像的離屏畫布
        this.workCtx = null;
        this.currentImage = null;
        this.imagePosition = { x: 0, y: 0 };
        this.imageScale = 1;
        this.imageRotation = 0;
        this.canvasBackgroundColor = '#ffffff';
        this.canvasSize = { ...CANVAS_SIZE };
        this.selectedStickerSize = LINE_STICKER_SIZES.STANDARD;
    }

    initCanvas() {
        // 獲取主畫布和上下文
        this.canvas = document.getElementById('mainCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 設置畫布大小
        this.canvas.width = this.canvasSize.width;
        this.canvas.height = this.canvasSize.height;

        // 創建工作畫布(離屏畫布)
        this.workCanvas = document.createElement('canvas');
        this.workCtx = this.workCanvas.getContext('2d');

        // 初始化畫布 - 清空並填充背景色
        this.clearCanvas();

        // 設置事件處理
        this.setupCanvasEvents();
    }

    setupCanvasEvents() {
        // 當需要直接在畫布上互動時使用
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

                // 計算移動距離
                const deltaX = currentPosition.x - lastPosition.x;
                const deltaY = currentPosition.y - lastPosition.y;

                // 更新圖像位置
                this.imagePosition.x += deltaX;
                this.imagePosition.y += deltaY;

                // 更新最後位置
                lastPosition = currentPosition;

                // 重繪畫布
                this.redrawCanvas();
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                // 如果有移動圖像，保存歷史狀態
                this.editorApp.historyManager.saveState('移動圖像');
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            isDragging = false;
        });
    }

    loadImage(image) {
        this.currentImage = image;

        // 計算適當的縮放比例以符合畫布
        const scaleX = this.canvas.width / image.width;
        const scaleY = this.canvas.height / image.height;
        this.imageScale = Math.min(scaleX, scaleY, 1) * 0.9; // 確保圖像不超出畫布，留一些邊距

        // 置中圖像
        this.imagePosition = {
            x: (this.canvas.width - image.width * this.imageScale) / 2,
            y: (this.canvas.height - image.height * this.imageScale) / 2
        };

        // 重置旋轉
        this.imageRotation = 0;

        // 更新工作畫布大小
        this.workCanvas.width = image.width;
        this.workCanvas.height = image.height;
        this.workCtx.drawImage(image, 0, 0);

        // 繪製到主畫布
        this.redrawCanvas();
    }

    redrawCanvas() {
        // 清空畫布
        this.clearCanvas();

        if (!this.currentImage) return;

        // 保存當前轉換狀態
        this.ctx.save();

        // 設置畫布中心點為旋轉中心
        const centerX = this.imagePosition.x + (this.currentImage.width * this.imageScale) / 2;
        const centerY = this.imagePosition.y + (this.currentImage.height * this.imageScale) / 2;

        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.imageRotation * Math.PI / 180);
        this.ctx.translate(-centerX, -centerY);

        // 繪製圖像
        this.ctx.drawImage(
            this.workCanvas,
            this.imagePosition.x,
            this.imagePosition.y,
            this.currentImage.width * this.imageScale,
            this.currentImage.height * this.imageScale
        );

        // 恢復變換
        this.ctx.restore();

        // 根據當前工具繪製額外的元素（如裁剪框）
        if (this.editorApp.state.currentTool === 'crop') {
            this.editorApp.tools.crop.drawCropOverlay();
        }
    }

    clearCanvas() {
        // 清空畫布並填充背景色
        this.ctx.fillStyle = this.canvasBackgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 用於調整大小
    resizeImage(width, height) {
        if (!this.currentImage) return false;

        // 創建臨時畫布進行調整大小
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = width;
        tempCanvas.height = height;

        // 在臨時畫布上繪製縮放後的圖像
        tempCtx.drawImage(this.workCanvas, 0, 0, width, height);

        // 更新工作畫布
        this.workCanvas.width = width;
        this.workCanvas.height = height;
        this.workCtx.drawImage(tempCanvas, 0, 0);

        // 更新當前圖像尺寸
        this.currentImage.width = width;
        this.currentImage.height = height;

        // 重新計算縮放和位置
        this.resetImagePosition();

        // 重繪主畫布
        this.redrawCanvas();
        return true;
    }

    // 用於裁剪
    cropImage(x, y, width, height) {
        if (!this.currentImage) return false;

        // 創建臨時畫布以存儲裁剪區域
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = width;
        tempCanvas.height = height;

        // 將選定區域繪製到臨時畫布
        tempCtx.drawImage(
            this.workCanvas,
            x, y, width, height,
            0, 0, width, height
        );

        // 更新工作畫布
        this.workCanvas.width = width;
        this.workCanvas.height = height;
        this.workCtx.drawImage(tempCanvas, 0, 0);

        // 更新當前圖像尺寸
        this.currentImage.width = width;
        this.currentImage.height = height;

        // 重新計算縮放和位置
        this.resetImagePosition();

        // 重繪主畫布
        this.redrawCanvas();
        return true;
    }

    // 旋轉圖像
    rotateImage(angle) {
        if (!this.currentImage) return false;

        // 更新旋轉角度
        this.imageRotation = (this.imageRotation + angle) % 360;

        // 如果旋轉90/270度，交換工作畫布的寬高
        if (angle % 180 === 90) {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = this.workCanvas.height;
            tempCanvas.height = this.workCanvas.width;

            tempCtx.save();
            tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
            tempCtx.rotate(angle * Math.PI / 180);
            tempCtx.drawImage(
                this.workCanvas,
                -this.workCanvas.width / 2,
                -this.workCanvas.height / 2
            );
            tempCtx.restore();

            // 更新工作畫布
            this.workCanvas.width = tempCanvas.width;
            this.workCanvas.height = tempCanvas.height;
            this.workCtx.drawImage(tempCanvas, 0, 0);

            // 更新當前圖像尺寸
            this.currentImage.width = tempCanvas.width;
            this.currentImage.height = tempCanvas.height;

            // 重置旋轉角度（因為我們已經實際旋轉了圖像）
            this.imageRotation = 0;

            // 重新計算縮放和位置
            this.resetImagePosition();
        }

        // 重繪主畫布
        this.redrawCanvas();
        return true;
    }

    // 調整亮度
    adjustBrightness(value) {
        if (!this.currentImage) return false;

        // 使用 ImageHelper 處理亮度調整
        ImageHelper.adjustBrightness(this.workCanvas, this.workCtx, value);

        // 重繪主畫布
        this.redrawCanvas();
        return true;
    }

    // 調整對比度
    adjustContrast(value) {
        if (!this.currentImage) return false;

        // 使用 ImageHelper 處理對比度調整
        ImageHelper.adjustContrast(this.workCanvas, this.workCtx, value);

        // 重繪主畫布
        this.redrawCanvas();
        return true;
    }

    // 處理背景透明度
    makeTransparent(tolerance) {
        if (!this.currentImage) return false;

        // 使用 ImageHelper 處理透明背景
        ImageHelper.makeBackgroundTransparent(this.workCanvas, this.workCtx, tolerance);

        // 更新畫布背景以便顯示透明度
        this.canvasBackgroundColor = 'transparent';

        // 重繪主畫布
        this.redrawCanvas();
        return true;
    }

    // 重置圖像位置（通常在圖像變換後呼叫）
    resetImagePosition() {
        const scaleX = this.canvas.width / this.currentImage.width;
        const scaleY = this.canvas.height / this.currentImage.height;
        this.imageScale = Math.min(scaleX, scaleY, 1) * 0.9;

        this.imagePosition = {
            x: (this.canvas.width - this.currentImage.width * this.imageScale) / 2,
            y: (this.canvas.height - this.currentImage.height * this.imageScale) / 2
        };
    }

    // 設置貼圖尺寸類型
    setStickerSize(sizeType) {
        this.selectedStickerSize = LINE_STICKER_SIZES[sizeType];
        // 可以在這裡添加畫布指南或其他視覺提示
        this.redrawCanvas();
    }

    // 匯出畫布
    exportCanvas() {
        // 創建匯出畫布，大小基於選擇的貼圖尺寸
        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');

        // 設置匯出尺寸
        exportCanvas.width = this.selectedStickerSize.width;
        exportCanvas.height = this.selectedStickerSize.height;

        // 如果背景是透明的，需要確保匯出圖像也是透明的
        if (this.canvasBackgroundColor === 'transparent') {
            exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
        } else {
            exportCtx.fillStyle = this.canvasBackgroundColor;
            exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        }

        // 計算縮放比例以符合匯出尺寸
        const scaleX = exportCanvas.width / this.currentImage.width;
        const scaleY = exportCanvas.height / this.currentImage.height;
        const scale = Math.min(scaleX, scaleY, 1);

        // 計算縮放後圖像在匯出畫布上的位置
        const x = (exportCanvas.width - this.currentImage.width * scale) / 2;
        const y = (exportCanvas.height - this.currentImage.height * scale) / 2;

        // 繪製圖像到匯出畫布
        exportCtx.drawImage(
            this.workCanvas,
            x, y,
            this.currentImage.width * scale,
            this.currentImage.height * scale
        );

        // 返回圖像資料URL
        return exportCanvas.toDataURL('image/png');
    }

    // 取得畫布狀態（用於歷史記錄）
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

    // 恢復畫布狀態（用於歷史記錄）
    restoreCanvasData(state) {
        if (!state) return;

        // 恢復背景色
        this.canvasBackgroundColor = state.backgroundColor;

        // 恢復圖像
        if (state.imageData) {
            const img = new Image();
            img.onload = () => {
                // 恢復工作畫布
                this.workCanvas.width = state.dimensions.width;
                this.workCanvas.height = state.dimensions.height;
                this.workCtx.drawImage(img, 0, 0);

                // 更新圖像資訊
                if (!this.currentImage) {
                    this.currentImage = new Image();
                }
                this.currentImage.width = state.dimensions.width;
                this.currentImage.height = state.dimensions.height;

                // 恢復位置、縮放、旋轉
                this.imagePosition = { ...state.position };
                this.imageScale = state.scale;
                this.imageRotation = state.rotation;

                // 重繪畫布
                this.redrawCanvas();
            };
            img.src = state.imageData;
        } else {
            // 如果沒有圖像數據，清空畫布
            this.currentImage = null;
            this.clearCanvas();
        }
    }
}
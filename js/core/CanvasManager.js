// CanvasManager.js
import { DomHelper } from '../utils/DomHelper.js';
import * as ImageHelper from '../utils/ImageHelper.js';
import { CANVAS_SIZE, STICKER_SIZES } from '../utils/Constants.js';

export class CanvasManager {
    constructor(editorApp) {
        this.editorApp = editorApp;
        this.canvas = null;
        this.ctx = null;
        this.workCanvas = null; // �Ω�B�z�Ϲ������̵e��
        this.workCtx = null;
        this.currentImage = null;
        this.imagePosition = { x: 0, y: 0 };
        this.imageScale = 1;
        this.imageRotation = 0;
        this.canvasBackgroundColor = '#ffffff';
        this.canvasSize = { ...CANVAS_SIZE };
        this.selectedStickerSize = STICKER_SIZES.STANDARD;
    }

    initCanvas() {
        // ����D�e���M�W�U��
        this.canvas = DomHelper.get('#mainCanvas');
        this.ctx = this.canvas.getContext('2d');

        // �]�m�e���j�p
        this.canvas.width = this.canvasSize.width;
        this.canvas.height = this.canvasSize.height;

        console.log('��l�ƥD�e��:', this.canvas.width, this.canvas.height);

        // �Ыؤu�@�e��(���̵e��)
        this.workCanvas = document.createElement('canvas');
        this.workCtx = this.workCanvas.getContext('2d');

        // ��l�Ƶe�� - �M�Ũö�R�I����
        this.clearCanvas();

        // �]�m�ƥ�B�z
        this.setupCanvasEvents();
    }

    setupCanvasEvents() {
        // ���ݭn�����b�e���W���ʮɨϥ�
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

                // �p�Ⲿ�ʶZ��
                const deltaX = currentPosition.x - lastPosition.x;
                const deltaY = currentPosition.y - lastPosition.y;

                // ��s�Ϲ���m
                this.imagePosition.x += deltaX;
                this.imagePosition.y += deltaY;

                // ��s�̫��m
                lastPosition = currentPosition;

                // ��ø�e��
                this.redrawCanvas();
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                // �p�G�����ʹϹ��A�O�s���v���A
                this.editorApp.historyManager.saveState('���ʹϹ�');
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            isDragging = false;
        });
    }

    loadImage(image) {
        console.log('CanvasManager �}�l���J�Ϥ�', image.width, image.height);

        this.currentImage = image;

        // �p��A�����Y���ҥH�ŦX�e��
        const scaleX = this.canvas.width / image.width;
        const scaleY = this.canvas.height / image.height;
        this.imageScale = Math.min(scaleX, scaleY, 1) * 0.9; // �T�O�Ϲ����W�X�e���A�d�@����Z

        // �m���Ϲ�
        this.imagePosition = {
            x: (this.canvas.width - image.width * this.imageScale) / 2,
            y: (this.canvas.height - image.height * this.imageScale) / 2
        };

        // ���m����
        this.imageRotation = 0;

        // ��s�u�@�e���j�p
        this.workCanvas.width = image.width;
        this.workCanvas.height = image.height;
        this.workCtx.drawImage(image, 0, 0);

        // ø�s��D�e��
        this.redrawCanvas();
    }

    redrawCanvas() {
        console.log('�}�l��ø�e��');
        // �M�ŵe��
        this.clearCanvas();

        if (!this.currentImage) {
            console.warn('�L�Ϥ��i��ø');
            return;
        }

        console.log('��ø��m�P��ҡG', this.imagePosition, this.imageScale);
        // �O�s���e�ഫ���A
        this.ctx.save();

        // �]�m�e�������I�����त��
        const centerX = this.imagePosition.x + (this.currentImage.width * this.imageScale) / 2;
        const centerY = this.imagePosition.y + (this.currentImage.height * this.imageScale) / 2;

        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.imageRotation * Math.PI / 180);
        this.ctx.translate(-centerX, -centerY);

        // ø�s�Ϲ�
        this.ctx.drawImage(
            this.workCanvas,
            this.imagePosition.x,
            this.imagePosition.y,
            this.currentImage.width * this.imageScale,
            this.currentImage.height * this.imageScale
        );

        console.log('�Ϥ��wø�s��e��');
        // ��_�ܴ�
        this.ctx.restore();

        // �ھڷ��e�u��ø�s�B�~�������]�p���Ůء^
        if (this.editorApp.state.currentTool === 'crop') {
            this.editorApp.tools.crop.drawCropOverlay();
        }
    }

    clearCanvas() {
        console.log('�M�ŵe���I��:', this.canvasBackgroundColor);
        // �M�ŵe���ö�R�I����
        this.ctx.fillStyle = this.canvasBackgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // �Ω�վ�j�p
    resizeImage(width, height) {
        if (!this.currentImage) return false;

        // �Ы��{�ɵe���i��վ�j�p
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = width;
        tempCanvas.height = height;

        // �b�{�ɵe���Wø�s�Y��᪺�Ϲ�
        tempCtx.drawImage(this.workCanvas, 0, 0, width, height);

        // ��s�u�@�e��
        this.workCanvas.width = width;
        this.workCanvas.height = height;
        this.workCtx.drawImage(tempCanvas, 0, 0);

        // ��s���e�Ϲ��ؤo
        this.currentImage.width = width;
        this.currentImage.height = height;

        // ���s�p���Y��M��m
        this.resetImagePosition();

        // ��ø�D�e��
        this.redrawCanvas();
        return true;
    }

    // �Ω����
    cropImage(x, y, width, height) {
        if (!this.currentImage) return false;

        // �Ы��{�ɵe���H�s�x���Űϰ�
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = width;
        tempCanvas.height = height;

        // �N��w�ϰ�ø�s���{�ɵe��
        tempCtx.drawImage(
            this.workCanvas,
            x, y, width, height,
            0, 0, width, height
        );

        // ��s�u�@�e��
        this.workCanvas.width = width;
        this.workCanvas.height = height;
        this.workCtx.drawImage(tempCanvas, 0, 0);

        // ��s���e�Ϲ��ؤo
        this.currentImage.width = width;
        this.currentImage.height = height;

        // ���s�p���Y��M��m
        this.resetImagePosition();

        // ��ø�D�e��
        this.redrawCanvas();
        return true;
    }

    // ����Ϲ�
    rotateImage(angle) {
        if (!this.currentImage) return false;

        // ��s���ਤ��
        this.imageRotation = (this.imageRotation + angle) % 360;

        // �p�G����90/270�סA�洫�u�@�e�����e��
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

            // ��s�u�@�e��
            this.workCanvas.width = tempCanvas.width;
            this.workCanvas.height = tempCanvas.height;
            this.workCtx.drawImage(tempCanvas, 0, 0);

            // ��s���e�Ϲ��ؤo
            this.currentImage.width = tempCanvas.width;
            this.currentImage.height = tempCanvas.height;

            // ���m���ਤ�ס]�]���ڭ̤w�g��ڱ���F�Ϲ��^
            this.imageRotation = 0;

            // ���s�p���Y��M��m
            this.resetImagePosition();
        }

        // ��ø�D�e��
        this.redrawCanvas();
        return true;
    }

    // �վ�G��
    adjustBrightness(value) {
        if (!this.currentImage) return false;

        // �ϥ� ImageHelper �B�z�G�׽վ�
        ImageHelper.adjustBrightness(this.workCanvas, this.workCtx, value);

        // ��ø�D�e��
        this.redrawCanvas();
        return true;
    }

    // �վ����
    adjustContrast(value) {
        if (!this.currentImage) return false;

        // �ϥ� ImageHelper �B�z���׽վ�
        ImageHelper.adjustContrast(this.workCanvas, this.workCtx, value);

        // ��ø�D�e��
        this.redrawCanvas();
        return true;
    }

    // �B�z�I���z����
    makeTransparent(tolerance) {
        if (!this.currentImage) return false;

        // �ϥ� ImageHelper �B�z�z���I��
        ImageHelper.makeBackgroundTransparent(this.workCanvas, this.workCtx, tolerance);

        // ��s�e���I���H�K��ܳz����
        this.canvasBackgroundColor = 'transparent';

        // ��ø�D�e��
        this.redrawCanvas();
        return true;
    }

    // ���m�Ϲ���m�]�q�`�b�Ϲ��ܴ���I�s�^
    resetImagePosition() {
        const scaleX = this.canvas.width / this.currentImage.width;
        const scaleY = this.canvas.height / this.currentImage.height;
        this.imageScale = Math.min(scaleX, scaleY, 1) * 0.9;

        this.imagePosition = {
            x: (this.canvas.width - this.currentImage.width * this.imageScale) / 2,
            y: (this.canvas.height - this.currentImage.height * this.imageScale) / 2
        };
    }

    // �]�m�K�Ϥؤo����
    setStickerSize(sizeType) {
        this.selectedStickerSize = LINE_STICKER_SIZES[sizeType];
        // �i�H�b�o�̲K�[�e�����n�Ψ�L��ı����
        this.redrawCanvas();
    }

    // �ץX�e��
    exportCanvas() {
        // �ЫضץX�e���A�j�p����ܪ��K�Ϥؤo
        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');

        // �]�m�ץX�ؤo
        exportCanvas.width = this.selectedStickerSize.width;
        exportCanvas.height = this.selectedStickerSize.height;

        // �p�G�I���O�z�����A�ݭn�T�O�ץX�Ϲ��]�O�z����
        if (this.canvasBackgroundColor === 'transparent') {
            exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
        } else {
            exportCtx.fillStyle = this.canvasBackgroundColor;
            exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        }

        // �p���Y���ҥH�ŦX�ץX�ؤo
        const scaleX = exportCanvas.width / this.currentImage.width;
        const scaleY = exportCanvas.height / this.currentImage.height;
        const scale = Math.min(scaleX, scaleY, 1);

        // �p���Y���Ϲ��b�ץX�e���W����m
        const x = (exportCanvas.width - this.currentImage.width * scale) / 2;
        const y = (exportCanvas.height - this.currentImage.height * scale) / 2;

        // ø�s�Ϲ���ץX�e��
        exportCtx.drawImage(
            this.workCanvas,
            x, y,
            this.currentImage.width * scale,
            this.currentImage.height * scale
        );

        // ��^�Ϲ����URL
        return exportCanvas.toDataURL('image/png');
    }

    // ���o�e�����A�]�Ω���v�O���^
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

    // ��_�e�����A�]�Ω���v�O���^
    restoreCanvasData(state) {
        if (!state) return;

        // ��_�I����
        this.canvasBackgroundColor = state.backgroundColor;

        // ��_�Ϲ�
        if (state.imageData) {
            const img = new Image();
            img.onload = () => {
                // ��_�u�@�e��
                this.workCanvas.width = state.dimensions.width;
                this.workCanvas.height = state.dimensions.height;
                this.workCtx.drawImage(img, 0, 0);

                // ��s�Ϲ���T
                if (!this.currentImage) {
                    this.currentImage = new Image();
                }
                this.currentImage.width = state.dimensions.width;
                this.currentImage.height = state.dimensions.height;

                // ��_��m�B�Y��B����
                this.imagePosition = { ...state.position };
                this.imageScale = state.scale;
                this.imageRotation = state.rotation;

                // ��ø�e��
                this.redrawCanvas();
            };
            img.src = state.imageData;
        } else {
            // �p�G�S���Ϲ��ƾڡA�M�ŵe��
            this.currentImage = null;
            this.clearCanvas();
        }
    }
}
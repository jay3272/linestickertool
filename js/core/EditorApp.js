// EditorApp.js - 編輯器主控制類

// #region 匯入模組
import { CanvasManager } from './CanvasManager.js';
import { HistoryManager } from './HistoryManager.js';
import UIManager from './UIManager.js';
import { EDITOR_MODES, DEFAULT_SETTINGS } from '../utils/Constants.js';

import { ResizeTool } from '../tools/ResizeTool.js';
import { CropTool } from '../tools/CropTool.js';
import { RotateTool } from '../tools/RotateTool.js';
import { BrightnessTool } from '../tools/BrightnessTool.js';
import { ContrastTool } from '../tools/ContrastTool.js';
import { TransparencyTool } from '../tools/TransparencyTool.js';
// #endregion

export class EditorApp {
    constructor() {
        // #region 初始化核心管理器
        this.canvasManager = new CanvasManager(this);
        this.historyManager = new HistoryManager(this);
        this.uiManager = new UIManager(this);
        // #endregion

        // #region 初始化工具集合
        this.tools = {
            resize: new ResizeTool(this),
            crop: new CropTool(this),
            rotate: new RotateTool(this),
            brightness: new BrightnessTool(this),
            contrast: new ContrastTool(this),
            transparency: new TransparencyTool(this)
        };
        // #endregion

        // #region 初始狀態
        this.state = {
            currentMode: EDITOR_MODES.IDLE,
            currentTool: null,
            hasImage: false,
            originalImage: null,
            isProcessing: false,
            settings: { ...DEFAULT_SETTINGS }
        };
        // #endregion

        // #region 啟動初始化流程
        this.init();
        // #endregion
    }

    // #region 初始化程序
    init() {
        this.uiManager.setupUI();
        this.setupEventListeners();
        this.canvasManager.initCanvas();
        console.log('LINE貼圖編輯器已初始化完成');
    }
    // #endregion

    // #region 設定 DOM 事件綁定
    setupEventListeners() {
        document.getElementById('imageUpload')
            .addEventListener('change', this.handleImageUpload.bind(this));

        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const toolName = e.currentTarget.dataset.tool;
                this.selectTool(toolName);
            });
        });

        document.getElementById('exportBtn')
            .addEventListener('click', this.exportSticker.bind(this));

        document.getElementById('undoBtn')
            .addEventListener('click', () => this.historyManager.undo());

        document.getElementById('redoBtn')
            .addEventListener('click', () => this.historyManager.redo());
    }
    // #endregion

    // #region 圖片上傳處理
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.state.originalImage = img;
                this.state.hasImage = true;
                this.canvasManager.loadImage(img);
                this.historyManager.saveState('圖片上傳');
                this.uiManager.updateUI();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    async loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.state.originalImage = img;
                    this.state.hasImage = true;
                    this.canvasManager.loadImage(img);
                    this.historyManager.saveState('載入圖片');
                    this.uiManager.updateHistoryButtons();
                    resolve();
                };
                img.onerror = () => reject(new Error('圖片載入失敗'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('檔案讀取失敗'));
            reader.readAsDataURL(file);
        });
    }
    // #endregion

    // #region 工具選擇與應用
    selectTool(toolName) {
        if (this.state.currentTool) {
            this.tools[this.state.currentTool].deactivate();
        }

        this.state.currentTool = toolName;
        this.state.currentMode = EDITOR_MODES.EDITING;
        this.tools[toolName].activate();

        this.uiManager.updateToolUI(toolName);
    }

    clearActiveTool() {
        this.state.currentTool = null;
    }

    applyEdit(editType, params) {
        if (!this.state.hasImage) return;

        this.state.isProcessing = true;
        this.uiManager.showProcessingIndicator();

        setTimeout(() => {
            const result = this.tools[editType].applyEdit(params);

            if (result) {
                this.historyManager.saveState(`套用 ${this.tools[editType].name}`);
                this.uiManager.updateUI();
            }

            this.state.isProcessing = false;
            this.uiManager.hideProcessingIndicator();
        }, 50);
    }
    // #endregion

    // #region 匯出貼圖
    exportSticker() {
        if (!this.state.hasImage) return;

        const dataURL = this.canvasManager.exportCanvas();

        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'line-sticker.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    // #endregion

    // #region 提供給 History 使用的狀態操作
    getCanvasState() {
        return this.canvasManager.getCanvasData();
    }

    restoreCanvasState(state) {
        this.canvasManager.restoreCanvasData(state);
        this.uiManager.updateUI();
    }
    // #endregion


    setActiveTool(toolName) {
        this.selectTool(toolName);
    }


    resizeImage(width, height) {
        return new Promise((resolve, reject) => {
            try {
                this.tools.resize.applyEdit({ width, height });
                const imageData = this.canvasManager.getImageData?.();
                this.historyManager.saveState(imageData || '調整大小');
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }
}

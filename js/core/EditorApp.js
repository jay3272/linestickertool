// EditorApp.js
import { CanvasManager } from './CanvasManager.js';
import { HistoryManager } from './HistoryManager.js';
import { UIManager } from './UIManager.js';
import { EDITOR_MODES, DEFAULT_SETTINGS } from '../utils/Constants.js';
import { ResizeTool } from '../tools/ResizeTool.js';
import { CropTool } from '../tools/CropTool.js';
import { RotateTool } from '../tools/RotateTool.js';
import { BrightnessTool } from '../tools/BrightnessTool.js';
import { ContrastTool } from '../tools/ContrastTool.js';
import { TransparencyTool } from '../tools/TransparencyTool.js';

export class EditorApp {
    constructor() {
        // 初始化主要管理器
        this.canvasManager = new CanvasManager(this);
        this.historyManager = new HistoryManager(this);
        this.uiManager = new UIManager(this);

        // 初始化工具集
        this.tools = {
            resize: new ResizeTool(this),
            crop: new CropTool(this),
            rotate: new RotateTool(this),
            brightness: new BrightnessTool(this),
            contrast: new ContrastTool(this),
            transparency: new TransparencyTool(this)
        };

        // 編輯器狀態
        this.state = {
            currentMode: EDITOR_MODES.IDLE,
            currentTool: null,
            hasImage: false,
            originalImage: null,
            isProcessing: false,
            settings: { ...DEFAULT_SETTINGS }
        };

        // 初始化應用
        this.init();
    }

    init() {
        // 設置初始UI
        this.uiManager.setupUI();

        // 設置事件監聽器
        this.setupEventListeners();

        // 初始化畫布
        this.canvasManager.initCanvas();

        console.log('LINE貼圖編輯器已初始化');
    }

    setupEventListeners() {
        // 圖片上傳處理
        document.getElementById('imageUpload').addEventListener('change', this.handleImageUpload.bind(this));

        // 工具選擇處理
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const toolName = e.currentTarget.dataset.tool;
                this.selectTool(toolName);
            });
        });

        // 匯出按鈕處理
        document.getElementById('exportBtn').addEventListener('click', this.exportSticker.bind(this));

        // 撤銷/重做按鈕處理
        document.getElementById('undoBtn').addEventListener('click', () => this.historyManager.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.historyManager.redo());
    }

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

    selectTool(toolName) {
        // 停用當前工具
        if (this.state.currentTool) {
            this.tools[this.state.currentTool].deactivate();
        }

        // 啟用選擇的工具
        this.state.currentTool = toolName;
        this.state.currentMode = EDITOR_MODES.EDITING;
        this.tools[toolName].activate();

        // 更新UI以反映選擇的工具
        this.uiManager.updateToolUI(toolName);
    }

    applyEdit(editType, params) {
        if (!this.state.hasImage) return;

        this.state.isProcessing = true;
        this.uiManager.showProcessingIndicator();

        // 使用setTimeout來確保UI有機會更新
        setTimeout(() => {
            // 調用相應工具的編輯函數
            const result = this.tools[editType].applyEdit(params);

            if (result) {
                // 保存歷史狀態
                this.historyManager.saveState(`套用${this.tools[editType].name}`);

                // 更新UI
                this.uiManager.updateUI();
            }

            this.state.isProcessing = false;
            this.uiManager.hideProcessingIndicator();
        }, 50);
    }

    exportSticker() {
        if (!this.state.hasImage) return;

        // 獲取處理後的圖片
        const dataURL = this.canvasManager.exportCanvas();

        // 創建下載連結
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'line-sticker.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 提供給HistoryManager使用的狀態管理方法
    getCanvasState() {
        return this.canvasManager.getCanvasData();
    }

    restoreCanvasState(state) {
        this.canvasManager.restoreCanvasData(state);
        this.uiManager.updateUI();
    }
}
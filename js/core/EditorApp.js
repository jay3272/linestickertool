// EditorApp.js
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

export class EditorApp {
    constructor() {
        // ��l�ƥD�n�޲z��
        this.canvasManager = new CanvasManager(this);
        this.historyManager = new HistoryManager(this);
        this.uiManager = new UIManager(this);

        // ��l�Ƥu�㶰
        this.tools = {
            resize: new ResizeTool(this),
            crop: new CropTool(this),
            rotate: new RotateTool(this),
            brightness: new BrightnessTool(this),
            contrast: new ContrastTool(this),
            transparency: new TransparencyTool(this)
        };

        // �s�边���A
        this.state = {
            currentMode: EDITOR_MODES.IDLE,
            currentTool: null,
            hasImage: false,
            originalImage: null,
            isProcessing: false,
            settings: { ...DEFAULT_SETTINGS }
        };

        // ��l������
        this.init();
    }

    init() {
        // �]�m��lUI
        this.uiManager.setupUI();

        // �]�m�ƥ��ť��
        this.setupEventListeners();

        // ��l�Ƶe��
        this.canvasManager.initCanvas();

        console.log('LINE�K�Ͻs�边�w��l��');
    }

    setupEventListeners() {
        // �Ϥ��W�ǳB�z
        document.getElementById('imageUpload').addEventListener('change', this.handleImageUpload.bind(this));

        // �u���ܳB�z
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const toolName = e.currentTarget.dataset.tool;
                this.selectTool(toolName);
            });
        });

        // �ץX���s�B�z
        document.getElementById('exportBtn').addEventListener('click', this.exportSticker.bind(this));

        // �M�P/�������s�B�z
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
                this.historyManager.saveState('�Ϥ��W��');
                this.uiManager.updateUI();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * 載入圖片
     * @param {File} file - 圖片檔案
     */
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

    selectTool(toolName) {
        // ���η��e�u��
        if (this.state.currentTool) {
            this.tools[this.state.currentTool].deactivate();
        }

        // �ҥο�ܪ��u��
        this.state.currentTool = toolName;
        this.state.currentMode = EDITOR_MODES.EDITING;
        this.tools[toolName].activate();

        // ��sUI�H�ϬM��ܪ��u��
        this.uiManager.updateToolUI(toolName);
    }

    applyEdit(editType, params) {
        if (!this.state.hasImage) return;

        this.state.isProcessing = true;
        this.uiManager.showProcessingIndicator();

        // �ϥ�setTimeout�ӽT�OUI�����|��s
        setTimeout(() => {
            // �եά����u�㪺�s����
            const result = this.tools[editType].applyEdit(params);

            if (result) {
                // �O�s���v���A
                this.historyManager.saveState(`�M��${this.tools[editType].name}`);

                // ��sUI
                this.uiManager.updateUI();
            }

            this.state.isProcessing = false;
            this.uiManager.hideProcessingIndicator();
        }, 50);
    }

    exportSticker() {
        if (!this.state.hasImage) return;

        // ����B�z�᪺�Ϥ�
        const dataURL = this.canvasManager.exportCanvas();

        // �ЫؤU���s��
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'line-sticker.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // ���ѵ�HistoryManager�ϥΪ����A�޲z��k
    getCanvasState() {
        return this.canvasManager.getCanvasData();
    }

    restoreCanvasState(state) {
        this.canvasManager.restoreCanvasData(state);
        this.uiManager.updateUI();
    }
}
// core/HistoryManager.js - 歷史記錄管理類
import * as Constants from '../utils/Constants.js';

export class HistoryManager {
    constructor() {
        this.history = [];  // 歷史記錄堆疊
        this.currentIndex = -1;  // 當前位置
        this.maxHistoryLength = Constants.MAX_HISTORY_LENGTH;

        console.log('HistoryManager 初始化完成');
    }

    /**
     * 添加新的狀態到歷史記錄
     * @param {ImageData} state - 圖片資料
     */
    addState(state) {
        if (!state) return;

        // 如果在歷史記錄中間添加新狀態，則刪除當前位置之後的所有狀態
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        // ✅ clone 前先檢查 imageData 是否有效
        const clone = this.cloneImageData(state);
        if (!clone) return;  // 無效資料不加入歷史

        // 添加新狀態
        this.history.push(clone);
        this.currentIndex = this.history.length - 1;

        // 如果歷史記錄太長，移除最舊的記錄
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
            this.currentIndex--;
        }
    }

    /**
     * 復原操作
     * @returns {ImageData|null} 前一個狀態，如果沒有則返回null
     */
    undo() {
        if (!this.canUndo()) return null;

        this.currentIndex--;
        return this.history[this.currentIndex];
    }

    /**
     * 重做操作
     * @returns {ImageData|null} 下一個狀態，如果沒有則返回null
     */
    redo() {
        if (!this.canRedo()) return null;

        this.currentIndex++;
        return this.history[this.currentIndex];
    }

    /**
     * 檢查是否可以復原
     * @returns {boolean} 是否可以復原
     */
    canUndo() {
        return this.currentIndex > 0;
    }

    /**
     * 檢查是否可以重做
     * @returns {boolean} 是否可以重做
     */
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    /**
     * 複製ImageData對象
     * @param {ImageData} imageData - 原始ImageData
     * @returns {ImageData} 複製的ImageData
     */
    cloneImageData(imageData) {
        if (
            !imageData ||
            !imageData.data ||
            imageData.width <= 0 ||
            imageData.height <= 0
        ) {
            console.warn("⚠️ 無效的 ImageData，跳過 cloneImageData()");
            return null;
        }

        return new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
    }

    /**
     * 清空歷史記錄
     */
    clearHistory() {
        this.history = [];
        this.currentIndex = -1;
    }


    saveState(imageData) {
        this.addState(imageData);
    }
}

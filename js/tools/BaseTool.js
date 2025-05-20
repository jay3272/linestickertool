/**
 * BaseTool.js
 * 工具基礎類 - 所有編輯工具的父類
 * 提供共享的基本功能和接口
 */

class BaseTool {
    /**
     * 建立工具基礎類
     * @param {Object} options - 工具選項
     * @param {string} options.name - 工具名稱
     * @param {string} options.icon - 工具圖示類名
     * @param {string} options.templateId - 工具選項面板模板ID
     * @param {EditorApp} options.app - 編輯器應用實例
     * @param {CanvasManager} options.canvasManager - 畫布管理器實例
     * @param {HistoryManager} options.historyManager - 歷史記錄管理器實例
     * @param {UIManager} options.uiManager - UI管理器實例
     */
    constructor(options = {}) {
        // 必要屬性檢查
        if (!options.name) {
            throw new Error('工具名稱是必須的');
        }
        
        // 基本屬性
        this.name = options.name;
        this.icon = options.icon || 'fa-solid fa-wrench';
        this.templateId = options.templateId || null;
        
        // 核心組件引用
        this.app = options.app || null;
        this.canvasManager = options.canvasManager || null;
        this.historyManager = options.historyManager || null;
        this.uiManager = options.uiManager || null;
        
        // 工具狀態
        this.active = false;
        this.initialized = false;
        
        // DOM元素引用
        this.optionsPanel = null;
        this.options = {};
        
        // 事件處理器映射
        this.eventHandlers = {};
    }
    
    /**
     * 初始化工具
     * 子類可擴展，但應調用super.initialize()
     */
    initialize() {
        if (this.initialized) return;
        
        // 載入工具選項面板
        if (this.templateId && this.uiManager) {
            this.loadOptionsPanel();
        }
        
        this.initialized = true;
    }
    
    /**
     * 載入工具選項面板
     * @private
     */
    loadOptionsPanel() {
        this.optionsPanel = this.uiManager.loadTemplate(this.templateId);
        if (!this.optionsPanel) {
            console.error(`無法載入工具選項面板模板: ${this.templateId}`);
            return;
        }
        
        // 獲取常用的DOM元素
        this.cacheOptionElements();
        
        // 綁定事件監聽器
        this.bindOptionEvents();
    }
    
    /**
     * 緩存選項面板中的DOM元素
     * 子類應擴展此方法以獲取其特定的DOM元素
     * @protected
     */
    cacheOptionElements() {
        // 尋找並緩存通用的按鈕
        // 例如取消和套用按鈕
        const cancelBtn = this.optionsPanel.querySelector(`[id^="cancel${this.name}"]`);
        if (cancelBtn) {
            this.options.cancelBtn = cancelBtn;
        }
        
        const applyBtn = this.optionsPanel.querySelector(`[id^="apply${this.name}"]`);
        if (applyBtn) {
            this.options.applyBtn = applyBtn;
        }
    }
    
    /**
     * 綁定選項面板中的事件
     * 子類應擴展此方法以綁定其特定的事件
     * @protected
     */
    bindOptionEvents() {
        // 綁定通用按鈕事件
        if (this.options.cancelBtn) {
            this.options.cancelBtn.addEventListener('click', this.onCancel.bind(this));
        }
        
        if (this.options.applyBtn) {
            this.options.applyBtn.addEventListener('click', this.onApply.bind(this));
        }
    }
    
    /**
     * 激活工具
     * 子類可擴展，但應調用super.activate()
     */
    activate() {
        if (!this.initialized) {
            this.initialize();
        }
        
        // 顯示工具選項面板
        if (this.optionsPanel && this.uiManager) {
            this.uiManager.showOptionsPanel(this.optionsPanel);
        }
        
        this.active = true;
        this.onActivate();
    }
    
    /**
     * 停用工具
     * 子類可擴展，但應調用super.deactivate()
     */
    deactivate() {
        // 隱藏工具選項面板
        if (this.optionsPanel && this.uiManager) {
            this.uiManager.hideOptionsPanel();
        }
        
        this.active = false;
        this.onDeactivate();
    }
    
    /**
     * 當工具被激活時調用
     * 子類應重寫此方法
     * @protected
     */
    onActivate() {
        // 由子類實現
    }
    
    /**
     * 當工具被停用時調用
     * 子類應重寫此方法
     * @protected
     */
    onDeactivate() {
        // 由子類實現
    }
    
    /**
     * 應用工具效果
     * 子類應重寫此方法
     * @protected
     */
    apply() {
        // 由子類實現
        console.warn(`${this.name}工具的apply()方法未實現`);
    }
    
    /**
     * 取消工具效果
     * 子類應重寫此方法
     * @protected
     */
    cancel() {
        // 由子類實現
        this.deactivate();
    }
    
    /**
     * 當套用按鈕被點擊時調用
     * @private
     */
    onApply() {
        try {
            this.apply();
            // 應用成功後自動停用工具
            this.deactivate();
        } catch (error) {
            console.error(`套用${this.name}工具時發生錯誤:`, error);
            this.uiManager?.showNotification(`套用失敗: ${error.message}`, 'error');
        }
    }
    
    /**
     * 當取消按鈕被點擊時調用
     * @private
     */
    onCancel() {
        try {
            this.cancel();
        } catch (error) {
            console.error(`取消${this.name}工具時發生錯誤:`, error);
        }
    }
    
    /**
     * 添加事件監聽器
     * @param {HTMLElement} element - 要監聽的DOM元素
     * @param {string} eventType - 事件類型
     * @param {Function} handler - 事件處理函數
     * @param {Object} [options] - 事件選項
     * @protected
     */
    addEventHandler(element, eventType, handler, options) {
        if (!element) return;
        
        // 維護事件處理器的引用以便後續移除
        const handlerKey = `${eventType}_${Date.now()}`;
        this.eventHandlers[handlerKey] = {
            element,
            eventType,
            handler,
            options
        };
        
        element.addEventListener(eventType, handler, options);
    }
    
    /**
     * 移除所有已註冊的事件監聽器
     * @protected
     */
    removeAllEventHandlers() {
        Object.values(this.eventHandlers).forEach(({ element, eventType, handler, options }) => {
            if (element) {
                element.removeEventListener(eventType, handler, options);
            }
        });
        
        this.eventHandlers = {};
    }
    
    /**
     * 保存當前狀態到歷史記錄
     * @param {string} [actionName] - 操作名稱
     * @protected
     */
    saveToHistory(actionName) {
        if (this.historyManager && this.canvasManager) {
            const state = this.canvasManager.getState();
            const action = actionName || `${this.name}工具操作`;
            this.historyManager.pushState(state, action);
        }
    }
    
    /**
     * 更新UI元素狀態
     * 子類應根據需要擴展此方法
     * @protected
     */
    updateUI() {
        // 由子類實現
    }
    
    /**
     * 顯示載入中狀態
     * @param {boolean} [show=true] - 是否顯示
     * @protected
     */
    toggleLoading(show = true) {
        this.uiManager?.toggleLoading(show);
    }
    
    /**
     * 顯示通知訊息
     * @param {string} message - 通知內容
     * @param {string} [type='info'] - 通知類型 (info, success, warning, error)
     * @param {number} [duration=3000] - 顯示時間(毫秒)
     * @protected
     */
    showNotification(message, type = 'info', duration = 3000) {
        this.uiManager?.showNotification(message, type, duration);
    }
    
    /**
     * 清理資源並準備銷毀工具實例
     * 子類可擴展，但應調用super.dispose()
     */
    dispose() {
        this.removeAllEventHandlers();
        
        // 解除DOM引用
        this.optionsPanel = null;
        this.options = {};
        
        // 解除核心組件引用
        this.app = null;
        this.canvasManager = null;
        this.historyManager = null;
        this.uiManager = null;
        
        this.initialized = false;
        this.active = false;
    }
}

export default BaseTool;

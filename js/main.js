// main.js - LINE貼圖製作工具的主要入口文件

import { EditorApp } from './core/EditorApp.js';
import { NOTIFICATION } from './utils/Constants.js';

document.addEventListener('DOMContentLoaded', () => {

    // #region DOM 元素參考定義
    const toolButtons = document.querySelectorAll('.tool-btn');
    const imageUpload = document.getElementById('imageUpload');
    const exportBtn = document.getElementById('exportBtn');
    const stickerSizeSelect = document.getElementById('stickerSizeSelect');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const toolOptions = document.getElementById('toolOptionsPanel');
    const canvasId = 'mainCanvas';
    // #endregion

    // #region 初始化編輯器應用
    const editor = new EditorApp({
        canvasId,
        toolOptions,
        uploadInput: imageUpload,
        exportBtn,
        undoBtn,
        redoBtn,
        stickerSizeSelect,
        loadingOverlay
    });
    // #endregion

    // #region 綁定使用者操作事件

    // 工具選擇按鈕
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            const toolName = button.getAttribute('data-tool');
            editor.selectTool(toolName);
        });
    });

    // 圖片上傳
    imageUpload.addEventListener('change', (e) => {
        editor.handleImageUpload(e);
    });

    // 匯出圖片
    exportBtn.addEventListener('click', () => {
        const sizeOption = stickerSizeSelect.value;
        editor.exportImage(sizeOption);
    });

    // #endregion

    // #region 顯示通知功能
    window.showNotification = (message, isError = false) => {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');

        notificationText.textContent = message;
        notification.classList.remove('hidden');

        if (isError) {
            notification.classList.add('error');
        } else {
            notification.classList.remove('error');
        }

        setTimeout(() => {
            notification.classList.add('hidden');
        }, NOTIFICATION.DISPLAY_DURATION);
    };
    // #endregion

    // #region 初始化完成訊息
    console.log('LINE貼圖製作工具已初始化完成');
    // #endregion
});

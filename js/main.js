// main.js - LINE貼圖製作工具的主要入口文件
import { EditorApp } from './core/EditorApp.js';
import { NOTIFICATION } from './utils/Constants.js';

document.addEventListener('DOMContentLoaded', () => {
    // 初始化編輯器應用
    const editor = new EditorApp({
        canvasId: 'mainCanvas',
        toolOptions: document.getElementById('toolOptionsPanel'),
        uploadInput: document.getElementById('imageUpload'),
        exportBtn: document.getElementById('exportBtn'),
        undoBtn: document.getElementById('undoBtn'),
        redoBtn: document.getElementById('redoBtn'),
        stickerSizeSelect: document.getElementById('stickerSizeSelect'),
        loadingOverlay: document.getElementById('loadingOverlay')
    });

    // 綁定工具按鈕事件
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            const toolName = button.getAttribute('data-tool');
            editor.activateTool(toolName);
        });
    });

    // 綁定上傳事件
    const imageUpload = document.getElementById('imageUpload');
    imageUpload.addEventListener('change', (e) => {
        editor.handleImageUpload(e); // 呼叫 EditorApp 提供的方法
    });

    // 綁定匯出按鈕事件
    const exportBtn = document.getElementById('exportBtn');
    exportBtn.addEventListener('click', () => {
        const sizeOption = document.getElementById('stickerSizeSelect').value;
        editor.exportImage(sizeOption);
    });

    // 顯示通知的函數
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
        }, NOTIFICATION.DISPLAY_DURATION); // 使用 Constants 中的通知時間
    };

    // 初始化
    console.log('LINE貼圖製作工具已初始化完成');
});

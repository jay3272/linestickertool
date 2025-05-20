/**
 * UI管理類 - 負責處理UI相關的操作和狀態管理
 */
export default class UIManager {
    /**
     * 初始化UI管理器
     * @param {Object} app - EditorApp實例的引用
     */
    constructor(app) {
        this.app = app;
        this.toolButtons = document.querySelectorAll('.tool-btn');
        this.toolOptionsPanel = document.getElementById('toolOptionsPanel');
        this.activeTool = null;
        this.activeToolOptions = null;
        this.undoBtn = document.getElementById('undoBtn');
        this.redoBtn = document.getElementById('redoBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.uploadInput = document.getElementById('imageUpload');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notificationText');
        this.notificationTimeout = null;
        this.stickerSizeSelect = document.getElementById('stickerSizeSelect');

        this.initEventListeners();
    }

    /**
     * 初始化所有UI相關的事件監聽器
     */
    initEventListeners() {
        // 工具按鈕點擊事件
        this.toolButtons.forEach(button => {
            button.addEventListener('click', () => {
                const toolName = button.getAttribute('data-tool');
                this.activateTool(toolName);
            });
        });

        // 上傳按鈕點擊事件
        this.uploadInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.showLoading();
                // 將文件處理委派給app的方法
                this.app.loadImage(e.target.files[0])
                    .then(() => {
                        this.hideLoading();
                        this.enableExportButton();
                    })
                    .catch(error => {
                        this.hideLoading();
                        this.showNotification('圖片載入失敗：' + error.message, 'error');
                    });
            }
        });

        // 匯出按鈕點擊事件
        this.exportBtn.addEventListener('click', () => {
            const sizeOption = this.stickerSizeSelect.value;
            this.showLoading();
            this.app.exportImage(sizeOption)
                .then(() => {
                    this.hideLoading();
                    this.showNotification('貼圖匯出成功！', 'success');
                })
                .catch(error => {
                    this.hideLoading();
                    this.showNotification('貼圖匯出失敗：' + error.message, 'error');
                });
        });

        // 歷史記錄按鈕事件
        this.undoBtn.addEventListener('click', () => {
            this.app.historyManager.undo();
            this.updateHistoryButtons();
        });

        this.redoBtn.addEventListener('click', () => {
            this.app.historyManager.redo();
            this.updateHistoryButtons();
        });
    }

    /**
     * 激活指定工具
     * @param {string} toolName - 工具名稱
     */
    activateTool(toolName) {
        // 清除之前的激活狀態
        this.deactivateCurrentTool();

        // 高亮選中的工具按鈕
        const selectedButton = document.querySelector(`[data-tool="${toolName}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }

        // 載入對應工具的選項面板
        this.loadToolOptions(toolName);

        // 通知應用程序激活工具
        this.app.setActiveTool(toolName);
        this.activeTool = toolName;
    }

    /**
     * 取消當前工具的激活狀態
     */
    deactivateCurrentTool() {
        if (this.activeTool) {
            const currentButton = document.querySelector(`[data-tool="${this.activeTool}"]`);
            if (currentButton) {
                currentButton.classList.remove('active');
            }
            this.clearToolOptions();
            // 通知應用程序取消激活工具
            this.app.clearActiveTool();
        }
    }

    /**
     * 載入指定工具的選項面板
     * @param {string} toolName - 工具名稱
     */
    loadToolOptions(toolName) {
        // 清除當前面板
        this.clearToolOptions();

        // 獲取對應工具的模板
        const templateId = `${toolName}ToolOptions`;
        const template = document.getElementById(templateId);

        if (!template) {
            console.error(`找不到工具選項模板：${templateId}`);
            return;
        }

        // 複製模板內容到選項面板
        const clone = template.content.cloneNode(true);
        this.toolOptionsPanel.appendChild(clone);
        this.activeToolOptions = toolName;

        // 為工具選項面板中的按鈕添加事件
        this.attachToolOptionEvents(toolName);
    }

    /**
     * 為工具選項面板中的按鈕添加事件
     * @param {string} toolName - 工具名稱
     */
    attachToolOptionEvents(toolName) {
        // 通用取消按鈕邏輯
        const cancelBtn = document.getElementById(`cancel${this.capitalizeFirstLetter(toolName)}Btn`);
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.deactivateCurrentTool();
            });
        }

        // 特定工具的應用按鈕和其他控制項邏輯
        switch (toolName) {
            case 'resize':
                this.setupResizeToolEvents();
                break;
            case 'crop':
                this.setupCropToolEvents();
                break;
            case 'rotate':
                this.setupRotateToolEvents();
                break;
            case 'brightness':
                this.setupBrightnessToolEvents();
                break;
            case 'contrast':
                this.setupContrastToolEvents();
                break;
            case 'transparency':
                this.setupTransparencyToolEvents();
                break;
        }
    }

    /**
     * 設置調整大小工具的事件
     */
    setupResizeToolEvents() {
        const applyBtn = document.getElementById('applyResizeBtn');
        const widthInput = document.getElementById('resizeWidth');
        const heightInput = document.getElementById('resizeHeight');
        const aspectRatioCheckbox = document.getElementById('maintainAspectRatio');

        // 初始化輸入值為當前畫布尺寸
        const currentDimensions = this.app.canvasManager.getCurrentDimensions();
        widthInput.value = currentDimensions.width;
        heightInput.value = currentDimensions.height;

        let aspectRatio = currentDimensions.width / currentDimensions.height;

        // 維持比例邏輯
        widthInput.addEventListener('change', () => {
            if (aspectRatioCheckbox.checked) {
                heightInput.value = Math.round(widthInput.value / aspectRatio);
            }
        });

        heightInput.addEventListener('change', () => {
            if (aspectRatioCheckbox.checked) {
                widthInput.value = Math.round(heightInput.value * aspectRatio);
            }
        });

        // 應用按鈕
        applyBtn.addEventListener('click', () => {
            const width = parseInt(widthInput.value);
            const height = parseInt(heightInput.value);
            if (width > 0 && height > 0) {
                this.showLoading();
                this.app.resizeImage(width, height)
                    .then(() => {
                        this.hideLoading();
                        this.deactivateCurrentTool();
                        this.showNotification('調整大小成功！', 'success');
                    })
                    .catch(error => {
                        this.hideLoading();
                        this.showNotification('調整大小失敗：' + error.message, 'error');
                    });
            } else {
                this.showNotification('請輸入有效的寬度和高度', 'error');
            }
        });
    }

    /**
     * 設置裁剪工具的事件
     */
    setupCropToolEvents() {
        const applyBtn = document.getElementById('applyCropBtn');
        const cropX = document.getElementById('cropX');
        const cropY = document.getElementById('cropY');
        const cropWidth = document.getElementById('cropWidth');
        const cropHeight = document.getElementById('cropHeight');
        const presetButtons = document.querySelectorAll('.crop-preset-btn');

        // 初始化裁剪區域為當前畫布尺寸
        const currentDimensions = this.app.canvasManager.getCurrentDimensions();
        cropX.value = 0;
        cropY.value = 0;
        cropWidth.value = currentDimensions.width;
        cropHeight.value = currentDimensions.height;

        // 裁剪預設比例按鈕邏輯
        presetButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 移除所有按鈕的active類
                presetButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const ratio = button.getAttribute('data-ratio');
                const currentWidth = parseInt(cropWidth.value);

                // 根據選擇的比例調整高度
                if (ratio !== 'free') {
                    const [widthRatio, heightRatio] = ratio.split(':').map(Number);
                    cropHeight.value = Math.round(currentWidth * heightRatio / widthRatio);
                }
            });
        });

        // 應用裁剪
        applyBtn.addEventListener('click', () => {
            const x = parseInt(cropX.value);
            const y = parseInt(cropY.value);
            const width = parseInt(cropWidth.value);
            const height = parseInt(cropHeight.value);

            if (x >= 0 && y >= 0 && width > 0 && height > 0) {
                this.showLoading();
                this.app.cropImage(x, y, width, height)
                    .then(() => {
                        this.hideLoading();
                        this.deactivateCurrentTool();
                        this.showNotification('裁剪成功！', 'success');
                    })
                    .catch(error => {
                        this.hideLoading();
                        this.showNotification('裁剪失敗：' + error.message, 'error');
                    });
            } else {
                this.showNotification('裁剪參數無效', 'error');
            }
        });
    }

    /**
     * 設置旋轉工具的事件
     */
    setupRotateToolEvents() {
        const applyBtn = document.getElementById('applyRotateBtn');
        const leftBtn = document.getElementById('rotateLeftBtn');
        const rightBtn = document.getElementById('rotateRightBtn');
        const angleSlider = document.getElementById('rotationAngle');
        const angleValue = document.getElementById('rotationAngleValue');

        // 當滑塊值改變時更新顯示的角度
        angleSlider.addEventListener('input', () => {
            angleValue.textContent = `${angleSlider.value}°`;
            // 預覽旋轉效果
            this.app.previewRotation(parseFloat(angleSlider.value));
        });

        // 左旋轉按鈕 (-90度)
        leftBtn.addEventListener('click', () => {
            angleSlider.value = parseInt(angleSlider.value) - 90;
            angleValue.textContent = `${angleSlider.value}°`;
            this.app.previewRotation(parseFloat(angleSlider.value));
        });

        // 右旋轉按鈕 (+90度)
        rightBtn.addEventListener('click', () => {
            angleSlider.value = parseInt(angleSlider.value) + 90;
            angleValue.textContent = `${angleSlider.value}°`;
            this.app.previewRotation(parseFloat(angleSlider.value));
        });

        // 應用旋轉
        applyBtn.addEventListener('click', () => {
            const angle = parseFloat(angleSlider.value);
            this.showLoading();
            this.app.rotateImage(angle)
                .then(() => {
                    this.hideLoading();
                    this.deactivateCurrentTool();
                    this.showNotification('旋轉成功！', 'success');
                })
                .catch(error => {
                    this.hideLoading();
                    this.showNotification('旋轉失敗：' + error.message, 'error');
                });
        });
    }

    /**
     * 設置亮度工具的事件
     */
    setupBrightnessToolEvents() {
        const applyBtn = document.getElementById('applyBrightnessBtn');
        const brightnessSlider = document.getElementById('brightnessSlider');
        const brightnessValue = document.getElementById('brightnessValue');

        // 當滑塊值改變時更新顯示的亮度值
        brightnessSlider.addEventListener('input', () => {
            brightnessValue.textContent = brightnessSlider.value;
            // 預覽亮度效果
            this.app.previewBrightness(parseInt(brightnessSlider.value));
        });

        // 應用亮度調整
        applyBtn.addEventListener('click', () => {
            const brightness = parseInt(brightnessSlider.value);
            this.showLoading();
            this.app.adjustBrightness(brightness)
                .then(() => {
                    this.hideLoading();
                    this.deactivateCurrentTool();
                    this.showNotification('亮度調整成功！', 'success');
                })
                .catch(error => {
                    this.hideLoading();
                    this.showNotification('亮度調整失敗：' + error.message, 'error');
                });
        });
    }

    /**
     * 設置對比度工具的事件
     */
    setupContrastToolEvents() {
        const applyBtn = document.getElementById('applyContrastBtn');
        const contrastSlider = document.getElementById('contrastSlider');
        const contrastValue = document.getElementById('contrastValue');

        // 當滑塊值改變時更新顯示的對比度值
        contrastSlider.addEventListener('input', () => {
            contrastValue.textContent = contrastSlider.value;
            // 預覽對比度效果
            this.app.previewContrast(parseInt(contrastSlider.value));
        });

        // 應用對比度調整
        applyBtn.addEventListener('click', () => {
            const contrast = parseInt(contrastSlider.value);
            this.showLoading();
            this.app.adjustContrast(contrast)
                .then(() => {
                    this.hideLoading();
                    this.deactivateCurrentTool();
                    this.showNotification('對比度調整成功！', 'success');
                })
                .catch(error => {
                    this.hideLoading();
                    this.showNotification('對比度調整失敗：' + error.message, 'error');
                });
        });
    }

    /**
     * 設置透明背景工具的事件
     */
    setupTransparencyToolEvents() {
        const applyBtn = document.getElementById('applyTransparencyBtn');
        const toleranceSlider = document.getElementById('toleranceSlider');
        const toleranceValue = document.getElementById('toleranceValue');

        // 當滑塊值改變時更新顯示的容差值
        toleranceSlider.addEventListener('input', () => {
            toleranceValue.textContent = toleranceSlider.value;
            // 預覽透明效果
            this.app.previewTransparency(parseInt(toleranceSlider.value));
        });

        // 應用透明背景
        applyBtn.addEventListener('click', () => {
            const tolerance = parseInt(toleranceSlider.value);
            this.showLoading();
            this.app.makeTransparent(tolerance)
                .then(() => {
                    this.hideLoading();
                    this.deactivateCurrentTool();
                    this.showNotification('透明背景設置成功！', 'success');
                })
                .catch(error => {
                    this.hideLoading();
                    this.showNotification('透明背景設置失敗：' + error.message, 'error');
                });
        });
    }

    /**
     * 清除工具選項面板
     */
    clearToolOptions() {
        this.toolOptionsPanel.innerHTML = `
            <div class="default-message">
                <p>選擇圖片並選擇工具開始編輯</p>
            </div>
        `;
        this.activeToolOptions = null;
    }

    /**
     * 更新歷史記錄按鈕狀態
     */
    updateHistoryButtons() {
        const historyManager = this.app.historyManager;
        this.undoBtn.disabled = !historyManager.canUndo();
        this.redoBtn.disabled = !historyManager.canRedo();
    }

    /**
     * 啟用匯出按鈕
     */
    enableExportButton() {
        this.exportBtn.disabled = false;
    }

    /**
     * 顯示加載遮罩
     */
    showLoading() {
        this.loadingOverlay.classList.remove('hidden');
    }

    /**
     * 隱藏加載遮罩
     */
    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    /**
     * 顯示通知訊息
     * @param {string} message - 通知內容
     * @param {string} type - 通知類型 (success/error/info)
     */
    showNotification(message, type = 'info') {
        // 清除之前的timeout
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }

        // 設置訊息內容和樣式
        this.notificationText.textContent = message;
        this.notification.className = 'notification'; // 重置類
        this.notification.classList.add(type);
        this.notification.classList.remove('hidden');

        // 3秒後自動隱藏
        this.notificationTimeout = setTimeout(() => {
            this.notification.classList.add('hidden');
        }, 3000);
    }

    /**
     * 輔助方法：首字母大寫
     * @param {string} string - 輸入字串
     * @returns {string} 首字母大寫的字串
     */
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

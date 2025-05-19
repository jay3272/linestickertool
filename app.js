document.addEventListener('DOMContentLoaded', function() {
    // 常量定義
    const LINE_STICKER_WIDTH = 370;
    const LINE_STICKER_HEIGHT = 320;
    
    // 獲取DOM元素
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const editTools = document.getElementById('editTools');
    const resizeBtn = document.getElementById('resizeBtn');
    const cropBtn = document.getElementById('cropBtn');
    const rotateBtn = document.getElementById('rotateBtn');
    const brightnessBtn = document.getElementById('brightnessBtn');
    const contrastBtn = document.getElementById('contrastBtn');
    const transparencyBtn = document.getElementById('transparencyBtn');
    const saveBtn = document.getElementById('saveBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // 初始化 Canvas (使用 Fabric.js)
    let canvas;
    let originalImage;
    let isEditing = false;
    
    // 初始化編輯工具狀態 - 預設為禁用
    toggleEditTools(false);
    
    // 事件監聽 - 圖片上傳
    imageUpload.addEventListener('change', handleImageUpload);
    
    // 事件監聽 - 編輯工具按鈕
    resizeBtn.addEventListener('click', handleResize);
    cropBtn.addEventListener('click', handleCrop);
    rotateBtn.addEventListener('click', handleRotate);
    brightnessBtn.addEventListener('click', handleBrightness);
    contrastBtn.addEventListener('click', handleContrast);
    transparencyBtn.addEventListener('click', handleTransparency);
    saveBtn.addEventListener('click', handleSave);
    downloadBtn.addEventListener('click', handleDownload);
    resetBtn.addEventListener('click', handleReset);
    
    // 處理圖片上傳
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 檢查文件類型
        if (!file.type.match('image.*')) {
            alert('請上傳圖片檔案！');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // 清除預覽區域的占位文字
            imagePreview.innerHTML = '';
            
            // 如果已經有Canvas，先銷毀它
            if (canvas) {
                canvas.dispose();
            }
            
            // 創建新的Canvas
            canvas = new fabric.Canvas(document.createElement('canvas'), {
                width: imagePreview.offsetWidth,
                height: 400
            });
            
            imagePreview.appendChild(canvas.wrapperEl);
            
            // 載入圖片到Canvas
            fabric.Image.fromURL(e.target.result, function(img) {
                originalImage = img;
                
                // 調整圖片大小，確保適合Canvas
                const scale = Math.min(
                    canvas.width / img.width,
                    canvas.height / img.height
                ) * 0.8;
                
                img.scale(scale);
                
                // 將圖片放置在Canvas中央
                img.set({
                    left: canvas.width / 2,
                    top: canvas.height / 2,
                    originX: 'center',
                    originY: 'center'
                });
                
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
                
                // 啟用編輯工具
                toggleEditTools(true);
            });
        };
        
        reader.readAsDataURL(file);
    }
    
    // 編輯功能 - 調整大小
    function handleResize() {
        if (!canvas) return;
        
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;
        
        // 建立一個簡單的對話方塊獲取新尺寸
        const currentWidth = Math.round(activeObject.width * activeObject.scaleX);
        const currentHeight = Math.round(activeObject.height * activeObject.scaleY);
        
        const newWidth = prompt('請輸入新寬度 (像素):', currentWidth);
        if (!newWidth) return;
        
        const newHeight = prompt('請輸入新高度 (像素):', currentHeight);
        if (!newHeight) return;
        
        // 更新對象尺寸
        activeObject.set({
            scaleX: newWidth / activeObject.width,
            scaleY: newHeight / activeObject.height
        });
        
        canvas.renderAll();
    }
    
    // 編輯功能 - 裁剪
    function handleCrop() {
        alert('裁剪功能正在開發中...');
        // 這裡將來會實現裁剪功能
    }
    
    // 編輯功能 - 旋轉
    function handleRotate() {
        if (!canvas) return;
        
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;
        
        // 每次點擊旋轉90度
        activeObject.rotate((activeObject.angle || 0) + 90);
        canvas.renderAll();
    }
    
    // 編輯功能 - 調整亮度
    function handleBrightness() {
        if (!canvas) return;
        
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;
        
        // 簡單的亮度調整實現
        const value = prompt('請輸入亮度值 (-100 到 100):', '0');
        if (value === null) return;
        
        const brightnessValue = parseInt(value);
        
        // 使用濾鏡應用亮度
        activeObject.filters = activeObject.filters || [];
        
        // 移除任何現有的亮度濾鏡
        activeObject.filters = activeObject.filters.filter(filter => !(filter instanceof fabric.Image.filters.Brightness));
        
        // 添加新的亮度濾鏡
        if (brightnessValue !== 0) {
            const filter = new fabric.Image.filters.Brightness({
                brightness: brightnessValue / 100
            });
            activeObject.filters.push(filter);
        }
        
        activeObject.applyFilters();
        canvas.renderAll();
    }
    
    // 編輯功能 - 調整對比度
    function handleContrast() {
        if (!canvas) return;
        
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;
        
        // 簡單的對比度調整實現
        const value = prompt('請輸入對比度值 (-100 到 100):', '0');
        if (value === null) return;
        
        const contrastValue = parseInt(value);
        
        // 使用濾鏡應用對比度
        activeObject.filters = activeObject.filters || [];
        
        // 移除任何現有的對比度濾鏡
        activeObject.filters = activeObject.filters.filter(filter => !(filter instanceof fabric.Image.filters.Contrast));
        
        // 添加新的對比度濾鏡
        if (contrastValue !== 0) {
            const filter = new fabric.Image.filters.Contrast({
                contrast: contrastValue / 100
            });
            activeObject.filters.push(filter);
        }
        
        activeObject.applyFilters();
        canvas.renderAll();
    }
    
    // 編輯功能 - 透明背景
    function handleTransparency() {
        if (!canvas) return;
        
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;
        
        alert('透明背景功能正在開發中... 此功能將自動移除白色背景');
        // 這裡將來會實現透明背景功能
    }
    
    // 保存編輯內容
    function handleSave() {
        if (!canvas) return;
        
        // 實際應用中，這裡可能會保存到服務器或本地存儲
        alert('更改已保存!');
    }
    
    // 下載圖片
    function handleDownload() {
        if (!canvas) return;
        
        // 提示使用者選擇下載格式
        const format = prompt('請選擇下載格式 (png/jpg):', 'png').toLowerCase();
        if (format !== 'png' && format !== 'jpg') {
            alert('不支援的格式，請選擇 png 或 jpg');
            return;
        }
        
        // 創建下載連結
        const link = document.createElement('a');
        
        // 設置mime類型和檔案擴展名
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const extension = format;
        
        // 獲取活動對象的數據 URL
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            // 創建一個臨時畫布，僅包含活動對象
            const tempCanvas = document.createElement('canvas');
            const context = tempCanvas.getContext('2d');
            
            // 設置畫布大小為LINE貼圖的標準尺寸
            tempCanvas.width = LINE_STICKER_WIDTH;
            tempCanvas.height = LINE_STICKER_HEIGHT;
            
            // 保存當前對象的位置和大小
            const origLeft = activeObject.left;
            const origTop = activeObject.top;
            const origScaleX = activeObject.scaleX;
            const origScaleY = activeObject.scaleY;
            
            // 調整對象以適應貼圖尺寸
            activeObject.set({
                left: LINE_STICKER_WIDTH / 2,
                top: LINE_STICKER_HEIGHT / 2,
                scaleX: activeObject.scaleX * (LINE_STICKER_WIDTH / canvas.width),
                scaleY: activeObject.scaleY * (LINE_STICKER_HEIGHT / canvas.height)
            });
            
            // 創建一個臨時的Fabric畫布
            const tempFabricCanvas = new fabric.StaticCanvas(tempCanvas);
            tempFabricCanvas.add(fabric.util.object.clone(activeObject));
            tempFabricCanvas.renderAll();
            
            // 恢復對象原始設置
            activeObject.set({
                left: origLeft,
                top: origTop,
                scaleX: origScaleX,
                scaleY: origScaleY
            });
            canvas.renderAll();
            
            // 獲取數據URL並設置下載
            link.href = tempCanvas.toDataURL(mimeType);
        } else {
            // 如果沒有選中對象，下載整個畫布
            link.href = canvas.toDataURL({
                format: format === 'png' ? 'png' : 'jpeg',
                quality: 0.95
            });
        }
        
        // 設置檔案名稱和觸發下載
        link.download = `line-sticker-${new Date().getTime()}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // 重設為原始圖片
    function handleReset() {
        if (!canvas || !originalImage) return;
        
        // 確認是否重設
        if (!confirm('確定要重設圖片嗎？所有編輯將會丟失。')) {
            return;
        }
        
        // 移除所有對象
        canvas.clear();
        
        // 重新添加原始圖片
        const clonedImage = fabric.util.object.clone(originalImage);
        
        clonedImage.set({
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center'
        });
        
        canvas.add(clonedImage);
        canvas.setActiveObject(clonedImage);
        canvas.renderAll();
    }
    
    // 切換編輯工具啟用/禁用狀態
    function toggleEditTools(enabled) {
        const buttons = editTools.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = !enabled;
        });
        
        if (!enabled) {
            editTools.classList.add('disabled');
        } else {
            editTools.classList.remove('disabled');
        }
    }
});
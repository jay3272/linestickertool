document.addEventListener('DOMContentLoaded', function() {
    // 常量定義
    const LINE_STICKER_WIDTH = 370;
    const LINE_STICKER_HEIGHT = 320;
    // 裁剪相關全局變量
	let isCropping = false;
	let cropRect = null;
	let originalCanvasState = null;	
	
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
        	
	// 更新handleCrop函數
	function handleCrop() {
		if (!canvas) return;
		
		const activeObject = canvas.getActiveObject();
		if (!activeObject) {
			alert('請先選擇一個圖片');
			return;
		}
		
		if (isCropping) {
			// 如果已經在裁剪模式，則完成裁剪
			finishCropping();
		} else {
			// 進入裁剪模式
			startCropping();
		}
	}
	
	// 開始裁剪模式
	function startCropping() {
		// 保存當前畫布狀態以便取消操作
		originalCanvasState = JSON.stringify(canvas);
		
		// 獲取當前選中的對象
		const activeObject = canvas.getActiveObject();
		
		// 禁用其他所有編輯工具
		toggleEditingTools(false);
		
		// 更改裁剪按鈕文字
		cropBtn.textContent = '完成裁剪';
		resetBtn.textContent = '取消裁剪';
		
		// 啟用裁剪模式
		isCropping = true;
		
		// 獲取對象的邊界
		const bounds = activeObject.getBoundingRect();
		
		// 創建裁剪矩形 - 默認為選中對象的80%大小
		const rectWidth = bounds.width * 0.8;
		const rectHeight = bounds.height * 0.8;
		
		cropRect = new fabric.Rect({
			left: bounds.left + bounds.width / 2 - rectWidth / 2,
			top: bounds.top + bounds.height / 2 - rectHeight / 2,
			width: rectWidth,
			height: rectHeight,
			fill: 'rgba(0,0,0,0.2)',
			stroke: '#00B900',
			strokeWidth: 2,
			strokeDashArray: [5, 5],
			transparentCorners: false,
			cornerColor: '#00B900',
			cornerSize: 10,
			lockRotation: true,
			hasRotatingPoint: false
		});
		
		canvas.add(cropRect);
		canvas.setActiveObject(cropRect);
		canvas.renderAll();
		
		// 顯示裁剪指南
		showCropGuide();
	}
	
	// 完成裁剪操作
	function finishCropping() {
		if (!canvas || !cropRect) return;
		
		// 獲取要裁剪的圖像對象（假設是畫布上的第一個對象）
		const objects = canvas.getObjects();
		let imageObject = null;
		
		for (let obj of objects) {
			if (obj !== cropRect && obj.type === 'image') {
				imageObject = obj;
				break;
			}
		}
		
		if (!imageObject) {
			alert('找不到要裁剪的圖像');
			cancelCropping();
			return;
		}
		
		// 獲取裁剪矩形和圖像的位置及尺寸
		const imgElement = imageObject.getElement();
		const cropRectData = {
			left: cropRect.left - imageObject.left + imageObject.width * imageObject.scaleX / 2,
			top: cropRect.top - imageObject.top + imageObject.height * imageObject.scaleY / 2,
			width: cropRect.width * cropRect.scaleX,
			height: cropRect.height * cropRect.scaleY
		};
	
		// 創建臨時畫布來執行裁剪
		const tempCanvas = document.createElement('canvas');
		const tempCtx = tempCanvas.getContext('2d');
		
		// 設置臨時畫布大小
		tempCanvas.width = cropRectData.width;
		tempCanvas.height = cropRectData.height;
		
		// 計算源圖像上的裁剪區域（基於原始圖像尺寸）
		const scaleFactor = 1 / imageObject.scaleX;
		const sourceX = cropRectData.left * scaleFactor;
		const sourceY = cropRectData.top * scaleFactor;
		const sourceWidth = cropRectData.width * scaleFactor;
		const sourceHeight = cropRectData.height * scaleFactor;
		
		// 在臨時畫布上繪製裁剪後的圖像
		tempCtx.drawImage(
			imgElement, 
			sourceX, sourceY, sourceWidth, sourceHeight,
			0, 0, cropRectData.width, cropRectData.height
		);
		
		// 從臨時畫布創建新的Fabric圖像
		fabric.Image.fromURL(tempCanvas.toDataURL(), function(newImg) {
			// 移除原始圖像和裁剪矩形
			canvas.remove(imageObject);
			canvas.remove(cropRect);
			
			// 添加新的裁剪後圖像
			newImg.set({
				left: canvas.width / 2,
				top: canvas.height / 2,
				originX: 'center',
				originY: 'center'
			});
			
			canvas.add(newImg);
			canvas.setActiveObject(newImg);
			
			// 更新原始圖像引用為新裁剪的圖像
			originalImage = newImg;
			
			// 退出裁剪模式
			exitCroppingMode();
		});
	}
	
	// 取消裁剪操作
	function cancelCropping() {
		if (!canvas) return;
		
		// 如果有保存的原始狀態，恢復它
		if (originalCanvasState) {
			canvas.loadFromJSON(originalCanvasState, function() {
				canvas.renderAll();
				// 找到並選中圖像對象
				const objects = canvas.getObjects();
				for (let obj of objects) {
					if (obj.type === 'image') {
						canvas.setActiveObject(obj);
						break;
					}
				}
			});
		} else {
			// 只移除裁剪矩形
			if (cropRect) {
				canvas.remove(cropRect);
			}
		}
		
		// 退出裁剪模式
		exitCroppingMode();
	}
	
	// 退出裁剪模式，重置界面
	function exitCroppingMode() {
		// 重置裁剪相關變量
		isCropping = false;
		cropRect = null;
		originalCanvasState = null;
		
		// 恢復按鈕文字
		cropBtn.textContent = '裁剪';
		resetBtn.textContent = '重設';
		
		// 啟用所有編輯工具
		toggleEditingTools(true);
		
		// 隱藏裁剪指南
		hideCropGuide();
		
		// 重新渲染畫布
		canvas.renderAll();
	}
	
	// 切換編輯工具啟用/禁用狀態（裁剪模式專用）
	function toggleEditingTools(enabled) {
		const buttons = editTools.querySelectorAll('button');
		buttons.forEach(button => {
			// 在裁剪模式中，只保持裁剪和重設按鈕可用
			if (button.id === 'cropBtn' || button.id === 'resetBtn') {
				button.disabled = false;
			} else {
				button.disabled = !enabled;
			}
		});
	}
	
	// 顯示裁剪操作指南
	function showCropGuide() {
		// 創建裁剪指南元素
		const guideElement = document.createElement('div');
		guideElement.id = 'cropGuide';
		guideElement.className = 'crop-guide';
		guideElement.innerHTML = `
			<div class="guide-content">
				<h4>裁剪模式</h4>
				<p>1. 調整綠色框的大小和位置</p>
				<p>2. 點擊「完成裁剪」按鈕確認</p>
				<p>3. 或點擊「取消裁剪」放棄更改</p>
			</div>
		`;
		
		// 添加樣式
		const style = document.createElement('style');
		style.id = 'cropGuideStyle';
		style.textContent = `
			.crop-guide {
				position: fixed;
				bottom: 20px;
				right: 20px;
				background-color: rgba(0, 185, 0, 0.8);
				color: white;
				padding: 15px;
				border-radius: 5px;
				z-index: 1000;
				box-shadow: 0 2px 10px rgba(0,0,0,0.2);
			}
			.guide-content h4 {
				margin-top: 0;
				margin-bottom: 10px;
			}
			.guide-content p {
				margin: 5px 0;
			}
		`;
		
		// 添加到文檔
		document.head.appendChild(style);
		document.body.appendChild(guideElement);
	}
	
	// 隱藏裁剪操作指南
	function hideCropGuide() {
		const guideElement = document.getElementById('cropGuide');
		const styleElement = document.getElementById('cropGuideStyle');
		
		if (guideElement) {
			document.body.removeChild(guideElement);
		}
		
		if (styleElement) {
			document.head.removeChild(styleElement);
		}
	}
	
	// 更新重設按鈕的事件處理函數，支持取消裁剪
	const originalResetHandler = handleReset;
	function handleReset() {
		if (isCropping) {
			// 如果在裁剪模式中，執行取消裁剪
			cancelCropping();
		} else {
			// 否則執行原始的重設功能
			originalResetHandler();
		}
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
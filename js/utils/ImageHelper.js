/**
 * ImageHelper.js
 * 提供圖片處理相關的輔助函數
 */

import { FILE_TYPES, STICKER_SIZES, CANVAS, IMAGE_PROCESSING } from './Constants.js';

/**
 * 將File對象轉換為Image對象
 * @param {File} file - 上傳的檔案對象
 * @returns {Promise<HTMLImageElement>} 解析後的Image元素
 */
export function fileToImage(file) {
    return new Promise((resolve, reject) => {
        // 檢查檔案類型
        if (!isValidImageType(file.type)) {
            reject(new Error('不支援的圖片格式'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                resolve(img);
            };
            img.onerror = () => {
                reject(new Error('圖片載入失敗'));
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            reject(new Error('檔案讀取失敗'));
        };
        reader.readAsDataURL(file);
    });
}

/**
 * 檢查檔案類型是否為有效的圖片格式
 * @param {string} fileType - 檔案MIME類型
 * @returns {boolean} 是否為有效的圖片格式
 */
export function isValidImageType(fileType) {
    return [
        FILE_TYPES.PNG,
        FILE_TYPES.JPEG,
        FILE_TYPES.JPG,
        FILE_TYPES.GIF
    ].includes(fileType);
}

/**
 * 調整圖片大小
 * @param {HTMLImageElement} image - 原始圖片元素
 * @param {number} width - 目標寬度
 * @param {number} height - 目標高度
 * @returns {HTMLCanvasElement} 調整大小後的畫布
 */
export function resizeImage(image, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // 繪製調整大小後的圖片
    ctx.drawImage(image, 0, 0, width, height);
    
    return canvas;
}

/**
 * 裁剪圖片
 * @param {HTMLCanvasElement|HTMLImageElement} source - 源圖片或畫布
 * @param {number} x - 裁剪起始x座標
 * @param {number} y - 裁剪起始y座標
 * @param {number} width - 裁剪寬度
 * @param {number} height - 裁剪高度
 * @returns {HTMLCanvasElement} 裁剪後的畫布
 */
export function cropImage(source, x, y, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // 繪製裁剪後的圖片
    ctx.drawImage(source, x, y, width, height, 0, 0, width, height);
    
    return canvas;
}

/**
 * 旋轉圖片
 * @param {HTMLCanvasElement|HTMLImageElement} source - 源圖片或畫布
 * @param {number} angle - 旋轉角度（度）
 * @returns {HTMLCanvasElement} 旋轉後的畫布
 */
export function rotateImage(source, angle) {
    // 轉換角度為弧度
    const radians = (angle * Math.PI) / 180;
    
    // 計算旋轉後的尺寸
    const sourceWidth = source.width || source.naturalWidth;
    const sourceHeight = source.height || source.naturalHeight;
    
    // 根據旋轉角度計算新畫布尺寸
    const abs_cos = Math.abs(Math.cos(radians));
    const abs_sin = Math.abs(Math.sin(radians));
    const newWidth = sourceWidth * abs_cos + sourceHeight * abs_sin;
    const newHeight = sourceWidth * abs_sin + sourceHeight * abs_cos;
    
    // 創建新畫布
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    
    // 平移到新畫布中心
    ctx.translate(newWidth / 2, newHeight / 2);
    // 旋轉
    ctx.rotate(radians);
    // 繪製圖片，使其中心對齊
    ctx.drawImage(
        source,
        -sourceWidth / 2,
        -sourceHeight / 2,
        sourceWidth,
        sourceHeight
    );
    
    return canvas;
}

/**
 * 調整圖片亮度
 * @param {HTMLCanvasElement|HTMLImageElement} source - 源圖片或畫布
 * @param {number} value - 亮度調整值 (-100 到 100)
 * @returns {HTMLCanvasElement} 調整後的畫布
 */
export function adjustBrightness(source, value) {
    const canvas = document.createElement('canvas');
    const sourceWidth = source.width || source.naturalWidth;
    const sourceHeight = source.height || source.naturalHeight;
    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(source, 0, 0);
    
    // 獲取圖片數據
    const imageData = ctx.getImageData(0, 0, sourceWidth, sourceHeight);
    const data = imageData.data;
    
    // 調整亮度的實際值 (-255 到 255)
    const brightness = Math.floor(value * 2.55);
    
    // 處理每個像素
    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(data[i] + brightness);     // R
        data[i + 1] = clamp(data[i + 1] + brightness); // G
        data[i + 2] = clamp(data[i + 2] + brightness); // B
    }
    
    // 將處理後的數據放回畫布
    ctx.putImageData(imageData, 0, 0);
    
    return canvas;
}

/**
 * 調整圖片對比度
 * @param {HTMLCanvasElement|HTMLImageElement} source - 源圖片或畫布
 * @param {number} value - 對比度調整值 (-100 到 100)
 * @returns {HTMLCanvasElement} 調整後的畫布
 */
export function adjustContrast(source, value) {
    const canvas = document.createElement('canvas');
    const sourceWidth = source.width || source.naturalWidth;
    const sourceHeight = source.height || source.naturalHeight;
    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(source, 0, 0);
    
    // 獲取圖片數據
    const imageData = ctx.getImageData(0, 0, sourceWidth, sourceHeight);
    const data = imageData.data;
    
    // 計算對比度因子
    const contrast = (value / 100 + 1);
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    
    // 處理每個像素
    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(factor * (data[i] - 128) + 128);     // R
        data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128); // G
        data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128); // B
    }
    
    // 將處理後的數據放回畫布
    ctx.putImageData(imageData, 0, 0);
    
    return canvas;
}

/**
 * 將圖片背景設為透明
 * @param {HTMLCanvasElement|HTMLImageElement} source - 源圖片或畫布
 * @param {number} tolerance - 容差值 (0-100)
 * @returns {HTMLCanvasElement} 處理後的畫布
 */
export function makeTransparent(source, tolerance) {
    const canvas = document.createElement('canvas');
    const sourceWidth = source.width || source.naturalWidth;
    const sourceHeight = source.height || source.naturalHeight;
    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(source, 0, 0);
    
    // 獲取圖片數據
    const imageData = ctx.getImageData(0, 0, sourceWidth, sourceHeight);
    const data = imageData.data;
    
    // 獲取右下角像素作為參考背景色
    const bgIndex = ((sourceHeight - 1) * sourceWidth + sourceWidth - 1) * 4;
    const bgColor = {
        r: data[bgIndex],
        g: data[bgIndex + 1],
        b: data[bgIndex + 2]
    };
    
    // 計算實際容差值 (0-255)
    const actualTolerance = Math.floor(tolerance * 2.55);
    
    // 處理每個像素
    for (let i = 0; i < data.length; i += 4) {
        // 計算當前像素與背景色的差異
        const diff = colorDifference(
            {r: data[i], g: data[i + 1], b: data[i + 2]},
            bgColor
        );
        
        // 如果差異在容差範圍內，設置為透明
        if (diff <= actualTolerance) {
            data[i + 3] = 0; // Alpha 通道設為 0 (完全透明)
        }
    }
    
    // 將處理後的數據放回畫布
    ctx.putImageData(imageData, 0, 0);
    
    return canvas;
}

/**
 * 將圖片調整為LINE標準貼圖尺寸
 * @param {HTMLCanvasElement|HTMLImageElement} source - 源圖片或畫布
 * @param {string} sizeType - 尺寸類型 ('STANDARD', 'CUSTOM', 'ANIMATION')
 * @returns {HTMLCanvasElement} 標準尺寸的畫布
 */
export function fitToStandardSize(source, sizeType = 'STANDARD') {
    const targetSize = STICKER_SIZES[sizeType];
    if (!targetSize) {
        throw new Error('未知的貼圖尺寸類型');
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = targetSize.width;
    canvas.height = targetSize.height;
    const ctx = canvas.getContext('2d');
    
    // 繪製透明背景的棋盤格
    drawCheckerboard(ctx, canvas.width, canvas.height);
    
    // 計算保持比例的尺寸
    const sourceWidth = source.width || source.naturalWidth;
    const sourceHeight = source.height || source.naturalHeight;
    const scale = Math.min(
        targetSize.width / sourceWidth,
        targetSize.height / sourceHeight
    );
    const scaledWidth = sourceWidth * scale;
    const scaledHeight = sourceHeight * scale;
    
    // 計算居中位置
    const x = (targetSize.width - scaledWidth) / 2;
    const y = (targetSize.height - scaledHeight) / 2;
    
    // 繪製調整大小後的圖片
    ctx.drawImage(source, x, y, scaledWidth, scaledHeight);
    
    return canvas;
}

/**
 * 繪製透明背景棋盤格
 * @param {CanvasRenderingContext2D} ctx - Canvas繪圖上下文
 * @param {number} width - 畫布寬度
 * @param {number} height - 畫布高度
 */
export function drawCheckerboard(ctx, width, height) {
    const size = CANVAS.CHECKERBOARD_SIZE;
    ctx.fillStyle = CANVAS.CHECKERBOARD_LIGHT;
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = CANVAS.CHECKERBOARD_DARK;
    for (let x = 0; x < width; x += size * 2) {
        for (let y = 0; y < height; y += size * 2) {
            ctx.fillRect(x, y, size, size);
            ctx.fillRect(x + size, y + size, size, size);
        }
    }
}

/**
 * 從Canvas獲取數據URL
 * @param {HTMLCanvasElement} canvas - 畫布元素
 * @param {string} type - 輸出格式 ('image/png', 'image/jpeg')
 * @param {number} quality - 輸出品質 (0-1, 僅適用於JPEG)
 * @returns {string} 圖片的數據URL
 */
export function canvasToDataURL(canvas, type = FILE_TYPES.PNG, quality = IMAGE_PROCESSING.EXPORT_QUALITY) {
    return canvas.toDataURL(type, quality);
}

/**
 * 從數據URL創建圖片元素
 * @param {string} dataURL - 圖片的數據URL
 * @returns {Promise<HTMLImageElement>} 解析後的Image元素
 */
export function dataURLToImage(dataURL) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.onerror = () => {
            reject(new Error('從數據URL創建圖片失敗'));
        };
        img.src = dataURL;
    });
}

/**
 * 計算兩個顏色之間的差異值
 * @param {Object} color1 - 第一個顏色 {r, g, b}
 * @param {Object} color2 - 第二個顏色 {r, g, b}
 * @returns {number} 顏色差異值 (0-441.67)
 */
function colorDifference(color1, color2) {
    // 使用歐氏距離計算RGB差異
    return Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
    );
}

/**
 * 限制數值在0-255範圍內
 * @param {number} value - 輸入值
 * @returns {number} 限制後的值
 */
function clamp(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * 將Canvas轉換為Blob對象
 * @param {HTMLCanvasElement} canvas - 畫布元素
 * @param {string} type - 輸出格式 ('image/png', 'image/jpeg')
 * @param {number} quality - 輸出品質 (0-1, 僅適用於JPEG)
 * @returns {Promise<Blob>} 解析後的Blob對象
 */
export function canvasToBlob(canvas, type = FILE_TYPES.PNG, quality = IMAGE_PROCESSING.EXPORT_QUALITY) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('從Canvas創建Blob失敗'));
                }
            },
            type,
            quality
        );
    });
}

/**
 * 下載Canvas圖片
 * @param {HTMLCanvasElement} canvas - 畫布元素
 * @param {string} filename - 檔案名稱
 * @param {string} type - 輸出格式 ('image/png', 'image/jpeg')
 */
export function downloadCanvas(canvas, filename, type = FILE_TYPES.PNG) {
    canvasToBlob(canvas, type).then(blob => {
        const url = URL.createObjectURL(blob);
        const extension = type === FILE_TYPES.PNG ? '.png' : '.jpg';
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename + extension;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    });
}

/**
 * 常數定義檔案
 * 集中管理應用中使用的各種常數值
 */

/**
 * 貼圖尺寸常數
 */
export const STICKER_SIZES = {
    // LINE官方標準貼圖尺寸
    STANDARD: {
        width: 370,
        height: 320,
        name: '標準'
    },
    // LINE官方大型貼圖尺寸
    CUSTOM: {
        width: 740,
        height: 640,
        name: '自訂'
    },
    // LINE動態貼圖尺寸
    ANIMATION: {
        width: 300,
        height: 270,
        name: '動態'
    }
};

/**
 * 工具類型定義
 */
export const TOOL_TYPES = {
    RESIZE: 'resize',
    CROP: 'crop',
    ROTATE: 'rotate',
    BRIGHTNESS: 'brightness',
    CONTRAST: 'contrast',
    TRANSPARENCY: 'transparency'
};

/**
 * 圖片處理相關常數
 */
export const IMAGE_PROCESSING = {
    // 最大支援圖片尺寸 (像素)
    MAX_IMAGE_SIZE: 2000,
    // 最小支援圖片尺寸 (像素)
    MIN_IMAGE_SIZE: 50,
    // 圖片品質 (用於匯出，值範圍 0-1)
    EXPORT_QUALITY: 0.9,
    // 預設透明度容差值 (0-255)
    DEFAULT_TRANSPARENCY_TOLERANCE: 30,
    // 默認旋轉角度步進
    ROTATION_STEP: 90
};

/**
 * 檔案類型常數
 */
export const FILE_TYPES = {
    PNG: 'image/png',
    JPEG: 'image/jpeg',
    JPG: 'image/jpg',
    GIF: 'image/gif'
};

/**
 * 歷史記錄相關常數
 */
export const HISTORY = {
    // 最大歷史記錄數量
    MAX_HISTORY_STATES: 20,
    // 歷史記錄操作類型
    ACTIONS: {
        RESIZE: 'resize',
        CROP: 'crop',
        ROTATE: 'rotate',
        BRIGHTNESS: 'brightness',
        CONTRAST: 'contrast',
        TRANSPARENCY: 'transparency',
        LOAD_IMAGE: 'loadImage'
    }
};

/**
 * 通知相關常數
 */
export const NOTIFICATION = {
    // 通知類型
    TYPES: {
        SUCCESS: 'success',
        ERROR: 'error',
        INFO: 'info',
        WARNING: 'warning'
    },
    // 通知顯示時間 (毫秒)
    DISPLAY_DURATION: 3000
};

/**
 * 裁剪預設比例類型
 */
export const CROP_PRESETS = {
    FREE: 'free',
    SQUARE: '1:1',
    STANDARD_4_3: '4:3',
    WIDE_16_9: '16:9',
    LINE_STICKER: '370:320'  // LINE標準貼圖比例
};

/**
 * 圖片效果處理相關常數
 */
export const EFFECTS = {
    // 亮度調整範圍
    BRIGHTNESS: {
        MIN: -100,
        MAX: 100,
        DEFAULT: 0
    },
    // 對比度調整範圍
    CONTRAST: {
        MIN: -100,
        MAX: 100,
        DEFAULT: 0
    },
    // 旋轉角度範圍
    ROTATION: {
        MIN: -180,
        MAX: 180,
        DEFAULT: 0
    },
    // 透明度容差範圍
    TRANSPARENCY: {
        MIN: 0,
        MAX: 100,
        DEFAULT: 30
    }
};

/**
 * Canvas相關常數
 */
export const CANVAS = {
    // 背景顏色
    BACKGROUND_COLOR: '#f0f0f0',
    // 透明背景棋盤格色
    CHECKERBOARD_LIGHT: '#ffffff',
    CHECKERBOARD_DARK: '#e0e0e0',
    // 棋盤格尺寸
    CHECKERBOARD_SIZE: 10
};

/**
 * 檔案名稱相關常數
 */
export const FILE_NAMES = {
    // 默認下載檔案名稱
    DEFAULT_DOWNLOAD: 'line-sticker',
    // 檔案後綴名
    EXTENSIONS: {
        PNG: '.png',
        JPG: '.jpg'
    }
};

/**
 * DOM元素ID常數
 */
export const DOM_IDS = {
    // 主要元素
    MAIN_CANVAS: 'mainCanvas',
    TOOL_OPTIONS_PANEL: 'toolOptionsPanel',
    LOADING_OVERLAY: 'loadingOverlay',
    NOTIFICATION: 'notification',
    
    // 按鈕
    EXPORT_BTN: 'exportBtn',
    UNDO_BTN: 'undoBtn',
    REDO_BTN: 'redoBtn',
    
    // 上傳相關
    IMAGE_UPLOAD: 'imageUpload',
    
    // 選項相關
    STICKER_SIZE_SELECT: 'stickerSizeSelect'
};

/**
 * 錯誤訊息常數
 */
export const ERROR_MESSAGES = {
    IMAGE_LOAD_FAILED: '圖片載入失敗',
    INVALID_IMAGE_TYPE: '不支援的圖片格式',
    IMAGE_TOO_LARGE: '圖片尺寸過大',
    CROP_INVALID_PARAMETERS: '無效的裁剪參數',
    EXPORT_FAILED: '匯出失敗',
    CANVAS_NOT_SUPPORTED: '您的瀏覽器不支援Canvas',
    NO_IMAGE_LOADED: '請先上傳圖片'
};

/**
 * 成功訊息常數
 */
export const SUCCESS_MESSAGES = {
    IMAGE_LOADED: '圖片已成功載入',
    EXPORT_COMPLETE: '貼圖已成功匯出',
    OPERATION_COMPLETE: '操作已完成'
};

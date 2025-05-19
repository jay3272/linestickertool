# LINE貼圖製作工具

一個基於網頁的LINE貼圖創建與編輯工具，讓您無需安裝專業軟體就能輕鬆製作LINE貼圖。

![LINE貼圖製作工具](https://via.placeholder.com/800x400?text=LINE+貼圖製作工具)

## 功能特色

- **簡單易用**：直覺的界面設計，無需專業設計技能
- **跨平台**：支援所有主流瀏覽器，無需下載安裝
- **符合LINE規格**：自動調整尺寸符合LINE貼圖的官方標準
- **即時編輯**：所見即所得的編輯體驗

## 目前功能

- ✅ 圖片上傳：支援PNG、JPG、GIF等常見格式
- ✅ 基本調整：尺寸、旋轉、裁剪
- ✅ 圖像效果：亮度、對比度調整
- ✅ 輸出處理：支援透明背景、標準化尺寸
- ✅ 下載功能：支援PNG、JPG格式下載

## 檔案結構

```
├── index.html
├── style.css
├── js/
│   ├── main.js                    # 主程式入口
│   ├── core/
│   │   ├── EditorApp.js           # 核心應用類
│   │   ├── CanvasManager.js       # 畫布管理
│   │   ├── HistoryManager.js      # 歷史記錄管理
│   │   └── UIManager.js           # UI介面管理
│   ├── tools/
│   │   ├── BaseTool.js            # 工具基礎類
│   │   ├── ResizeTool.js          # 調整大小工具
│   │   ├── CropTool.js            # 裁剪工具
│   │   ├── RotateTool.js          # 旋轉工具
│   │   ├── BrightnessTool.js      # 亮度調整工具
│   │   ├── ContrastTool.js        # 對比度調整工具
│   │   └── TransparencyTool.js    # 透明背景工具
│   ├── utils/
│   │   ├── Constants.js           # 常數定義
│   │   ├── ImageHelper.js         # 圖片處理函數
│   │   └── DomHelper.js           # DOM操作輔助函數
│   └── components/
│       ├── CropSizeOptions.js     # 裁剪尺寸選項組件
│       ├── CropGuide.js           # 裁剪指南組件
│       └── HistoryControls.js     # 歷史控制組件
```

## 環境需求

- 支援HTML5的現代瀏覽器（Chrome、Firefox、Safari、Edge等）
- 建議使用桌面設備以獲得最佳編輯體驗

## 快速開始

1. 複製本專案到您的網站伺服器或本地開發環境
   ```bash
   git clone https://github.com/yourusername/line-sticker-creator.git
   ```

2. 開啟`index.html`文件，或通過本地伺服器訪問
   ```bash
   # 如果您有Python，可以快速啟動一個本地伺服器
   python -m http.server 8000
   ```

3. 使用瀏覽器訪問 `http://localhost:8000`

## 使用指南

### 上傳圖片

1. 點擊「選擇圖片」按鈕上傳您想要製作成貼圖的圖片
2. 支援格式：PNG、JPG、GIF
3. 建議上傳尺寸接近370×320像素的圖片以獲得最佳效果

### 編輯圖片

上傳後，您可以使用以下功能編輯圖片：

- **調整尺寸**：點擊「調整尺寸」按鈕修改圖片大小
- **裁剪**：移除不需要的部分（開發中）
- **旋轉**：每次點擊旋轉90度
- **亮度調整**：增加或減少圖片亮度（-100到100的範圍）
- **對比度**：調整圖片對比度（-100到100的範圍）
- **透明背景**：移除白色背景（開發中）

### 下載貼圖

1. 完成編輯後，點擊「下載」按鈕
2. 選擇檔案格式（PNG或JPG）
3. 圖片將自動調整為LINE貼圖標準尺寸（370×320像素）並下載到您的裝置

## 開發中功能

- 🚧 批量處理：一次處理多個貼圖
- 🚧 貼圖預覽：模擬在LINE聊天中的顯示效果
- 🚧 更多濾鏡：豐富的濾鏡和特效選項
- 🚧 文字添加：在貼圖上添加文字
- 🚧 貼圖組管理：建立和管理貼圖組

## 技術架構

- **前端框架**：純HTML5、CSS3和JavaScript
- **圖像處理**：Fabric.js
- **檔案處理**：HTML5 File API

## 貢獻指南

我們歡迎社區貢獻！如果您有興趣改進此工具，請：

1. Fork本專案
2. 創建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟一個Pull Request

## 授權協議

本項目採用MIT授權協議 - 詳情請參閱 [LICENSE](LICENSE) 文件

## 聯絡方式

如有問題或建議，請通過以下方式聯絡：

- 電子郵件：your.email@example.com
- 專案Issues：[GitHub Issues](https://github.com/yourusername/line-sticker-creator/issues)

## 常見問題

### Q: 我可以上傳什麼格式的圖片？
A: 目前支援PNG、JPG和GIF格式。

### Q: LINE貼圖的標準尺寸是多少？
A: LINE貼圖的標準尺寸是370×320像素。本工具會自動調整您的圖片以符合此標準。

### Q: 是否支持動態貼圖？
A: 目前版本尚不支援動態貼圖（APNG）的編輯，此功能將在未來版本中加入。

### Q: 如何發布我製作的貼圖到LINE STORE？
A: 您需要將下載的貼圖上傳至LINE Creators Market，具體步驟請參考[LINE官方指南](https://creator.line.me)。

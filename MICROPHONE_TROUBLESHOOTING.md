# 麥克風故障排除指南 / Microphone Troubleshooting Guide

## 我已經修正的問題 / Issues Fixed

### ✅ 1. 音頻格式兼容性 / Audio Format Compatibility
- **問題**: 某些瀏覽器不支援 `audio/webm;codecs=opus` 格式
- **修正**: 現在會自動檢測並使用瀏覽器支援的格式
- **支援格式**: webm, ogg, mp4, mpeg

### ✅ 2. 錄音數據捕獲 / Recording Data Capture
- **問題**: 沒有設置 timeslice，可能導致錄音失敗
- **修正**: 現在每秒捕獲一次數據 `mediaRecorder.start(1000)`

### ✅ 3. 除錯工具 / Debug Tools
- **新增**: "Test Microphone Before Recording" 按鈕
- **功能**: 檢查麥克風權限和可用性

## 如何測試麥克風 / How to Test Microphone

### 步驟 1: 檢查瀏覽器支援 / Step 1: Check Browser Support

**建議使用的瀏覽器 / Recommended Browsers:**
- ✅ Chrome (最佳支援 / Best Support)
- ✅ Edge
- ✅ Firefox
- ⚠️ Safari (需要 iOS 14.5+ 或 macOS Big Sur+)

### 步驟 2: 檢查麥克風權限 / Step 2: Check Microphone Permission

**Chrome/Edge:**
1. 點擊地址欄左側的鎖頭圖示
2. 檢查「麥克風」權限
3. 確保設置為「允許」/ Set to "Allow"

**Firefox:**
1. 點擊地址欄左側的鎖頭或盾牌圖示
2. 點擊「權限」
3. 找到麥克風，點擊「X」重設權限，然後重新授權

**Safari:**
1. Safari → 設定 → 網站
2. 麥克風 → 找到 localhost
3. 設置為「允許」

### 步驟 3: 使用測試按鈕 / Step 3: Use Test Button

1. 訪問 http://localhost:3000/practice
2. 點擊「Test Microphone Before Recording」按鈕
3. 查看測試結果：
   - ✅ 綠色訊息 = 麥克風正常
   - ❌ 紅色訊息 = 有問題，查看錯誤訊息

### 步驟 4: 開始錄音 / Step 4: Start Recording

1. 點擊「Start Recording」按鈕
2. 如果瀏覽器詢問權限，點擊「允許」
3. 開始說話
4. 點擊「Stop」停止錄音
5. 檢查瀏覽器的控制台 (F12) 查看除錯訊息：
   - "Using mime type: audio/webm" (或其他格式)
   - "Recording started successfully"
   - "Recording stopped, blob size: XXXX"

## 常見問題 / Common Issues

### ❌ "NotAllowedError: Permission denied"
**原因**: 用戶拒絕麥克風權限
**解決**:
1. 重新載入頁面
2. 當瀏覽器詢問時點擊「允許」
3. 或按照「步驟 2」重設權限

### ❌ "NotFoundError: Requested device not found"
**原因**: 沒有檢測到麥克風
**解決**:
1. 檢查麥克風是否已連接
2. 檢查系統設定中麥克風是否啟用
3. 重新啟動瀏覽器

### ❌ "NotReadableError: Could not start audio source"
**原因**: 麥克風被其他應用程式使用
**解決**:
1. 關閉其他使用麥克風的應用程式（如 Zoom, Teams, Discord）
2. 重新載入頁面

### ❌ 錄音完成但 blob size 是 0
**原因**: 可能的音頻格式問題
**解決**:
1. 查看控制台中的 "Using mime type" 訊息
2. 嘗試使用不同的瀏覽器
3. 確保說話時間超過 1 秒

### ❌ HTTPS 警告
**原因**: 某些瀏覽器需要 HTTPS 才能使用麥克風
**解決**:
- 開發環境：localhost 通常可以使用 HTTP
- 生產環境：必須使用 HTTPS

## 系統設定檢查 / System Settings Check

### macOS:
1. 系統偏好設定 → 安全性與隱私 → 隱私
2. 麥克風 → 確保瀏覽器有權限

### Windows:
1. 設定 → 隱私 → 麥克風
2. 允許應用程式存取麥克風
3. 確保瀏覽器在清單中

### Linux:
1. 檢查 PulseAudio 或 ALSA 設定
2. 確保用戶在 `audio` 群組中

## 開發者除錯 / Developer Debug

### 在瀏覽器控制台檢查:

```javascript
// 檢查 MediaRecorder 支援
console.log('MediaRecorder支援:', typeof MediaRecorder !== 'undefined');

// 檢查麥克風可用性
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✓ 麥克風可用');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error('✗ 麥克風錯誤:', err));

// 檢查支援的音頻格式
const types = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4'
];
types.forEach(type => {
  console.log(type, '支援:', MediaRecorder.isTypeSupported(type));
});
```

## 查看實時日誌 / View Real-time Logs

錄音時，打開瀏覽器控制台 (F12) 查看實時日誌：
1. "Using mime type: ..." - 使用的音頻格式
2. "Recording started successfully" - 錄音開始
3. "Recording stopped, blob size: ..." - 錄音結束和檔案大小

## 還是無法運作？ / Still Not Working?

1. **清除瀏覽器快取**: Ctrl+Shift+Del (Windows) 或 Cmd+Shift+Del (Mac)
2. **重新啟動瀏覽器**: 完全關閉並重新開啟
3. **更新瀏覽器**: 確保使用最新版本
4. **嘗試其他瀏覽器**: Chrome 通常有最好的支援
5. **檢查 HTTPS**: 在生產環境確保使用 HTTPS

## 需要更多幫助？ / Need More Help?

如果問題持續存在，請提供以下資訊：
- 瀏覽器名稱和版本
- 作業系統
- 控制台中的完整錯誤訊息
- 測試麥克風按鈕的結果

# uniapp-image-tools

## 核心功能
- **路径转换**：自动处理不同平台的文件路径格式
- **Base64互转**：支持文件路径与Base64数据的双向转换
- **多平台兼容**：支持浏览器、uni-app、微信小程序三端运行

## 安装使用
```bash
npm install uniapp-image-tools
```
```typescript
import { pathToBase64, base64ToPath } from 'uniapp-image-tools'

// 浏览器环境示例
const img = document.getElementById('demo-img')
img.src = await pathToBase64('./logo.png')
```

## API文档

### pathToBase64(path: string): Promise<string>
- 参数：文件路径（支持相对路径和绝对路径）
- 返回值：包含Base64数据的DataURL字符串

### base64ToPath(base64: string): Promise<string>
- 参数：标准Base64字符串或DataURL
- 返回值：平台对应的本地文件路径

## 运行环境要求
- TypeScript 4.0+
- Node.js 14+
- 支持平台：
  - 浏览器（支持FileAPI的现代浏览器）
  - uni-app（需集成5+ SDK）
  - 微信小程序（基础库2.10.0+）

## 多平台兼容性
| 平台        | 支持版本               | 依赖条件                  |
|-----------|--------------------|-----------------------|
| 浏览器       | Chrome 76+         | 支持FileReader API      |
| uni-app    | HBuilderX 3.1.0+   | 需添加5+模块依赖            |
| 微信小程序    | 基础库2.10.0+       | 需开启「增强编译」选项          |

## 注意事项
1. iOS平台需要配置manifest.json的本地路径访问权限
2. 微信小程序需在app.json中声明writeFile权限
3. 浏览器环境需处理跨域问题
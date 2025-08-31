# GitHub Pages 部署故障排除指南

## 🚨 当前问题
网站 https://tangyongfeng.github.io/IAFEI/ 显示 404 错误

## 🔍 可能的原因和解决方案

### 1. GitHub Pages 设置检查
**请在 GitHub 仓库中检查以下设置：**

1. 访问 https://github.com/tangyongfeng/IAFEI/settings/pages
2. 确保 "Source" 设置为：
   - **Source**: Deploy from a branch
   - **Branch**: master
   - **Folder**: / (root)

### 2. 仓库可见性检查
确保仓库设置为 **Public**：
1. 访问 https://github.com/tangyongfeng/IAFEI/settings
2. 滚动到底部的 "Danger Zone"
3. 确认仓库是 "Public" 状态

### 3. GitHub Actions 部署检查
1. 访问 https://github.com/tangyongfeng/IAFEI/actions
2. 查看是否有部署工作流正在运行或失败
3. 如果有失败，点击查看错误日志

### 4. 文件结构验证
✅ 已确认文件存在：
- `index.html` ✅
- `css/styles.css` ✅
- `js/main.js` ✅
- `.nojekyll` ✅ (禁用 Jekyll 处理)
- `test.html` ✅ (测试页面)

### 5. 立即测试方法

**方法 1**: 尝试访问测试页面
```
https://tangyongfeng.github.io/IAFEI/test.html
```

**方法 2**: 直接访问 index.html
```
https://tangyongfeng.github.io/IAFEI/index.html
```

### 6. 缓存清除
尝试以下方法清除缓存：
- 硬刷新: Ctrl+F5 (Windows) 或 Cmd+Shift+R (Mac)
- 无痕模式打开网址
- 清除浏览器缓存

### 7. DNS 传播等待
GitHub Pages 可能需要几分钟到几小时来传播更改。

## 🛠️ 立即修复步骤

### 步骤 1: 检查 GitHub Pages 设置
1. 登录 GitHub
2. 访问仓库: https://github.com/tangyongfeng/IAFEI
3. 点击 "Settings" 选项卡
4. 滚动到 "Pages" 部分
5. 确保设置为从 master 分支部署

### 步骤 2: 启用 GitHub Actions 部署（推荐）
如果使用传统分支部署有问题，可以切换到 GitHub Actions：
1. 在 Pages 设置中
2. 选择 "Source": GitHub Actions
3. 系统会自动检测我们的工作流文件

### 步骤 3: 强制重新部署
在仓库页面执行以下操作之一：
- 编辑任意文件并提交（如在 README.md 添加一个空格）
- 在 Actions 页面手动触发工作流

## 📞 如果问题仍然存在

### 检查清单
- [ ] 仓库是否为 Public
- [ ] GitHub Pages 是否已启用
- [ ] 分支设置是否正确 (master)
- [ ] Actions 工作流是否成功运行
- [ ] 是否等待了足够的传播时间 (5-10分钟)

### 备用方案
如果 GitHub Pages 仍有问题，可以考虑：
1. **Netlify**: 拖拽文件夹直接部署
2. **Vercel**: 连接 GitHub 仓库自动部署
3. **GitHub Codespaces**: 在线测试环境

## 📅 最新更新
- 2025-08-31 16:57: 添加了 `.nojekyll` 文件
- 2025-08-31 16:58: 添加了 GitHub Actions 工作流
- 2025-08-31 16:59: 创建了测试页面 `test.html`

---

**建议**: 首先检查 GitHub Pages 设置，然后等待 5-10 分钟让更改生效。

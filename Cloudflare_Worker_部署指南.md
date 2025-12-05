# Cloudflare Worker 部署指南

本指南将详细介绍如何部署 Cloudflare Worker 版本的学生随机抽选系统，包括**手动部署**和**自动部署**两种方式。

## 一、项目结构概述

本项目是一个学生随机抽选系统，使用 Cloudflare Worker 实现，主要包含以下核心文件：

- `worker.js` - Worker 主逻辑文件，处理 API 请求和静态文件服务
- `wrangler.json` - Worker 配置文件
- `student_picker.html` - 前端页面
- `package.json` - 项目依赖和脚本配置

## 二、前提条件

在部署前，请确保您已完成以下准备工作：

1. **Cloudflare 账号** - 注册并登录 [Cloudflare](https://www.cloudflare.com/)
2. **Node.js 环境** - 安装 Node.js 16+（推荐 18+）
3. **Wrangler CLI** - Cloudflare Worker 的命令行工具
4. **GitHub 账号**（仅自动部署需要） - 用于托管代码和配置 GitHub Actions

## 三、手动部署（使用 Wrangler CLI）

### 1. 安装 Wrangler CLI

如果尚未安装 Wrangler CLI，可以通过 npm 安装：

```bash
npm install -g wrangler
```

或者使用项目本地的 Wrangler（已包含在 package.json 中）：

```bash
npm install
```

### 2. 配置 Wrangler

#### 2.1 登录 Cloudflare

运行以下命令登录 Cloudflare 账号：

```bash
wrangler login
```

#### 2.2 配置 KV 命名空间

项目需要一个 Cloudflare KV 命名空间来存储学生数据：

1. 创建 KV 命名空间：
   ```bash
   wrangler kv:namespace create STUDENT_DATA
   ```

2. 将返回的命名空间 ID 更新到 `wrangler.json` 文件中：
   ```json
   "kv_namespaces": [
     {
       "binding": "STUDENT_DATA",
       "id": "YOUR_KV_NAMESPACE_ID"  // 替换为实际的命名空间 ID
     }
   ]
   ```

### 3. 部署 Worker

使用以下命令部署 Worker：

```bash
# 使用全局 Wrangler
wrangler publish

# 或使用项目本地脚本
npm run deploy
```

部署成功后，您将获得一个 Worker URL，类似：`https://student-picker-app.YOUR_SUBDOMAIN.workers.dev`

## 四、自动部署（使用 GitHub Actions）

本项目已配置 GitHub Actions 工作流，可以在代码推送到 GitHub 时自动部署到 Cloudflare Worker。

### 1. 配置 Cloudflare 凭证

#### 1.1 获取 Cloudflare Account ID

1. 登录 Cloudflare 控制台
2. 点击右上角的用户图标 → 选择「账户主页」
3. 在「概述」页面中找到「账户 ID」

#### 1.2 创建 Cloudflare API Token

1. 登录 Cloudflare 控制台
2. 点击右上角的用户图标 → 选择「我的个人资料」
3. 在左侧菜单中选择「API 令牌」
4. 点击「创建令牌」
5. 选择「编辑 Cloudflare Workers」模板
6. 配置权限：
   - 账户资源：选择您的账户
   - 区域资源：选择「所有区域」
7. 点击「继续以显示摘要」→ 「创建令牌」
8. 保存生成的 API 令牌（仅显示一次）

### 2. 配置 GitHub Secrets

1. 登录 GitHub，进入您的仓库
2. 点击「Settings」→ 「Secrets and variables」→ 「Actions」
3. 点击「New repository secret」
4. 创建以下两个 Secrets：
   - `CLOUDFLARE_API_TOKEN`：输入您的 Cloudflare API 令牌
   - `CLOUDFLARE_ACCOUNT_ID`：输入您的 Cloudflare 账户 ID

### 3. 触发自动部署

将代码推送到 GitHub 的 `master` 分支（或 `main` 分支，需在 `.github/workflows/deploy-worker.yml` 中配置），GitHub Actions 将自动：

1. 检出代码
2. 设置 Node.js 环境
3. 安装依赖
4. 部署到 Cloudflare Worker

您可以在 GitHub 仓库的「Actions」标签页查看部署状态。

## 五、配置说明

### 1. wrangler.json 配置

```json
{
  "name": "student-picker-app",        // Worker 名称
  "main": "worker.js",                 // 入口文件
  "compatibility_date": "2023-05-15",  // 兼容性日期
  "assets": {
    "directory": ".",                 // 静态文件目录
    "binding": "ASSETS"                // 静态文件绑定名称
  },
  "kv_namespaces": [                    // KV 命名空间配置
    {
      "binding": "STUDENT_DATA",       // KV 绑定名称
      "id": "YOUR_KV_NAMESPACE_ID"     // KV 命名空间 ID
    }
  ]
}
```

### 2. Worker 功能说明

`worker.js` 实现了以下功能：

- **API 接口**：
  - `GET /api/students` - 获取所有学生数据
  - `POST /api/students` - 添加/更新学生数据
  - `PUT /api/students/all` - 保存所有学生数据
  - `DELETE /api/students/all` - 删除所有学生数据
  - `GET /api/backup` - 下载学生数据备份

- **静态文件服务**：提供 HTML、CSS、JavaScript 等静态文件

- **CORS 支持**：允许跨域请求

## 六、常见问题与解决方案

### 1. KV 命名空间配置错误

**症状**：部署时出现 `Missing binding for KV_NAMESPACE` 错误

**解决方案**：
- 确保已创建 KV 命名空间
- 确保 `wrangler.json` 中的命名空间 ID 正确
- 确保绑定名称与代码中使用的一致

### 2. API 令牌权限不足

**症状**：部署时出现 `Invalid API token permissions` 错误

**解决方案**：
- 确保 API 令牌具有「编辑 Cloudflare Workers」权限
- 重新生成 API 令牌并更新 GitHub Secrets

### 3. 静态文件无法访问

**症状**：访问 Worker URL 时无法加载页面

**解决方案**：
- 确保 `wrangler.json` 中配置了正确的静态文件目录
- 检查文件路径是否正确

### 4. 自动部署失败

**症状**：GitHub Actions 运行失败

**解决方案**：
- 检查 GitHub Secrets 是否正确配置
- 查看 Actions 日志以定位具体错误
- 确保 `package.json` 中的依赖配置正确

## 七、访问应用

部署成功后，您可以通过以下方式访问应用：

1. **Worker URL**：`https://student-picker-app.YOUR_SUBDOMAIN.workers.dev`
2. **自定义域名**（可选）：配置 Cloudflare 自定义域名指向 Worker

## 八、后续维护

- **更新代码**：修改代码后重新部署（手动或自动）
- **数据备份**：定期通过 `GET /api/backup` 接口备份学生数据
- **监控**：在 Cloudflare 控制台查看 Worker 的请求和错误日志

---

部署完成后，您的学生随机抽选系统将在全球范围内快速可用！如有任何问题，请参考 Cloudflare [官方文档](https://developers.cloudflare.com/workers/) 或提交 Issue。
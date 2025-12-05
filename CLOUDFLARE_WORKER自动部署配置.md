# Cloudflare Worker 自动部署配置说明

本文档将指导您如何配置 GitHub Actions，实现当 GitHub 仓库代码变化时，自动同步并部署到 Cloudflare Worker。

## 一、已完成的配置

我们已经为您创建了以下文件：

1. **自动部署工作流**：
   - 文件路径：`.github/workflows/deploy-worker.yml`
   - 功能：监听 `master` 分支的代码变化，自动部署到 Cloudflare Worker
   - 监听文件：`worker.js`、`wrangler.json`、工作流文件本身

2. **项目配置**：
   - `package.json`：已包含 Wrangler 依赖和部署脚本
   - `wrangler.json`：Worker 配置文件

## 二、需要您完成的配置

### 1. 获取 Cloudflare API 凭证

您需要在 Cloudflare 账号中获取以下凭证：

#### 1.1 Cloudflare Account ID
- 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)
- 点击左侧菜单底部的 **账户** 图标
- 在 **概述** 页面中找到 **账户 ID**
- 复制该 ID

#### 1.2 Cloudflare API Token
- 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)
- 点击右上角的个人头像 → **我的个人资料**
- 点击左侧菜单的 **API 令牌**
- 点击 **创建令牌**
- 选择 **使用模板** → **编辑 Cloudflare Workers**
- 填写令牌名称（如：`github-actions-worker-deploy`）
- 确保权限包含：
  - Workers 脚本：编辑
  - Workers KV 存储：编辑（如果使用了 KV）
  - 账户资源：选择您的账户
- 点击 **创建令牌**
- 复制生成的 API 令牌（请妥善保存，离开页面后将无法再次查看）

### 2. 配置 GitHub Secrets

将获取的 Cloudflare 凭证添加到 GitHub 仓库的 Secrets 中：

1. 访问您的 GitHub 仓库：https://github.com/waynezyx007/student-picker-app.git
2. 点击仓库顶部的 **Settings**（设置）
3. 点击左侧菜单的 **Secrets and variables** → **Actions**
4. 点击 **New repository secret**

   - 创建第一个 Secret：
     - 名称：`CLOUDFLARE_API_TOKEN`
     - 值：粘贴您获取的 Cloudflare API Token
     - 点击 **Add secret**

   - 创建第二个 Secret：
     - 名称：`CLOUDFLARE_ACCOUNT_ID`
     - 值：粘贴您获取的 Cloudflare Account ID
     - 点击 **Add secret**

### 3. 验证 wrangler.json 配置

请确保 `wrangler.json` 文件中的配置正确：

```json
{
  "name": "student-picker-app",
  "main": "worker.js",
  "compatibility_date": "2023-05-15",
  "assets": {
    "directory": ".",
    "binding": "ASSETS"
  },
  "kv_namespaces": [
    {
      "binding": "STUDENT_DATA",
      "id": "YOUR_KV_NAMESPACE_ID"
    }
  ]
}
```

> **注意**：如果您使用了 KV 存储，请将 `YOUR_KV_NAMESPACE_ID` 替换为实际的 KV 命名空间 ID。

## 三、使用方法

配置完成后，自动部署将按以下流程工作：

1. **代码修改**：您在本地修改代码并提交到 GitHub 仓库的 `master` 分支
2. **自动触发**：GitHub Actions 检测到代码变化，自动触发部署工作流
3. **构建部署**：工作流自动完成以下步骤：
   - 检出代码
   - 安装 Node.js 环境
   - 安装项目依赖
   - 使用 Wrangler 部署到 Cloudflare Worker
4. **查看结果**：
   - 访问 GitHub 仓库的 **Actions** 标签页查看部署状态
   - 部署成功后，您的 Cloudflare Worker 将自动更新

## 四、手动部署（可选）

如果需要手动部署，您可以使用以下命令：

```bash
# 安装依赖
npm install

# 部署到 Cloudflare Worker
npm run deploy
```

## 五、检查部署状态

1. **查看 GitHub Actions 日志**：
   - 访问仓库的 **Actions** 标签页
   - 点击对应的工作流运行
   - 点击 **deploy** 任务查看详细日志

2. **查看 Cloudflare Worker 状态**：
   - 登录 Cloudflare 控制台
   - 点击左侧菜单的 **Workers & Pages**
   - 找到您的 Worker（名称：`student-picker-app`）
   - 查看部署历史和状态

## 六、常见问题排查

### 1. 部署失败 - 权限问题
**症状**：GitHub Actions 日志显示权限错误
**解决方案**：
- 检查 Cloudflare API Token 是否具有正确的权限
- 确保 GitHub Secrets 中的凭证正确无误

### 2. 部署失败 - 依赖问题
**症状**：安装依赖时出错
**解决方案**：
- 确保 `package.json` 中的依赖版本正确
- 尝试更新依赖版本

### 3. 部署成功但 Worker 未更新
**症状**：部署日志显示成功，但访问 Worker 时内容未更新
**解决方案**：
- 清除浏览器缓存
- 检查 Worker 是否配置了缓存规则
- 查看 Cloudflare Worker 控制台的部署历史

## 七、联系支持

如果您在配置过程中遇到问题，可以：
1. 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
2. 查看 [GitHub Actions 文档](https://docs.github.com/en/actions)
3. 联系 Cloudflare 或 GitHub 支持

祝您使用愉快！

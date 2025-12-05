# GitHub Actions 自动部署 Cloudflare Worker 详细指南

本指南将**非常具体**地说明如何使用 GitHub Actions 实现 Cloudflare Worker 的自动部署，包括每一步的操作截图说明和详细配置。

## 一、准备工作

在开始配置前，请确保您已完成以下准备：

1. **GitHub 仓库** - 已将项目代码推送到 GitHub
2. **Cloudflare 账号** - 已注册并登录 Cloudflare
3. **Node.js 环境** - 本地已安装 Node.js（用于测试）

## 二、项目配置检查

首先确认项目中已包含以下文件（本项目已预先配置）：

### 1. GitHub Actions 工作流文件

路径：`.github/workflows/deploy-worker.yml`

文件内容（已配置好，无需修改）：

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - master  # 监听 master 分支的推送
    paths:
      - 'worker.js'  # 仅当 Worker 核心文件变化时触发
      - 'wrangler.json'  # 仅当配置文件变化时触发
      - '.github/workflows/deploy-worker.yml'  # 仅当工作流文件变化时触发

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    name: Deploy to Cloudflare Workers
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Install Wrangler
        run: npm install -g wrangler

      - name: Publish to Cloudflare Workers
        run: wrangler publish
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### 2. Wrangler 配置文件

路径：`wrangler.json`

确保已配置好 KV 命名空间（如果需要）：

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
      "id": "YOUR_KV_NAMESPACE_ID"  // 需替换为实际的 KV 命名空间 ID
    }
  ]
}
```

## 三、获取 Cloudflare 凭证

自动部署需要以下两个 Cloudflare 凭证：

### 1. 获取 Cloudflare Account ID

**步骤：**

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)
2. 点击右上角的**用户头像** → 选择**账户主页**
3. 在**概述**页面中，找到**账户 ID**
4. 点击右侧的**复制**按钮复制 Account ID

**截图说明：**
- 位置：页面左侧导航栏 → 「账户主页」→ 「概述」
- 外观：一个 32 字符的字符串，格式类似 `0123456789abcdef0123456789abcdef`

### 2. 创建 Cloudflare API Token

**步骤：**

1. 登录 Cloudflare 控制台
2. 点击右上角的**用户头像** → 选择**我的个人资料**
3. 在左侧菜单中选择**API 令牌**
4. 点击**创建令牌**按钮
5. 选择**编辑 Cloudflare Workers** 模板（不要选择其他模板）
6. 在**权限**部分，确保：
   - **账户** → **Worker 脚本** → **编辑**（已自动勾选）
   - **账户** → **Account Settings** → **Read**（已自动勾选）
7. 在**账户资源**部分：
   - 选择**包括** → **所有账户**（或选择您的特定账户）
8. 在**区域资源**部分：
   - 选择**包括** → **所有区域**（或选择您的特定区域）
9. 点击**继续以显示摘要**按钮
10. 点击**创建令牌**按钮
11. **重要**：复制生成的 API Token（仅显示一次，忘记了需要重新创建）

**截图说明：**
- 模板选择：在「创建 API 令牌」页面，找到「编辑 Cloudflare Workers」模板
- 令牌格式：一个长字符串，格式类似 `abc_def_1234567890abcdef1234567890abcdef1234567890`

## 四、配置 GitHub Secrets

将获取的 Cloudflare 凭证配置到 GitHub 仓库的 Secrets 中：

**步骤：**

1. 登录 GitHub，进入您的仓库页面
2. 点击顶部的**Settings**（设置）选项卡
3. 在左侧菜单中，点击**Secrets and variables** → **Actions**
4. 点击**New repository secret**（新建仓库密钥）按钮
5. 配置第一个 Secret：
   - **Name**：输入 `CLOUDFLARE_API_TOKEN`
   - **Secret**：粘贴您刚才复制的 Cloudflare API Token
   - 点击**Add secret**按钮保存
6. 配置第二个 Secret：
   - 再次点击**New repository secret**按钮
   - **Name**：输入 `CLOUDFLARE_ACCOUNT_ID`
   - **Secret**：粘贴您刚才复制的 Cloudflare Account ID
   - 点击**Add secret**按钮保存

**截图说明：**
- Secrets 位置：仓库主页 → Settings → Secrets and variables → Actions
- 最终效果：在 Actions secrets 列表中，您将看到两个新添加的 Secrets

## 五、GitHub Actions 工作流执行流程

配置完成后，GitHub Actions 将按照以下流程自动执行部署：

### 1. 触发条件

当您向 `master` 分支推送代码，并且修改了以下文件之一时，自动部署将被触发：
- `worker.js`（Worker 主逻辑文件）
- `wrangler.json`（Worker 配置文件）
- `.github/workflows/deploy-worker.yml`（工作流文件本身）

### 2. 执行步骤详解

工作流执行的具体步骤如下（对应 `deploy-worker.yml` 中的配置）：

| 步骤 | 名称 | 操作 | 详细说明 |
|------|------|------|----------|
| 1 | Checkout | 代码检出 | 使用 `actions/checkout@v3` 动作从 GitHub 仓库检出最新代码 |
| 2 | Setup Node.js | 环境配置 | 使用 `actions/setup-node@v3` 动作设置 Node.js 18 环境，并缓存 npm 依赖 |
| 3 | Install dependencies | 安装依赖 | 运行 `npm install` 命令安装项目依赖（包括 Wrangler） |
| 4 | Install Wrangler | 安装 Wrangler | 运行 `npm install -g wrangler` 命令全局安装 Wrangler CLI 工具 |
| 5 | Publish to Cloudflare Workers | 部署 Worker | 运行 `wrangler publish` 命令将 Worker 部署到 Cloudflare |

### 3. 环境变量传递

在部署步骤中，GitHub Actions 会自动将以下环境变量传递给 `wrangler publish` 命令：
- `CLOUDFLARE_API_TOKEN`：来自 GitHub Secret 的 API Token
- `CLOUDFLARE_ACCOUNT_ID`：来自 GitHub Secret 的 Account ID

Wrangler 会自动使用这些环境变量进行身份验证和部署。

## 六、验证自动部署

### 1. 手动触发部署测试

**步骤：**

1. 对 `worker.js` 文件进行一个简单的修改（例如添加一个注释）
2. 使用 Git 提交并推送到 `master` 分支：
   ```bash
git add worker.js
git commit -m "Test automatic deployment"
git push origin master
   ```

### 2. 查看 GitHub Actions 运行状态

**步骤：**

1. 进入 GitHub 仓库页面
2. 点击顶部的**Actions**（动作）选项卡
3. 您将看到一个名为「Deploy to Cloudflare Workers」的工作流正在运行
4. 点击该工作流，查看详细的运行日志
5. 如果所有步骤都显示绿色对勾，则部署成功

**日志说明：**
- 每个步骤的运行时间和输出
- 如果某个步骤失败，会显示错误信息
- 部署成功后，最后一个步骤（Publish to Cloudflare Workers）会显示部署结果

### 3. 验证 Worker 部署

**步骤：**

1. 登录 Cloudflare 控制台
2. 点击左侧导航栏的**Workers & Pages**
3. 找到您的 Worker（名称为 `student-picker-app`）
4. 检查**上次部署时间**是否与 GitHub Actions 运行时间一致
5. 点击**预览**按钮，访问 Worker URL，验证功能是否正常

## 七、常见问题排查

### 1. API Token 权限不足

**错误信息：**
```
Error: Invalid API token permissions. Please ensure the token has the necessary permissions.
```

**解决方案：**
- 确认 API Token 使用了**编辑 Cloudflare Workers** 模板
- 确认 API Token 具有「账户」→「Worker 脚本」→「编辑」权限
- 重新创建 API Token 并更新 GitHub Secret

### 2. Account ID 错误

**错误信息：**
```
Error: Invalid account ID. Please check your CLOUDFLARE_ACCOUNT_ID secret.
```

**解决方案：**
- 确认 Account ID 复制正确（没有多余的空格或字符）
- 在 Cloudflare 控制台重新复制 Account ID
- 更新 GitHub Secret 中的 `CLOUDFLARE_ACCOUNT_ID`

### 3. 依赖安装失败

**错误信息：**
```
npm ERR! Failed to install dependencies.
```

**解决方案：**
- 检查 `package.json` 中的依赖配置是否正确
- 确保 `wrangler` 版本与 Cloudflare Workers 兼容（推荐使用最新稳定版）
- 在本地测试 `npm install` 是否正常工作

### 4. KV 命名空间配置错误

**错误信息：**
```
Error: Missing binding for KV_NAMESPACE "STUDENT_DATA".
```

**解决方案：**
- 确认已在 Cloudflare 控制台创建了 KV 命名空间
- 确认 `wrangler.json` 中的 KV 命名空间 ID 配置正确
- 确认命名空间 ID 与 Cloudflare 控制台中的 ID 一致

## 八、高级配置选项

### 1. 修改触发分支

如果您的默认分支不是 `master`（例如是 `main`），需要修改 `deploy-worker.yml` 中的 `branches` 配置：

```yaml
on:
  push:
    branches:
      - main  # 将 master 改为 main
```

### 2. 修改监听文件

如果您想在其他文件修改时也触发部署，可以添加到 `paths` 配置中：

```yaml
on:
  push:
    branches:
      - master
    paths:
      - 'worker.js'
      - 'wrangler.json'
      - 'student_picker.html'  # 添加新的监听文件
      - 'package.json'  # 添加新的监听文件
```

### 3. 添加部署通知

可以添加 Slack、Email 等通知，当部署成功或失败时发送通知：

```yaml
- name: Notify Slack on success
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: success
    fields: repo,message,commit,author,action,eventName,ref,workflow
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

- name: Notify Slack on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    fields: repo,message,commit,author,action,eventName,ref,workflow
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 九、总结

通过以上步骤，您已经成功配置了 GitHub Actions 自动部署 Cloudflare Worker：

1. ✅ 项目已包含 GitHub Actions 配置文件
2. ✅ 获取了 Cloudflare Account ID 和 API Token
3. ✅ 在 GitHub 仓库中配置了 Secrets
4. ✅ 了解了 GitHub Actions 工作流的执行流程
5. ✅ 验证了自动部署功能

现在，每当您向 `master` 分支推送代码并修改了相关文件时，GitHub Actions 将自动部署您的 Cloudflare Worker，实现了代码变更与 Worker 部署的无缝同步。

如需进一步优化，可以考虑：
- 添加部署前的测试步骤
- 配置部署环境（开发/生产）
- 添加回滚机制
- 集成监控和告警

祝您使用愉快！
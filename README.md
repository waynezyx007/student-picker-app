# 学生抽选系统

这是一个基于Web的学生随机抽选系统，可以帮助教师在课堂上随机选择学生进行提问或互动。

## 功能特点

- 随机抽取学生
- 班级筛选功能
- 科目成绩展示
- 数据导入/导出
- 本地数据存储

## 部署到Cloudflare

### 手动部署

1. 创建Cloudflare账户（如果还没有）
2. 创建一个KV命名空间用于存储数据
3. 使用Wrangler部署：
   ```
   npm install
   npx wrangler deploy
   ```

### 自动部署（推荐）

1. Fork本仓库到你的GitHub账户
2. 在Cloudflare Pages中连接到你的GitHub仓库
3. 配置构建设置：
   - 构建命令：留空
   - 输出目录：`.`
4. 添加环境变量：
   - CLOUDFLARE_ACCOUNT_ID: 你的Cloudflare账户ID
   - CLOUDFLARE_API_TOKEN: 具有编辑权限的API令牌

## 本地开发

```
npm install
npx wrangler dev
```

访问 http://localhost:8788 查看应用。
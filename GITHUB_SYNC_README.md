# GitHub同步工具使用说明

## 功能说明
本工具提供一键同步本地文件到GitHub仓库的功能，支持以下操作：
- 自动检测并同步新增的文件
- 自动检测并同步修改的文件  
- 自动检测并同步删除的文件
- 自动处理Git仓库初始化和远程仓库设置
- 自动拉取最新代码避免冲突

## 提供的脚本

### 1. Windows批处理版本 (推荐)
- 文件名：`sync_to_github.bat`
- 适用系统：Windows 7/8/10/11
- 使用方法：直接双击运行

### 2. PowerShell版本
- 文件名：`sync_to_github.ps1`
- 适用系统：Windows 10/11 (需启用PowerShell执行权限)
- 使用方法：右键"使用PowerShell运行"

## 前置要求

1. **安装Git**
   - 下载地址：https://git-scm.com/downloads
   - 安装时保持默认选项即可

2. **网络连接**
   - 需要能够访问GitHub (https://github.com)

## 使用步骤

### 方法一：双击运行批处理脚本 (推荐)
1. 找到项目文件夹中的 `sync_to_github.bat` 文件
2. 直接双击该文件
3. 按照屏幕提示操作

### 方法二：使用PowerShell脚本
1. 找到项目文件夹中的 `sync_to_github.ps1` 文件
2. 右键点击该文件
3. 选择"使用PowerShell运行"
4. 按照屏幕提示操作

## 脚本执行流程

1. **检查Git安装** - 自动检测是否已安装Git
2. **初始化Git仓库** - 如果未初始化则自动创建
3. **设置远程仓库** - 自动连接到GitHub仓库
4. **拉取最新代码** - 获取GitHub上的最新更新
5. **显示文件状态** - 列出所有新增、修改和删除的文件
6. **添加到暂存区** - 准备所有更改用于提交
7. **提交更改** - 保存本地更改
8. **推送到GitHub** - 同步到远程仓库

## 注意事项

1. **首次使用**
   - 首次运行时会自动初始化Git仓库并设置远程连接
   - 可能需要输入GitHub账号密码或使用SSH密钥

2. **文件冲突**
   - 如果本地文件与GitHub上的文件存在冲突，脚本会尝试自动处理
   - 严重冲突时需要手动解决

3. **提交信息**
   - 可以自定义提交信息，或使用默认的时间戳信息

4. **网络问题**
   - 如果网络连接失败，脚本会显示错误信息
   - 请检查网络连接后重试

## 常见问题

### Q: 运行脚本时提示"未检测到Git"
A: 请先安装Git，下载地址：https://git-scm.com/downloads

### Q: 推送失败提示"权限不足"
A: 请确保您有GitHub仓库的写入权限，或检查SSH密钥配置

### Q: PowerShell运行脚本提示"执行策略限制"
A: 以管理员身份运行PowerShell，执行以下命令后重试：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 仓库信息

- GitHub仓库地址：https://github.com/waynezyx007/student-picker-app.git
- 分支名称：master

## 更新日志

### v1.0.0 (2024-12-05)
- 初始版本
- 支持基本的文件同步功能
- 提供批处理和PowerShell两种版本
- 自动处理Git仓库设置

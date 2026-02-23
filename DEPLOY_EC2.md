# FocusTodo 自动部署到 EC2

这套流程不需要 AWS MCP，也不需要 OpenAI Token。

- 自动部署由 GitHub Actions 完成
- EC2 只需要 Nginx 提供静态文件

## 1. 一次性初始化 EC2

登录 EC2（Ubuntu）后执行：

```bash
sudo apt update
sudo apt install -y git
git clone https://github.com/youzhijia/FocusTodo.git
cd FocusTodo
bash deploy/ec2-bootstrap.sh
```

> 如果你不是 `ubuntu` 用户，请按你的系统用户执行。

## 2. 在 GitHub 配置 Secrets

仓库 -> `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

添加以下 Secrets：

- `EC2_HOST`: EC2 公网 IP 或域名
- `EC2_USER`: 例如 `ubuntu`
- `EC2_SSH_KEY`: 你的私钥全文（`-----BEGIN ...` 到 `-----END ...`）

当前工作流固定使用 SSH 端口 `22`。如果你改了端口，请修改 `.github/workflows/deploy-ec2.yml` 里的 `port`。

## 3. 触发自动部署

工作流文件：`.github/workflows/deploy-ec2.yml`

- 推送到 `main` 分支会自动部署
- 也可以在 GitHub Actions 页面手动点击 `Run workflow`

## 4. 验证发布

浏览器访问：

```text
http://<EC2_HOST>
```

如果打不开，优先检查：

- EC2 安全组是否放行 `80` 端口
- 工作流日志是否执行成功
- EC2 上 `sudo nginx -t` 是否通过

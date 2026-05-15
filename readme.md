• 日常开发：完全不变，npm run dev:weapp 照常使用
• 换电脑/协作：需要手动创建 wxapp/.env.local 和 wxapp/project.private.config.json（可以两份模板放在 README 里）
• CI/CD 构建：无需 .env.local，直接在 CI 环境变量里设 CLOUD_ENV=xxx，config/index.js 会优先读取 process.env.CLOUD_ENV
# 研究スケジュール管理

研究の作業日を自動計算し、カレンダーで重なりを確認できるツール。

## デプロイ手順

### 1. GitHubリポジトリを作成

```bash
cd research-scheduler
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/<あなたのユーザー名>/research-scheduler.git
git push -u origin main
```

### 2. Vercelにデプロイ

1. [vercel.com](https://vercel.com) → 「Add New Project」
2. GitHubリポジトリ「research-scheduler」をImport
3. Framework Preset: **Next.js**（自動検出されるはず）
4. 「Deploy」をクリック

以上で完了。スマホからもデプロイされたURLにアクセスできます。

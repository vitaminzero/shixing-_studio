# 十行文化网站

这是十行文化的中英双语静态展示网站原型，重点展示个人公司定位、视觉动画能力、精选项目和合作联系方式。

当前定位是“客户可访问的半公开作品集链接”：客户拿到链接即可浏览，但站点不主动做 SEO，入口页带有 `noindex,nofollow`。

## 本地预览

在 `E:\Company` 目录运行静态服务器：

```powershell
node scripts/dev-server.mjs 4190
```

然后访问 `http://localhost:4190`。

## 内容编辑

核心内容在 `content/site.json`：

- `featuredReel`：首页主推视频 / 动效混剪
- `capabilities`：能力模块
- `projects`：精选项目，支持图片、封面视频、完整视频链接、动效片段和外部链接
- `facts`：关于页事实信息
- `contacts`：联系方式

后台入口在 `/admin`，使用 Decap CMS 配置。正式部署时需要配置 Git Gateway，或在 GitHub 仓库创建后改成 GitHub backend 与对应 OAuth 配置。

项目支持展示分级：

- `full`：完整展示，加载封面、站内视频、图集和公开链接。
- `publicLink`：公开链接展示，加载封面和少量图片，不加载站内完整视频。
- `textOnly`：仅文字说明，不暴露项目封面、图集或视频地址。
- `hidden`：前台完全隐藏。

## 视频素材建议

- 首页主推：10-20 秒，静音循环，WebM 或 MP4。
- 项目封面：3-8 秒，尺寸尽量小，作为 hover / 列表预览。
- 完整作品：可以放站内视频，也可以填写外部平台链接。

正式上线时，大视频不要提交到 GitHub。将 MP4/WebM 上传到阿里云 OSS/CDN 后，在 `content/site.json` 中填写 CDN 地址；本地 `assets/projects/*.mp4` 已通过 `.gitignore` 排除。

## 占位素材说明

当前项目里包含腾讯游戏与 HoYoverse 相关公开素材占位，只用于本地预览完整页面效果。正式发布前，请替换为你拥有授权的项目截图、视频或客户许可素材。

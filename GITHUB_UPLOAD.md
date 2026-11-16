# 上传 GitHub

1. 解压 `floorplanning-studio-github-2026-11-16.zip`。
2. 打开解压后的 `floorplanning-studio` 文件夹。README、package.json、dist、content 应在这一层。
3. 将这一层的内容提交到仓库根目录；不要只把 ZIP 文件传进仓库。

使用 GitHub Desktop 时，将该目录作为本地仓库导入，再提交和推送。使用 Git 命令时，对一个新的空仓库可按下面操作；把地址替换成自己的仓库地址：

```powershell
git init
git add .
git commit -m "Add Floorplanning Studio"
git branch -M main
git remote add origin <你的仓库地址>
git push -u origin main
```

已有仓库按现有提交流程加入文件，不重复添加 origin。本轮没有执行上述命令或任何上传操作。

## 本地检查

```powershell
python scripts/serve.py --port 8830
```

浏览器打开 `http://127.0.0.1:8830/`。网站入口是 `dist/index.html`，字体、音轨和本地 Python 运行文件已包含。

`PACKAGE_MANIFEST.json` 记录发行文件大小与摘要，供核对完整性。内部交接、缓存、中间视频和浏览器验收截图仅留在本地备份，不进入 GitHub 源码包。

上传源码不会自动得到在线课程地址。当前没有创建部署工作流、云端项目或 GitHub Pages 配置；需要发布网站时再单独安排。

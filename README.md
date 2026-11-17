# Floorplanning Studio

面向芯片平面规划的交互课程，包含 Lab2–Lab8：合法性检查、评价指标、切片表达式、B*-tree、序列对、模拟退火与软模块形状优化。

每课在同一页面完成互动教学、综合实验、Python 编程和推理题。Lab2–8互动教学已接入完整中文晓伊和英文Sonia录音、独立字幕与时间轴。配音提前生成，播放时只读静态音频。Lab2–8 的实验说明、操作反馈、Python接口与习题支持整页中英切换；切换时保留当前实验和输入。没有额外普通视频或 MP4 下载环节。

## 本地运行

需要 Python 3。Windows 双击 `打开本地预览.cmd`，或在项目根目录运行：

```powershell
python scripts/serve.py --port 8830
```

在浏览器打开 <http://127.0.0.1:8830/>。服务仅监听本机地址，网站、字体、音轨和浏览器内 Python 均从本地加载。不要直接双击 HTML；它需要本地服务读取模块和数据。

学习记录保存在当前浏览器，可在“学习记录”页面导出。来源页中的外部作者链接需联网访问。

## 课程内容

- Lab2：完整布局检查器，检查名称、尺寸、边界与所有模块对。
- Lab3：完整评价报告，区分包围盒、固定外框、密度分母和有效得分。
- Lab4：后缀表达式→切片树→尺寸→坐标，逐步检查语法与几何边界。
- Lab5：B*-tree 遍历与轮廓线完整打包。
- Lab6：序列对、约束图、最长路径和关键前驱。
- Lab7：可复现退火、当前/候选/最好状态，以及等预算比较。
- Lab8：软模块约束、多形状候选前沿和形状/拓扑联合实验。

## 项目结构

- `dist/`：可直接由静态服务器提供的网站；其中部分 JavaScript 是直接维护的源码，不能清空后重建。
- `content/`：课程数据、讲稿、分镜和 Python 任务定义。
- `scripts/`：当前课程的构建、检查及打包工具。
- `tests/`：计算内核、状态与课程回归检查。
- `build/`：发行包保留的少量时间轴、来源和检查数据；帧图、缓存等不进入 GitHub 包。
- `docs/`：课程说明、开发说明、来源与验证记录。

## 修改与检查

需要 Node.js、Python 3；音轨检查另需本机 `ffprobe` 与 `imageio-ffmpeg`。纯浏览不需要这些开发工具。

```powershell
node scripts/build.mjs
python scripts/package_python.py
node --test tests/*.test.mjs
python scripts/check_site.py
```

完整说明见 [开发说明](docs/DEVELOPMENT.md) 与 [发行验证](docs/VERIFICATION.md)。重建不需要在线语音服务；不要删除现有 `dist/assets` 或 `dist/lessons/*/teaching`。

## 上传 GitHub

解压 GitHub 源码包，将 `floorplanning-studio` 文件夹里的内容提交到仓库根目录。步骤见 [上传说明](GITHUB_UPLOAD.md)。上传仓库与发布在线网站是两个动作；本项目的打包流程不自动配置部署。

## 许可与来源

项目代码采用 [MIT](LICENSE)。新教学文字与分镜按 [第三方及内容许可说明](THIRD_PARTY_NOTICES.md) 提供；原课程贡献者、字体、Pyodide 和其它组件保留各自权利与许可。

原作者与课程材料链接见 [来源记录](docs/source-audit.md) 及网站来源页。当前发行包不包含原作视频、研究资料归档或语音服务缓存。

## 复用课程与视频制作流程

完整 skill 位于 [skills/course-lesson-pack/SKILL.md](skills/course-lesson-pack/SKILL.md)，包含自然口播、静态双语配音、音画同步、互动教学、实验与浏览器验收。复用时保留整个 `course-lesson-pack` 文件夹，包含 `references`、`assets` 和 `scripts`；不要只复制入口文件。项目专用约定与通用流程分开保存。

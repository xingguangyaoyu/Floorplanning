# 开发与复现

## 日常修改

课程以静态 HTML、CSS、JavaScript 和本地浏览器 Python 组成。没有 npm 安装步骤或后端数据库。

`dist/assets` 与 `dist/lessons/NN/teaching` 中有直接维护的源码。`scripts/build.mjs` 更新路由、资源版本和数据，不会从另一份源码目录还原所有这些文件，因此不要清空 `dist`。

修改页面或任务后：

```powershell
node scripts/build.mjs
python scripts/package_python.py
node --test tests/*.test.mjs
python scripts/check_site.py
```

`package_python.py` 会生成 `build/python-exercises` 并更新网站的练习下载包；这些生成目录不需要提交。

## 教学时间轴

2026-11-16新配音流程：双语讲稿在 `content/narration-bilingual.tsv`，最终实际提交文本在 `build/voice-repair-2026-11-16/plan.json`。分镜/几何仍在 `content/interactiveNN.mjs`，任务在对应 `advancedNN-python.mjs`。保持缓存时可以离线重建：

```powershell
python scripts/voice_pipeline.py build
python scripts/build_teaching_labels.py
node scripts/build.mjs
python scripts/voice_checks.py
```

改稿时先运行 `python scripts/voice_pipeline.py prepare`，再按需要运行 `python scripts/voice_pipeline.py synthesize`。synthesize会把课程讲稿发送到Microsoft语音服务；只在明确允许在线配音时执行。缓存按文本/音色/语速摘要复用。旧 `build_labNN_audio.py` 与 `build_complete_interactive.py` 会拒绝覆盖新配音。不要清空dist或拿旧时间戳搭配新声音。完整说明见 `docs/voice-repair-2026-11-16/HANDOFF.md`。

时间轴生成器只拼接既有本地音频和阅读停留，不生成新旁白。修改了来源摘要覆盖的讲稿或内核后，按依赖重建时间轴再运行课别检查。只改网站提示文字无需重做音轨。

Lab8 当前分镜源为 `content/v3-08-draft.mjs`，当前入口为 `dist/lessons/08/teaching`；文件名中的 draft 是历史命名。

```powershell
node scripts/prepare_v3.mjs
python scripts/build_complete_interactive.py
node scripts/build.mjs
```

这些命令不覆盖维护中的播放器或视觉适配器，也不导出 MP4。

## 开发依赖

普通预览只需 Python 3。构建需要 Node.js；音轨重建/全解码检查需要 `requirements-dev.txt` 中的 Python 包，以及本机可调用的 `ffprobe`。

```powershell
python -m pip install -r requirements-dev.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

发行包附带已有网站和音轨，纯浏览无需安装上述开发依赖。

## 验证

```powershell
node --test tests/*.test.mjs
python scripts/check_site.py
python scripts/check_lab04.py
python scripts/check_lab06.py
python scripts/check_complete_interactive.py
node docs/verification/verify-representation-domains.mjs
node docs/verification/verify-shape-state.mjs
```

`check_lab02.py` 至 `check_lab07.py` 是各课的来源/音轨/Python检查。`check_http.py` 在本地服务运行后检查文件和音轨分段读取。

浏览器验收用 `?qa=1` 隔离正式学习记录。代码检查通过不能代替查看公式、动画、文字遮挡和真实任务提交。

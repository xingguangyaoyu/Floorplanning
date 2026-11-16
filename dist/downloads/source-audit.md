# Floorplanning Studio：来源与整合记录

更新：2026-11-12。此记录区分已有交接证据、本次本地验收与尚未完成的审阅。

## 整合原则

统一采用 A–E 五块算例、10×8 外框、左下角坐标。模块面积和为 23。
保留原作者入口。讲义、实验内核、交互动画和练习是本项目重新组织或实现的内容。
Lab5 是动画制作方法的主要参考；Lab8 是重构内容，不作为制作质量标杆。
指定编码的面积差异不能作为算法排名。原作未经完整视听审阅，不提供视频质量分数。

## 各课来源与取舍

- Lab2，muranfei：[网站](https://muranfei.github.io/eda-floorplanning-topic02/)，[仓库](https://github.com/muranfei/eda-floorplanning-topic02)。保留边界和合法性问题；新实验分别检查完整性、边界、正面积重叠和尺寸。
- Lab3，本地 `area-deadspace.zip`，包内未署名。保留外框密度和包围盒密度的分母区分。没有可比条件的布线密度阈值不推广为普遍规律。仅数矩形个数不能证明模块齐全。
- Lab4，GateUltra：[网站](https://gateultra.github.io/floorplanning-lesson4/)，[仓库](https://github.com/GateUltra/vlsi-course-director)。按交接记录，仓库侧重制作工具，不等同于网站成品源码。新实现用后缀栈逐步解码，分开检查语法、名称和几何。
- Lab5，Capeur：[网站](https://capeur.github.io/eda-floorplanning-module-lab5/)，[仓库](https://github.com/Capeur/eda-floorplanning-module-lab5)。本地归档包含 `ai-workflow/skills/lesson-animator`。借鉴确定性时间渲染、真实词边界、暂停预测、数据校验及视频导出。本地归档的docs/index.html用parts/part-1.mp4至part-5.mp4分段播放，并提供video.mp4完整下载；docs/lessons/part-N则用lesson-engine.js按音频时间实时绘制。两种形式并存，不应混为一种。新实验突出轮廓线的整个覆盖区间。
- Lab6，Su3037：[网站](https://su3037.github.io/floorplanning-lesson6-sequence-pair/)，[仓库](https://github.com/Su3037/floorplanning-lesson6-sequence-pair)。交接已审阅页面、README 和引擎。保留双语、约束图和最长路径推导；新课程明确上下关系约定，避免用前驱尺寸求和代替取最大值。
- Lab7，thy031：[网站](https://thy031.github.io/floorplanning7/site/courses/learn_floorplanning/labs/simulated-annealing-fp/index.html)，[仓库](https://github.com/thy031/floorplanning7)。已审阅源码、讲稿、字幕脚本并探测两部视频规格，详见[源码审阅](lab7-source-review.md)。原作约2:38短片、4:46完整版；成本常量和纯坐标交换不可达的坏起点不直接沿用。尚未完整试听。
- Lab8，xingguangyaoyu：[网站](https://xingguangyaoyu.github.io/EDA-Floorplanning-Lesson-8/)，[仓库](https://github.com/xingguangyaoyu/EDA-Floorplanning-Lesson-8)。新分镜围绕“变窄却碰撞—重摆恢复合法—合法仍未改进—再次压紧”。形状必须同时满足面积与宽高比，合法性与包围盒分别评价。

## 两个整合案例

- [Learning Partitioning · FanqinZeng](https://fanqinzeng.github.io/Partitioning_Module_Coordinator/)，本地留存 `course-upgrades` 分支归档。借鉴明确约束、同例比较、统一导航和 Python 实验。字体与 Pyodide 文件由该归档提取，保留随包许可证。
- [Learning Clustering · Su3037](https://su3037.github.io/learning-clustering/)，本地留存 main 分支归档。借鉴公共算例、分层路径和学习引导。页面视觉和课程结构经过本项目重新实现。

## 本地证据与边界

计算证据见 `tests/core.test.mjs`，浏览器与媒体证据见交付包 `docs/acceptance.md`。
七份下载 Python 参考实现共 30 个检查通过。
英文保留未改讲稿的缓存；本轮精简讲稿后生成必要的新语音，中文改用晓晓女声正常语速。
各原作视频尚未逐部完整视听审阅；Lab7 已完成源码及媒体规格审阅，完整视听评价待补充。
本项目不声明统一获得所有原作再分发许可。原作以链接提供，research/cache 不进入运行网站交付包。

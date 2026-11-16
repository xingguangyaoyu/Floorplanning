// Learner-facing titles and short visual notes. Spoken captions still match existing audio.
export default {
  "intro-why": {
    "title": "面积定死，形状还能选",
    "note": "改形状要挪邻居；摆法也会限制形状"
  },
  "intro-course": {
    "title": "这是最后一课：前面的工具一起用",
    "note": "检查、评分、解码、搜索，缺一不可"
  },
  "intro-task": {
    "title": "三个问题贯穿全课",
    "note": "候选怎么列？谁能进框？结论到哪里？"
  },
  "intro-preview": {
    "title": "先认识贯穿全课的例子",
    "note": "A面积为6；变窄之后先撞到D"
  },
  "scope": {
    "title": "A变窄了，整张图会更好吗？",
    "note": "A可以变形，其余四块尺寸不变"
  },
  "grid": {
    "title": "先记住这两条规则",
    "note": "尺寸取正整数，位置也落在整数网格上"
  },
  "couple-height": {
    "title": "宽度改了，高度就得跟着改",
    "note": "面积是6，所以h=6/w"
  },
  "couple-bound": {
    "title": "它最多能变得多宽、多窄？",
    "note": "0.5≤w/h≤2，代入h=6/w"
  },
  "couple-filter": {
    "title": "整数尺寸，只剩哪两种？",
    "note": "1×6和6×1太细长；留下2×3、3×2"
  },
  "couple-model": {
    "title": "2.5×2.4为什么不能直接选？",
    "note": "允许小数和只许整数，是两个不同的问题"
  },
  "baseline-read": {
    "title": "先看看现在摆得怎么样",
    "note": "包围盒9×3=27，里面空了4"
  },
  "overlap-predict": {
    "title": "只把A变高，会碰到谁？",
    "note": "其余模块先不动，想一想再往下看"
  },
  "overlap-change": {
    "title": "右边空了，上面却挤进去了",
    "note": "面积没变，占用的位置变了"
  },
  "overlap-area": {
    "title": "重叠的这一块，到底有多大？",
    "note": "横向重叠2，纵向重叠1，面积是2"
  },
  "overlap-contact": {
    "title": "贴着放，和挤在一起，差在哪里？",
    "note": "只碰到边界可以；内部不能重叠"
  },
  "repair-side": {
    "title": "D躲开了A，为什么又不行？",
    "note": "修好一处以后，也要看看其他邻居"
  },
  "repair-up": {
    "title": "把D再往上移一格",
    "note": "B的顶部在y=3，D从这里开始放"
  },
  "repair-score": {
    "title": "不碰撞了，却占得更大",
    "note": "包围盒从27变成36"
  },
  "repack-B": {
    "title": "先把B靠过来",
    "note": "B左移，贴住A的右边"
  },
  "repack-C": {
    "title": "C也往左靠",
    "note": "C左移，给D留出较低的位置"
  },
  "repack-D": {
    "title": "D可以降下来了",
    "note": "D放在(4,2)，与B、C接触"
  },
  "bottle-predict": {
    "title": "现在是谁把右边撑住了？",
    "note": "看看最右边缘，别只盯着刚移动的模块"
  },
  "bottle-edge": {
    "title": "先看谁撑住了左右两条边界",
    "note": "E的右边缘在9，决定了当前盒宽"
  },
  "space-D": {
    "title": "先给E腾出地方",
    "note": "D移到(0,3)，空出C上方"
  },
  "space-E": {
    "title": "把E放进刚才的空位",
    "note": "右边缘退到6，包围盒6×4=24"
  },
  "space-swap": {
    "title": "这条做法，是先腾地方再摆紧",
    "note": "27→36→24只描述这一条做法"
  },
  "space-path": {
    "title": "两头都放得下，途中就不会撞吗？",
    "note": "摆放位置合法，不等于搬运途中始终无碰撞"
  },
  "metric-fixed": {
    "title": "为什么28.75%一直不变？",
    "note": "固定外框还是80，五块总面积还是23"
  },
  "metric-box": {
    "title": "换个分母，才能看出压紧的效果",
    "note": "23/27≈85.19%，23/24≈95.83%"
  },
  "proof-area": {
    "title": "24还能再小吗？",
    "note": "不重叠地装下全部模块，盒面积至少是23"
  },
  "proof-integer": {
    "title": "整数规则，现在派上用场了",
    "note": "坐标和尺寸都为整数，盒宽高也是整数"
  },
  "proof-prime": {
    "title": "面积是23，整数边长能怎么选？",
    "note": "23是质数，只能分成1×23或23×1"
  },
  "proof-exclude": {
    "title": "这两条长条，连C都装不进去",
    "note": "C固定为2×2，放不进短边为1的盒子"
  },
  "proof-witness": {
    "title": "这时，才能说24已经最好",
    "note": "至少24，而且已经有合法24"
  },
  "proof-continuous": {
    "title": "如果允许小数，这个证明还够吗？",
    "note": "去掉整数条件，就要重新检查推理"
  },
  "proof-limit": {
    "title": "摆得更好，一定是因为A变形了吗？",
    "note": "A保持3×2，也存在合法24"
  },
  "transfer": {
    "title": "把面积改成8，你会怎么选？",
    "note": "先筛面积和比例，再检查整数要求"
  },
  "finish": {
    "title": "接下来，用自己的摆法解释结果",
    "note": "说清限制、边界和结论的依据"
  }
};

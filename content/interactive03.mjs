import{BASE03,BEST03,TRADEOFF03,CANDIDATES03,THREE03,shiftRows,copy,CATALOG03}from'../dist/assets/metrics03.mjs';
const invalid=copy(BASE03);invalid[4][1]=6;
export const CHAPTERS03=['先回答“按什么比较”','先选对要比较的量','包围盒怎样算才对','分母变了，比例才会变','非法结果不能参加排名','面积和外框是不同条件','空余比例要说清分母','写成可靠的评价报告'];
export const LESSON03={id:'03',title:'摆紧以后，为什么密度还没变？',outline:[10,8],catalog:CATALOG03,scenes:[
{key:'intro-select',chapter:1,title:'能用摆法不止一种，按什么挑？',view:'intro-select',rows:BASE03,seconds:18,note:'两份都合法；比较之前先说清目标和分母',say:'上一课的检查器能告诉你一张布局能不能用；可是能用的摆法往往不止一种。自动布图会在很多候选里挑一个，这时必须先回答：按什么挑？如果目标写得不清楚，比如只看某一个边，或者用错了分母，工具会把设计引向错误的方向。'},
{key:'intro-trap',chapter:1,title:'一个怎么挪都不变的数',view:'outline',rows:BASE03,seconds:16,note:'模块和外框不变时，23/80=28.75%是定值',say:'先看一个常见的陷阱。模块清单和外框都不变时，外框密度二十三除以八十是定值：挪得再紧，它也不动。一个怎么操作都不变的目标，评不出你的工作。所以动手比较之前，先分清哪些量固定，哪些量真正跟着摆法变。'},
{key:'intro-goal',chapter:1,title:'本课任务：一份有依据的评价报告',view:'intro-goal',rows:BASE03,seconds:18,note:'接Lab2检查；非法不给分；两个分母分开写',say:'本课的任务，是把评价指标写成一份可靠的报告：接上Lab2的检查，先筛掉非法布局，再算真实包围盒和两个不同分母的密度。学完你能说明每个数的依据，也能解释为什么面积相同、仍然可能只有一份装得进固定外框。这份报告直接服务于后面的解码与搜索。'},
{key:'invariant',chapter:2,title:'挪动以后，有些数根本不会变',view:'area',rows:BASE03,voice:'invariant',note:'3×2 + 2×3 + 2×2 + 3×1 + 2×2 = 23'},
{key:'outline',chapter:2,title:'外框没变，23/80就不会变',view:'outline',rows:BASE03,voice:'outline',note:'外框10×8=80；外框密度23/80=28.75%'},
{key:'constant',chapter:2,title:'用一个不变的数，能评价压紧吗？',view:'same-outline',rows:BASE03,trialHint:'从左侧原布局开始试，外框仍为10×8。',seconds:11,note:'同一模块清单、同一外框，合法布局的外框密度相同',say:'如果模块尺寸和外框都不变，挪位置不会改变二十三除以八十。这个数可以描述用了多少固定框空间，却不能告诉我们刚才压紧了多少。要比较之前，先问目标会不会响应你的操作。'},
{key:'bbox',chapter:3,title:'换看刚好围住模块的那只盒子',view:'bbox',rows:BASE03,voice:'bbox',note:'包围盒由模块的实际最左、最右、最上、最下边缘决定'},
{key:'twentyseven',chapter:3,title:'现在这只盒子里，空了多少？',view:'baseline-score',rows:BASE03,voice:'twentyseven',note:'盒面积9×3=27；盒内空余27−23=4'},
{key:'extents',chapter:3,title:'宽度要减去最左边，高度也一样',view:'extents',rows:shiftRows(BASE03,1,2),from:BASE03,seconds:12,note:'宽=xmax−xmin，高=ymax−ymin',say:'把整张图右移一格、上移两格。各块之间的关系没有变，盒子仍是九乘三。现在最左边是一，最右边是十，所以宽度要用十减一；高度用五减二。'},
{key:'translation-bug',chapter:3,title:'为什么只乘最大边缘会算错？',view:'translation-bug',rows:shiftRows(BASE03,1,2),seconds:11,note:'错误：10×5=50；正确：(10−1)×(5−2)=27',say:'如果只把最大的右边缘和上边缘相乘，会得到十乘五，等于五十。这把原点到模块之间的空白也算进去了。平移不该改变压紧得分，所以它是检查包围盒程序的好测试。'},
{key:'predict',chapter:4,title:'盒子变小，外框密度会跟着涨吗？',view:'bbox',rows:BASE03,voice:'predict',note:'固定外框和五块面积都没有改变',question:{prompt:'把包围盒从27压到24，固定外框仍是10×8。哪个比例会改变？',choices:['外框密度会提高','包围盒密度会提高','两个比例都会提高'],answer:1,replies:['外框分母仍是80，分子仍23，所以不变。','包围盒分母从27变24，而分子仍23。','两种分母不能混用；只有包围盒密度随这次压紧改变。']}},
{key:'twentyfour',chapter:4,title:'同样五块，换一份更紧的摆法',view:'compact',rows:BEST03,from:BASE03,voice:'twentyfour',note:'硬模块尺寸不变，合法盒面积6×4=24'},
{key:'denominator',chapter:4,title:'两个密度，回答两个问题',view:'density-compare',rows:BEST03,trialHint:'从右侧压紧后的6×4布局开始试。',voice:'denominator',note:'23/80不变；23/27→23/24'},
{key:'accounting',chapter:4,title:'空余也要分清是哪只盒子的',view:'accounting',rows:BEST03,seconds:12,note:'外框空余57不变；盒内空余4→1',say:'固定外框里没被模块占用的面积，是八十减二十三，等于五十七。包围盒内的空余，则从二十七减二十三，变成二十四减二十三。一个是五十七，另一个是一，不能都简称成同一种空余。'},
{key:'illegal',chapter:5,title:'同样写着24，这份结果能用吗？',view:'invalid',rows:invalid,seconds:12,note:'只保留诊断用的几何盒；有效密度和空余不给分',say:'再看这份盒面积也是二十四的布局。Lab2检查器已经指出C和E重叠，它不能参加合法布局的排名。程序可以保留这个几何盒帮助诊断，却不能给它颁发百分之九十五点八三的有效得分。'},
{key:'missing',chapter:5,title:'漏放一块，更小也不能算进步',view:'missing',rows:BASE03.slice(0,-1),seconds:11,note:'清单仍要求A—E；不能靠删模块缩小包围盒',say:'如果把E漏掉，几何盒会更小。可我们要放的是清单里的全部模块，不是尽量少放几块。评价器先接收完整检查结果，发现错误就把优化分数留空，不拿错误输入去争第一。'},
{key:'order',chapter:5,title:'顺序是先过约束，再比较目标',view:'pipeline',rows:BASE03,seconds:11,note:'检查通过 → 算几何 → 选分母 → 比较同一个目标',say:'把顺序固定下来：先检查，只有合法才产生有效分数；再算真实包围盒；然后分别写清两个密度的分母。最后，拿同一套规则和同一个目标去比较。这样就不会奖励漏放或重叠。'},
{key:'width-tradeoff',chapter:6,title:'宽缩小了，面积就一定更好吗？',view:'tradeoff',rows:TRADEOFF03,from:BASE03,trialHint:'从右侧7×4的摆法开始试，原来的9×3供比较。',seconds:13,note:'9×3=27 → 7×4=28；宽更小，面积反而更大',say:'只把E放到C上方，最右边从九退到七，但高度也从三长到四。宽确实小了，面积却从二十七涨到二十八。说它更好还是更差，得先说明你优化的是宽度、面积，还是某个固定外框下的可行性。',question:{prompt:'盒宽从9降到7，盒高从3升到4。面积目标改善了吗？',choices:['改善了，因为宽更小','没有，面积27变28','无法比较任何数值'],answer:1,replies:['面积还要乘高度，不能只看一个边长。','面积增大1，包围盒密度相应下降。','在相同模块和面积目标下，可以明确比较27与28。']}},
{key:'fit-filter',chapter:6,title:'同样12，为什么只有一份进得去？',view:'fit-filter',rows:CANDIDATES03[0].rows,outline:[4,4],catalog:THREE03,trialHint:'从左侧横排X开始试，仍使用P/Q/R和4×4外框。',seconds:13,note:'换成三块：P3×2、Q2×2、R1×2；先按4×4过滤',say:'换一组三块模块。横排的包围盒六乘二，另一份是三乘四，面积都是十二。放进四乘四框时，六乘二太宽，三乘四可以。面积相同不代表外框可行性相同，先筛宽高，再比较面积。'},
{key:'budget-denominators',chapter:7,title:'“留15%空余”，分母是哪一个？',view:'budget',rows:BASE03,trialHint:'试摆仍用原五块和10×8外框；15%是预算比较，不是一份已经做出的布局。',seconds:14,note:'空余/模块面积 与 空余/总区域面积，是两个比例',say:'还有一种分母容易混：空余占模块面积的百分之十五，和空余占总区域的百分之十五，不是一回事。前者总面积等于模块面积乘一点一五；后者要用模块面积除以零点八五。'},
{key:'budget-values',chapter:7,title:'同一句15%，算出两个面积预算',view:'budget-values',rows:BASE03,trialHint:'试摆仍用原五块和10×8外框；面积预算不保证存在对应的合法摆法。',seconds:13,note:'23×1.15=26.45；23/0.85≈27.06',say:'用二十三代进去，一个预算是二十六点四五，另一个约二十七点零六。它们只是按不同分母算出的面积预算，都没有证明某种宽高和形状一定能摆下。真正选方案，还得回到约束检查。'},
{key:'report',chapter:8,title:'让报告把依据一起带出来',view:'report',rows:BEST03,seconds:12,note:'合法性、原始盒、有效指标、分母，都要分开记录',say:'写Python时，不要只返回一个面积。把合法性、错误原因、包围盒边缘、两个分母和各自的得分一起返回。非法输入保留诊断信息，有效得分则留空。后面的算法才能知道自己究竟在优化什么。'},
{key:'limits',chapter:8,title:'几何更紧，不等于芯片全面更优',view:'limits',rows:BEST03,voice:'limits',note:'本课只评价已经明确建模的几何目标'},
{key:'transfer',chapter:8,title:'换个框，重新选你的方案',view:'transfer',rows:BASE03,seconds:11,note:'Lab：平移反例、固定框筛选、宽与面积的取舍',say:'下面三项实验会换外框和条件。你要找出错误公式的反例，筛掉不能用的候选，再解释一份宽更小却面积更大的结果。每次都先说清条件和分母，再下结论。'}
]};

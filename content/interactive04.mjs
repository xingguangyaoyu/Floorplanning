import{CATALOG02,STANDARD04,OVERFLOW04,SWAP04,decodePostfix,decodeRows04,SWAP_ROWS04,OVERFLOW_ROWS04,PINWHEEL04,PINWHEEL_OUTLINE04,PINWHEEL_CATALOG04}from'../dist/assets/slicing04.mjs';
import{BASE02,copy}from'../dist/assets/legality02.mjs';
const rowsOf=expr=>decodeRows04(expr).rows;
const step=n=>decodePostfix(STANDARD04).events[n-1];
export const CHAPTERS04=['为什么从表达式开始','字母与两种切线','栈解码九个符号','尺寸与坐标，两个方向','三个边界检查','语法合法，仍可能放不下','切片表示的范围','表达式就是搜索邻域'];
export const LESSON04={id:'04',title:'九个符号，还原一张布局',outline:[10,8],catalog:CATALOG02,scenes:[
{key:'intro-context',chapter:1,title:'为什么布图要从“表示法”开始',view:'intro-flow04',rows:BASE02,seconds:18,note:'不直接搜坐标：先选表示法，再在编码之间搜索',say:'布图工具不会在所有坐标组合里直接搜索：空间太大。常见的做法是先选一种表示法，再在表示法的编码之间搜索。切片表达式是最直接的一种：九个符号就能写下一张布局。本课讲清它怎样一步步变回坐标。'},
{key:'intro-task',chapter:1,title:'本课任务：一条完整的解码链',view:'intro-goal04',rows:BASE02,seconds:19,note:'实例：五块硬模块各一次、禁旋转、外框10×8；表达式→树→尺寸→坐标',say:'本课把一条后缀表达式完整还原成布局：解析、建树、自下而上算尺寸、再自上而下传坐标。五块尺寸、禁旋转和 10×8 外框就在画面下方这条约束里——面积合计 23、外框 80，装不满是正常的。先看一个具体问题：为什么非得从表达式走这一趟，而不能直接去摆坐标？'},
{key:'intro-preview',chapter:1,title:'先认识贯穿全课的标准表达式',view:'board',rows:rowsOf(STANDARD04),seconds:15,note:'A D H B V C V E V 的解码结果：正是前两课的9×3标准布局',say:'先记住这条标准表达式：A D H B V C V E V。它是本课贯穿的例子，解码结果正是前两课里那张九乘三的合法布局。它哪里容易出错？H 和 V 谁先谁后？我们一步一步看。'},
{key:'notation',chapter:2,title:'字母表示模块，H、V 表示组合',view:'notation-cards',rows:BASE02,voice:'encoding',note:'A—E是模块；H/V是两种切线，不是方向指令'},
{key:'h-convention',chapter:2,title:'H：第一个区域在下，第二个在上',view:'hv-cards',rows:BASE02,voice:'guess',note:'H：宽取最大，高相加'},
{key:'v-convention',chapter:2,title:'V：第一个区域在左，第二个在右',view:'v-cards',rows:BASE02,seconds:12,note:'V：宽相加，高取最大；先弹出的是第二区域',say:'V 是垂直切线：第一区域在左，第二区域在右，宽相加、高取最大。和 H 一样，“第一、第二”按弹出顺序定：先弹出的是第二区域，后弹出的、更靠栈底的是第一区域。把这条约定写进代码注释，能省掉很多调试。'},
{key:'max-add',chapter:2,title:'为什么宽取最大、高相加？',view:'hv-cards',rows:BASE02,voice:'combine',note:'A(3×2)在下，D(3×1)在上：宽max(3,3)=3，高2+1=3',question:{prompt:'把 A D H 换成 A D V（其余符号先不管），A 和 D 会在什么方向排？',choices:['V：A 在左、D 在右，宽相加','V：A 在上、D 在下','V 和 H 结果完全一样'],answer:0,replies:['V 是垂直切线：第一区域在左，第二区域在右，宽相加、高取最大。','上下排列是 H 的约定；V 沿水平方向排。','两种切线的合并规则不同：一个宽相加，一个高相加。']}},
{key:'stack-start',chapter:3,title:'从空栈开始：压 A，压 D',view:'stack',rows:step(2).pack&&packRows(step(2)),step:2,voice:'push',note:'读到字母就压栈；D 在栈顶'},
{key:'stack-combine',chapter:3,title:'遇到 H：弹出两个，合成一个',view:'stack',rows:packRows(step(3)),step:3,seconds:12,note:'先弹出的是第二区域（D），后弹出的是第一区域（A）',say:'读到 H，弹出两个区域：先弹出的 D 是第二区域，后弹出的 A 是第一区域。合成一个新区域压回去，尺寸按 H 的规则算：宽取最大、高相加，得到三乘三。栈从两层变一层。'},
{key:'full-decode',chapter:3,title:'按同样的规则读完九个符号',view:'stack',rows:packRows(step(9)),step:9,voice:'full',note:'最终栈里只剩一个区域：9×3'},
{key:'decode-steps',chapter:3,title:'九步连起来看',view:'stack-track',rows:BASE02,seconds:13,note:'压字母或“弹二合一”，每步栈深不超过2',say:'把九步连起来：压A、压D、H合并、压B、V接B、压C、V接C、压E、V接E。每一步要么压入一个模块，要么弹出两个区域、合成一个压回。最后栈里只剩一个区域，尺寸九乘三。栈最深只有两层。'},
{key:'coords-result',chapter:3,title:'解码坐标：又是那张标准布局',view:'board',rows:rowsOf(STANDARD04),seconds:12,note:'A(0,0) D(0,2) B(3,0) C(5,0) E(7,0)；盒9×3',say:'解码得到的坐标：A在(0,0)，D在(0,2)，B在(3,0)，C在(5,0)，E在(7,0)，正好是前两课的标准布局。表达式只记录结构；每个坐标都由组合规则算出，不是背出来的。'},
{key:'sizes-up',chapter:4,title:'尺寸自下而上汇总',view:'tree-sizes',rows:BASE02,seconds:13,note:'叶子是模块尺寸；每个内部节点按max/相加合成',say:'同一件事也能按树来看：叶子是模块自己的宽高；每往上走一步，H 或 V 把两个孩子的尺寸合成一个。尺寸自下而上汇总，到根就是九乘三。这就是“算尺寸”这一趟。'},
{key:'coords-down',chapter:4,title:'坐标自上而下传播',view:'tree-coords',rows:BASE02,seconds:14,note:'根放在原点；V的右孩子挪一个左孩子宽，H的上孩子挪一个下孩子高',say:'坐标从根往下传：根区域的左下角放在原点。V 的左孩子原地开始，右孩子往右挪一个左孩子的宽；H 的下孩子原地，上孩子往上挪一个下孩子的高。每个模块的落点，都是这条链上多次平移的结果。'},
{key:'order-matters',chapter:4,title:'两趟顺序，谁依赖谁',view:'two-orders',rows:BASE02,seconds:12,note:'不知道区域尺寸，就不知道兄弟该挪多远',say:'所以解码有两趟：先自下而上求尺寸，再自上而下传坐标。顺序不能反——不知道子区域的尺寸，就不知道兄弟该挪多远。写程序时两趟可以合并成一遍，但依赖关系不能乱。'},
{key:'three-checks',chapter:5,title:'一个栈元素，只过了结构检查',view:'checks-cards',rows:BASE02,voice:'checks',note:'结构、名称、外框是三道独立的检查'},
{key:'prefix-condition',chapter:5,title:'前缀条件：读符号时就要查',view:'prefix-chart',rows:BASE02,seconds:13,note:'任何前缀里，运算符数不能追上字母数；A H 读到H时下溢',say:'第一道结构检查在读符号时做：每遇到 H 或 V，栈里必须已有至少两个区域。换句话说，任何位置上，已读的运算符都不能追上已读的字母。A H 是最短的反例：读 H 时栈里只有一个区域，弹出两个会下溢。别以为字母多就够了——A H D B V C V E V 有五个字母、四个符号，总数正好，可第 2 个记号就是 H，照样当场下溢。'},
{key:'final-one',chapter:5,title:'读完后还有两条结构检查',view:'checks-cards',rows:BASE02,seconds:11,note:'栈里恰剩一个区域；每个字母恰好出现一次',say:'读完后还要查两条：栈里恰好剩一个区域，多了说明组合没做完；每个字母恰好出现一次，重复或缺失都不行。这三条全过，才轮到Lab2的几何检查——它们查的是结构，不是位置。'},
{key:'overflow',chapter:6,title:'语法完全合法，仍可能越界',view:'board-overflow',rows:OVERFLOW_ROWS04,voice:'overflow',note:'A D V…排成一行：宽12，超过外框10'},
{key:'swap-operands',chapter:6,title:'换操作数：尺寸不变，落点变',view:'board',rows:SWAP_ROWS04,seconds:13,note:'D A H…仍是9×3；但A的y从0变1，D从2变0',say:'换操作数是另一类编辑。把开头的 A D H 改成 D A H：D 在下、A 在上，区域还是三乘三，整体仍是九乘三；但 A 和 D 的坐标对调了。尺寸相同的两份表达式，可以对应不同的布局。',question:{prompt:'D A H B V C V E V 的包围盒尺寸是多少？',choices:['9×3，和标准表达式相同','3×3','12×3'],answer:0,replies:['只是A、D上下对调，宽高结构与原来相同。','3×3只是A、D组合的子区域。','宽12是第一个H改成V的情形；这里没有改。']}},
{key:'first-cut',chapter:7,title:'切片布局：能找到第一刀',view:'board-cut',rows:rowsOf(STANDARD04),cut:'v:3',seconds:14,note:'竖线x=3：左边A、D，右边B、C、E；x=5、x=7也各有一条',say:'切片表达式能还原什么、不能还原什么？先看标准布局：竖线x=3处一刀下去，不穿过任何模块内部，左边剩A和D，右边是B、C、E——这就是第一刀。x=5和x=7也各有一条。能找到第一刀，才能继续往下切、写成一棵切片树。'},
{key:'pinwheel',chapter:7,title:'风车布局：每条候选线都被挡住',view:'pinwheel',rows:PINWHEEL04,outline:PINWHEEL_OUTLINE04,catalog:PINWHEEL_CATALOG04,line:'v:2.5',seconds:14,note:'5×5五块风车；x=2.5穿过P、M、R三个模块',say:'再看这个五块风车：五块正好铺满一个五乘五的方框。试一条竖线，比如x=2.5：它同时穿过P、M、R三个模块的内部。横线也一样。候选切线只可能落在块的边缘位置，而这些位置每一条都会被某个块挡住。'},
{key:'pinwheel-proof',chapter:7,title:'逐条验证：没有第一刀',view:'pinwheel-sweep',rows:PINWHEEL04,outline:PINWHEEL_OUTLINE04,catalog:PINWHEEL_CATALOG04,seconds:15,note:'候选竖线2条、横线2条全部穿过内部→无第一刀→写不出表达式',say:'把结论钉死：五乘五风车里，内部候选竖线有两条、横线有两条，每一条都穿过某个模块的内部；贴合无缝隙，中间位置也一样。没有第一刀，就不存在对应的切片树。顺便提醒：Lab3那份6×4=24的紧凑见证，同样没有第一刀。这不是巧合——把本课这五块的26880份切片编码全部穷举，最小面积只到25，24一份都写不出来；而B*-tree和序列对都能到24。最紧的布局未必是切片布局。'},
{key:'edit-neighborhood',chapter:8,title:'表达式编辑，就是搜索的邻居',view:'edit-cards',rows:BASE02,seconds:14,note:'换符号/换操作数/换字母顺序；每改一次重新解码、检查、评价',say:'把表达式看成一个搜索空间：换一个符号、换两个操作数、交换字母顺序，都是一次“邻居”尝试。每改一次，重新解码、用Lab2检查、用Lab3评价，就得到一个新布局。这套“表示法加邻域”正是Lab7搜索的骨架；本课先把解码这一步做扎实。'},
{key:'transfer',chapter:8,title:'轮到你：修表达式、重建布局、守住约束',view:'board',rows:rowsOf(STANDARD04),voice:'try',note:'三项实验在下方Lab区；表达式逐步解码可观察栈'}
]};
function packRows(event){const pack=event.pack;return Object.entries(pack).map(([id,r])=>[id,r.x,r.y,r.w,r.h]).sort((a,b)=>a[0]<b[0]?-1:1);}
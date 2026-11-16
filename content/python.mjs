import {PYTHON03}from'./advanced03-python.mjs';
import {PYTHON04}from'./advanced04-python.mjs';
import {PYTHON05}from'./advanced05-python.mjs';
import {PYTHON06}from'./advanced06-python.mjs';
import {PYTHON07}from'./advanced07-python.mjs';
import {PYTHON08B}from'./advanced08-shape.mjs';
import {PYTHON02}from'./advanced02-python.mjs';
import {PYTHON08}from'./advanced08-python.mjs';
import {bi} from './course.mjs';
export const TASKS={
 '02':{name:'overlap',prompt:bi('实现正面积重叠判定。两个矩形使用 (x,y,w,h)，共边必须返回 False。','Implement positive-area overlap for (x,y,w,h) rectangles. Shared edges must return False.'),starter:'def overlap(a, b):\n    # a and b are (x, y, width, height)\n    raise NotImplementedError("Complete the overlap test")\n',reference:'def overlap(a,b):\n    x,y,w,h=a; X,Y,W,H=b\n    return x<X+W and X<x+w and y<Y+H and Y<y+h\n',tests:[['contact','not overlap((0,0,2,2),(2,0,2,2))'],['interior','overlap((0,0,2,2),(1,1,2,2))'],['vertical gap','not overlap((0,0,2,2),(0,3,2,2))'],['containment','overlap((0,0,5,5),(1,1,1,1))']]},
 '03':{name:'box_area',prompt:bi('实现真正的包围盒面积。pack 是矩形列表，每项为 (x,y,w,h)；整体平移后答案不变，空列表返回 0。','Compute actual bounding-box area for a list of (x,y,w,h) rectangles. Translation must not change the result; an empty list returns 0.'),starter:'def box_area(pack):\n    # Remember the minimum x and y, not only the maxima.\n    raise NotImplementedError("Compute the enclosing rectangle")\n',reference:'def box_area(pack):\n    if not pack: return 0\n    return (max(x+w for x,y,w,h in pack)-min(x for x,y,w,h in pack))*(max(y+h for x,y,w,h in pack)-min(y for x,y,w,h in pack))\n',tests:[['empty','box_area([])==0'],['single','box_area([(4,7,3,2)])==6'],['translated','box_area([(4,7,3,2),(7,7,2,3)])==15'],['negative origin','box_area([(-2,-3,2,2),(0,-3,1,2)])==6']]},
 '04':{name:'combine',prompt:bi('输入两个 (宽,高) 区域和 H/V，返回组合后的尺寸。H 高相加，V 宽相加；未知操作符要抛出 ValueError。','Combine two (width,height) regions with H or V. H adds heights; V adds widths. Raise ValueError for an unknown operator.'),starter:'def combine(a, b, op):\n    raise NotImplementedError("Implement H and V")\n',reference:'def combine(a,b,op):\n    if op=="H": return (max(a[0],b[0]),a[1]+b[1])\n    if op=="V": return (a[0]+b[0],max(a[1],b[1]))\n    raise ValueError("Unknown operator")\n',tests:[['horizontal cut','combine((3,2),(3,1),"H")== (3,3)'],['vertical cut','combine((3,2),(3,1),"V")== (6,2)'],['unequal dimensions','combine((2,5),(7,1),"H")== (7,6)'],['invalid operator','raises_value_error(lambda: combine((2,2),(1,1),"X"))']]},
 '05':{name:'skyline_height',prompt:bi('segments 为 (x1,x2,height) 列表。返回待放模块整个 [x,x+width) 区间下方最高的轮廓线；边界接触不算覆盖。','Given skyline segments (x1,x2,height), return the highest one overlapping [x,x+width). Boundary-only contact does not count.'),starter:'def skyline_height(segments, x, width):\n    raise NotImplementedError("Inspect the entire footprint")\n',reference:'def skyline_height(segments,x,width):\n    return max([0]+[h for a,b,h in segments if b>x and a<x+width])\n',tests:[['empty floor','skyline_height([],0,3)==0'],['neighbor lifts block','skyline_height([(0,2,2),(2,4,3)],0,3)==3'],['edge contact excluded','skyline_height([(0,2,8)],2,2)==0'],['partial footprint','skyline_height([(1,2,5),(2,5,3)],0,4)==5']]},
 '06':{name:'longest_coordinate',prompt:bi('每个前驱给出 (坐标,尺寸)。求必须越过所有前驱的最小坐标；没有前驱返回 0。','Each predecessor is (coordinate,size). Return the minimum coordinate clearing every predecessor; return 0 when there are none.'),starter:'def longest_coordinate(predecessors):\n    raise NotImplementedError("Satisfy all lower bounds")\n',reference:'def longest_coordinate(predecessors):\n    return max([0]+[coordinate+size for coordinate,size in predecessors])\n',tests:[['source','longest_coordinate([])==0'],['all predecessors','longest_coordinate([(0,3),(2,4),(4,1)])==6'],['single predecessor','longest_coordinate([(3,2)])==5'],['not sum','longest_coordinate([(0,2),(0,3),(0,2)])==3']]},
 '07':{name:'accept_probability',prompt:bi('实现退火接受概率。ΔE≤0 返回 1；ΔE>0 返回 exp(−ΔE/T)。本练习对非正温度抛出 ValueError。','Implement acceptance probability: 1 for ΔE≤0, otherwise exp(−ΔE/T). Reject non-positive temperatures with ValueError.'),starter:'import math\n\ndef accept_probability(delta, temperature):\n    raise NotImplementedError("Implement the acceptance probability")\n',reference:'import math\ndef accept_probability(delta,temperature):\n    if temperature<=0: raise ValueError("Temperature must be positive")\n    return 1.0 if delta<=0 else math.exp(-delta/temperature)\n',tests:[['downhill','accept_probability(-3,2)==1'],['neutral','accept_probability(0,2)==1'],['uphill','abs(accept_probability(4,2)-math.exp(-2))<1e-10'],['temperature effect','accept_probability(4,10)>accept_probability(4,1)'],['zero temperature','raises_value_error(lambda: accept_probability(4,0))']]},
 '08':{name:'valid_shape',prompt:bi('判断软模块形状：宽、高为正，面积相等（允许 1e−8 数值误差），且 low≤w/h≤high。','Check a soft shape: positive dimensions, equal area within 1e−8, and low≤w/h≤high.'),starter:'def valid_shape(w, h, area=6, low=0.5, high=2):\n    raise NotImplementedError("Check area and aspect ratio")\n',reference:'def valid_shape(w,h,area=6,low=0.5,high=2):\n    return w>0 and h>0 and abs(w*h-area)<1e-8 and low<=w/h<=high\n',tests:[['wide','valid_shape(3,2)'],['tall','valid_shape(2,3)'],['wrong area','not valid_shape(2,2)'],['aspect bound','not valid_shape(1,6)'],['zero width','not valid_shape(0,3)']]}
};

TASKS['08'].tests.push(['area-eight lower endpoint','valid_shape(2,4,area=8)'],['area-eight upper endpoint','valid_shape(4,2,area=8)'],['area-eight wrong area','not valid_shape(3,3,area=8)'],['too wide','not valid_shape(6,1)']);

TASKS['08']=PYTHON08;

TASKS["02"]=PYTHON02;

TASKS["03"]=PYTHON03;

TASKS["04"]=PYTHON04;

TASKS["05"]=PYTHON05;

TASKS["06"]=PYTHON06;

TASKS["07"]=PYTHON07;

TASKS["08-shape"]=PYTHON08B;

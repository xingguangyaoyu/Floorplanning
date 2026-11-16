import{PYTHON02}from'./advanced02-python.mjs';import{BASE03,BEST03,TRADEOFF03,CATALOG03,THREE03,CANDIDATES03,shiftRows}from'../dist/assets/metrics03.mjs';
const bi=(zh,en)=>({zh,en}),B=JSON.stringify(BASE03),C=JSON.stringify(CATALOG03),best=JSON.stringify(BEST03),bad=JSON.stringify(BASE03.map(r=>r[0]==='E'?[r[0],6,0,r[3],r[4]]:r)),call=(rows,outline='(10,8)',catalog=C)=>`metrics_report(${rows},${outline},${catalog})`;
const implementation=`def metrics_report(rows, outline, catalog):
    check = validate_layout(rows, outline, catalog)
    module_area = sum(w*h for w,h in catalog.values())
    outline_area = outline[0]*outline[1]
    bbox = None
    if rows and all(all(isinstance(v,(int,float)) and not isinstance(v,bool) and math.isfinite(v) for v in row[1:]) and row[3]>0 and row[4]>0 for row in rows):
        xmin = min(row[1] for row in rows)
        ymin = min(row[2] for row in rows)
        xmax = max(row[1]+row[3] for row in rows)
        ymax = max(row[2]+row[4] for row in rows)
        bbox = {'xmin':xmin,'ymin':ymin,'xmax':xmax,'ymax':ymax,
                'width':xmax-xmin,'height':ymax-ymin,
                'area':(xmax-xmin)*(ymax-ymin)}
    usable = check['legal'] and bbox is not None and bbox['area']>0
    return {'legal':check['legal'],'errors':check['errors'],
            'module_area':module_area,'outline_area':outline_area,'bbox':bbox,
            'outline_density':module_area/outline_area if usable else None,
            'packing_density':module_area/bbox['area'] if usable else None,
            'outline_dead':outline_area-module_area if usable else None,
            'bbox_dead':bbox['area']-module_area if usable else None}
`;
const tests=[
['baseline legal and raw extents',`${call(B)}['legal'] is True and ${call(B)}['errors']==[] and ${call(B)}['bbox']=={'xmin':0,'ymin':0,'xmax':9,'ymax':3,'width':9,'height':3,'area':27}`],
['catalog area and outline area',`${call(B)}['module_area']==23 and ${call(B)}['outline_area']==80`],
['outline density is a ratio',`abs(${call(B)}['outline_density']-23/80)<1e-10`],
['packing density uses box',`abs(${call(B)}['packing_density']-23/27)<1e-10`],
['two kinds of dead space',`${call(B)}['outline_dead']==57 and ${call(B)}['bbox_dead']==4`],
['compact is the full hard-module witness',`${call(best)}['legal'] is True and ${call(best)}['bbox']['area']==24 and ${call(best)}['bbox_dead']==1`],
['compaction changes only variable score',`${call(best)}['outline_density']==${call(B)}['outline_density'] and ${call(best)}['packing_density']>${call(B)}['packing_density']`],
['translation preserves width height area',`(lambda r: r['legal'] is True and r['bbox']['width']==6 and r['bbox']['height']==4 and r['bbox']['area']==24)(${call(JSON.stringify(shiftRows(BEST03,3,2)),'(12,10)')})`],
['translation retains actual origins',`${call(JSON.stringify(shiftRows(BEST03,3,2)),'(12,10)')}['bbox']['xmin']==3 and ${call(JSON.stringify(shiftRows(BEST03,3,2)),'(12,10)')}['bbox']['ymin']==2`],
['outline change does not change box',`${call(B,'(12,10)')}['bbox']==${call(B)}['bbox'] and abs(${call(B,'(12,10)')}['outline_density']-23/120)<1e-10`],
['new outline denominator',`abs(${call(JSON.stringify(TRADEOFF03),'(11,7)')}['outline_density']-23/77)<1e-10`],
['narrower can have larger area',`${call(JSON.stringify(TRADEOFF03))}['bbox']['width']==7 and ${call(JSON.stringify(TRADEOFF03))}['bbox']['area']==28 and ${call(JSON.stringify(TRADEOFF03))}['packing_density']<${call(B)}['packing_density']`],
['overlap cannot earn a score',`(lambda r: r['legal'] is False and 'overlap:C/E' in r['errors'] and all(r[k] is None for k in ['outline_density','packing_density','outline_dead','bbox_dead']))(${call(bad)})`],
['illegal raw geometry remains diagnostic',`${call(bad)}['bbox']['area']==24`],
['missing block keeps expected catalog area',`${call(B+'[:-1]')}['module_area']==23 and ${call(B+'[:-1]')}['bbox']['area']==21 and ${call(B+'[:-1]')}['packing_density'] is None`],
['all illegal score fields withheld',`all(${call(B+'[:-1]')}[k] is None for k in ['outline_density','packing_density','outline_dead','bbox_dead'])`],
['duplicate is not a new packed module',`${call(B+" + [['A',0,5,3,2]]")}['legal'] is False and ${call(B+" + [['A',0,5,3,2]]")}['outline_density'] is None`],
['fixed shape contract is inherited',`'shape:A' in ${call("[['A',0,0,2,3]]+"+B+'[1:]')}['errors'] and ${call("[['A',0,0,2,3]]+"+B+'[1:]')}['packing_density'] is None`],
['outside is filtered before ranking',`${call(B,'(8,8)')}['legal'] is False and ${call(B,'(8,8)')}['packing_density'] is None`],
['nonfinite gives no bounding box',`${call("[['A',float('nan'),0,3,2]]+"+B+'[1:]')}['bbox'] is None`],
['negative dimension gives no bounding box',`${call("[['A',0,0,-3,2]]+"+B+'[1:]')}['bbox'] is None`],
['zero dimension gives no bounding box',`${call("[['A',0,0,3,0]]+"+B+'[1:]')}['bbox'] is None`],
['empty rows have missing errors and no scores',`${call('[]')}['legal'] is False and ${call('[]')}['bbox'] is None and ${call('[]')}['bbox_dead'] is None`],
['arbitrary three-module catalog',`(lambda r: r['legal'] is True and r['module_area']==12 and r['bbox']['area']==12 and r['packing_density']==1)(${call(JSON.stringify(CANDIDATES03[1].rows),'(4,4)',JSON.stringify(THREE03))})`],
['equal area can fail the outline',`${call(JSON.stringify(CANDIDATES03[0].rows),'(4,4)',JSON.stringify(THREE03))}['bbox']['area']==12 and ${call(JSON.stringify(CANDIDATES03[0].rows),'(4,4)',JSON.stringify(THREE03))}['legal'] is False`],
['decimal coordinates are not rounded',`(lambda r: r['legal'] is True and r['bbox']['xmin']==0.5 and r['bbox']['ymin']==1.25 and r['bbox']['area']==5 and r['packing_density']==1)(metrics_report([['P',0.5,1.25,1.5,2],['Q',2,1.25,1,2]],(4,4),{'P':(1.5,2),'Q':(1,2)}))`],
['row order does not change metrics',`${call(B+'[::-1]')}==${call(B)}`],
['input remains unchanged',`(lambda rows: (lambda before: (metrics_report(rows,(10,8),${C}), rows==before)[1])([r[:] for r in rows]))(${B})`]
];
export const PYTHON03={name:'metrics_report',version:'metrics-v1',prompt:bi('实现完整评价报告 metrics_report(rows, outline, catalog)。已提供Lab2的validate_layout，无需重写。先检查合法性，再计算真实包围盒、两个密度和两种空余；非法布局只留诊断几何，不给有效分数。','Build a complete metrics report on top of the provided Lab2 validator: true extents, explicit denominators and legal-only scores.'),starter:`import math

def metrics_report(rows, outline, catalog):
    # First call validate_layout, provided below.
    # module_area comes from the full catalog, not an incomplete input list.
    # Return legal, errors, module_area, outline_area, bbox,
    # outline_density, packing_density, outline_dead, bbox_dead.
    # bbox has xmin,ymin,xmax,ymax,width,height,area, or is None.
    # Scores are ratios (0..1), not percentages. Withhold all four scores if illegal.
    raise NotImplementedError('Implement the complete metrics report')

# Provided Lab2 checker. You may use it directly.
`+PYTHON02.reference,reference:PYTHON02.reference+'\n'+implementation,tests};

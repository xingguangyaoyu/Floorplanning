import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {translatePageText as t} from '../dist/assets/page-locale.mjs';
const catalog=JSON.parse(readFileSync(new URL('../content/page-locale-en.json',import.meta.url),'utf8'));
test('reviewed catalog translates every authored entry, preserving literal placeholders',()=>{
 for(const [zh,en]of Object.entries(catalog))assert.equal(t(zh,'en').trim(),en.trim(),zh);
});
test('numeric data, error codes and expressions remain unchanged in both directions',()=>{
 for(const lang of ['en','zh'])for(const value of ['0','1','2','3','23','3×2','A','outside:E','overlap:A/D','A D H B V C V E V','ABCED','(0, 2)'])assert.equal(t(value,lang),value);
});
test('option letters do not become part of module-name template parameters',()=>{
 assert.equal(t('B. 不能，缺 B 且 A 重复','en'),'B. No: B is missing and A repeats');
 assert.equal(t('A. 合法接触','en'),'A. Legal contact');
});
test('nested diagnostics keep the outer message and translate both permutation errors',()=>{
 const actual=t('第二份编码无法解码：pos行的模块数不对（应为5个）；neg行的模块数不对（应为5个）','en');
 assert.ok(actual.startsWith('The second encoding cannot be decoded:'),actual);
 assert.ok(!/[\u4e00-\u9fff]/.test(actual),actual);assert.ok(actual.includes('pos')&&actual.includes('neg'));
});
test('dynamic values and suffixes are localized without changing geometry',()=>{
 assert.equal(t('模块 A，第1行','en'),'Block A, row 1');
 assert.equal(t('A（固定）','en'),'A (fixed)');
 assert.equal(t('区域1（栈顶） · 局部尺寸 9×3','en').includes('9×3'),true);
 assert.equal(t('包围盒 9 × 3 = 27','en'),'Bounding box 9 × 3 = 27');
 assert.equal(t('外框 8×4','en'),'Outline 8×4');
});
test('unknown prose is not mistaken for a pair of module IDs',()=>{
 assert.equal(t('这句尚未登记，含有宽和高','en'),'这句尚未登记, 含有宽和高');
});

test('diagnosis labels translate paired IDs without swallowing prose',()=>{assert.equal(t('C和E内部重叠','en'),'C and E: interior overlap');});

test('invalid decoded layouts translate the complete metric verdict',()=>assert.equal(t('未通过：E越过外框','en'),'Failed: E: outside outline'));

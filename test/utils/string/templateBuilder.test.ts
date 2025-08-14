import { describe, it, expect } from 'vitest';
import {
	escapeHTML,
	interpolate,
	compileTemplate,
	TemplateBuilder
} from 'src';

import type { InterpolateOptions } from 'src';

describe('escapeHTML', () => {
	it('应转义 &, <, >, ", \' 五种字符', () => {
		const s = `<div a="1&2">O'Reilly</div>`;
		expect(escapeHTML(s)).toBe('&lt;div a=&quot;1&amp;2&quot;&gt;O&#39;Reilly&lt;/div&gt;');
	});

	it('空字符串应原样返回', () => {
		expect(escapeHTML('')).toBe('');
	});
});

describe('interpolate - 数字占位符（数组取值）', () => {
	it('基本替换：单占位', () => {
		expect(interpolate('Hello ${0}', ['World'])).toBe('Hello World');
	});

	it('多占位与拼接', () => {
		expect(interpolate('A${0}B${1}C', ['X', 'Y'])).toBe('AXBYC');
	});

	it('占位索引带空格（应被 trim）', () => {
		expect(interpolate('A${ 0 }B', ['X'])).toBe('AXB');
	});

	it('缺省值策略：error（默认）应抛错', () => {
		expect(() => interpolate('ID=${0}, Name=${1}', ['A'])).toThrowError(
			/Missing value for placeholder \$\{1}/,
		);
	});

	it('缺省值策略：keep（保留占位符）', () => {
		expect(
			interpolate('ID=${0}, Name=${1}', ['A'], { onMissing: 'keep' }),
		).toBe('ID=A, Name=${1}');
	});

	it('缺省值策略：empty（替换为空）', () => {
		expect(
			interpolate('ID=${0}, Name=${1}', ['A'], { onMissing: 'empty' }),
		).toBe('ID=A, Name=');
	});

	it('transform：默认将 null/undefined 转为空串、其他转 String', () => {
		expect(interpolate('a=${0}, b=${1}', [null, undefined])).toBe('a=, b=');
		expect(interpolate('n=${0}', [123])).toBe('n=123');
		expect(interpolate('b=${0}', [true])).toBe('b=true');
	});

	it('transform：自定义大写转换', () => {
		const upper: InterpolateOptions['transform'] = (v) => String(v ?? '').toUpperCase();
		expect(interpolate('x=${0}', ['abC'], { transform: upper })).toBe('x=ABC');
	});
});

describe('interpolate - 命名占位符（对象取值）', () => {
	it('基本替换：单键', () => {
		expect(interpolate('Hello ${name}', { name: 'Alice' })).toBe('Hello Alice');
	});

	it('多键与拼接', () => {
		expect(
			interpolate('User=${name}, Age=${age}', { name: 'Bob', age: 30 }),
		).toBe('User=Bob, Age=30');
	});

	it('键名允许点号等任意字符（作为字面 key）', () => {
		expect(
			interpolate('foo=${a.b}', { 'a.b': 'X' }),
		).toBe('foo=X');
	});

	it('缺省值策略：error（默认）应抛错', () => {
		expect(() => interpolate('User=${name}, Age=${age}', { name: 'Bob' })).toThrowError(
			/Missing value for placeholder \$\{age}/,
		);
	});

	it('缺省值策略：keep', () => {
		expect(
			interpolate('User=${name}, Age=${age}', { name: 'Bob' }, { onMissing: 'keep' }),
		).toBe('User=Bob, Age=${age}');
	});

	it('缺省值策略：empty', () => {
		expect(
			interpolate('User=${name}, Age=${age}', { name: 'Bob' }, { onMissing: 'empty' }),
		).toBe('User=Bob, Age=');
	});

	it('transform：HTML 转义', () => {
		const htmlSafe = (v: unknown) => escapeHTML(String(v ?? ''));
		expect(
			interpolate('<b>${name}</b>', { name: '<Tom & Jerry>' }, { transform: htmlSafe }),
		).toBe('<b>&lt;Tom &amp; Jerry&gt;</b>');
	});
});

describe('interpolate - 混合占位符模板（注意：一次渲染仅支持数组或对象其一）', () => {
	it('当仅传数组时，命名占位符按缺省策略处理（keep 示例）', () => {
		expect(
			interpolate('X=${0}, Y=${name}', ['A'], { onMissing: 'keep' }),
		).toBe('X=A, Y=${name}');
	});

	it('当仅传对象时，数字占位符按缺省策略处理（empty 示例）', () => {
		expect(
			interpolate('X=${0}, Y=${name}', { name: 'B' }, { onMissing: 'empty' }),
		).toBe('X=, Y=B');
	});
});

describe('compileTemplate（预编译）', () => {
	it('应与 interpolate 输出一致', () => {
		const render = compileTemplate('Hello ${name}, n=${0}');
		expect(render({ name: 'Carol' }, { onMissing: 'keep' })).toBe('Hello Carol, n=${0}');
		expect(render(['42'], { onMissing: 'keep' })).toBe('Hello ${name}, n=42');
	});

	it('baseOptions 与 override 的优先级：override 覆盖 base', () => {
		const render = compileTemplate('Hello ${name}', { onMissing: 'keep' });
		// base keep -> 不抛错
		expect(render({})).toBe('Hello ${name}');
		// override error -> 抛错
		expect(() => render({}, { onMissing: 'error' })).toThrowError(
			/Missing value for placeholder \$\{name}/,
		);
	});

	it('baseOptions 的 transform 与 override 叠加覆盖', () => {
		const baseUpper = compileTemplate('x=${name}', {
			transform: (v) => String(v ?? '').toUpperCase(),
		});
		expect(baseUpper({ name: 'abc' })).toBe('x=ABC');

		const lowerOverride = (v: unknown) => String(v ?? '').toLowerCase();
		expect(baseUpper({ name: 'ABC' }, { transform: lowerOverride })).toBe('x=abc');
	});

	it('错误信息应包含原模板片段，便于定位', () => {
		const render = compileTemplate('User=${name}');
		try {
			render({});
			expect(false).toBe(true); // 不应执行到此
		} catch (e: any) {
			expect(String(e.message)).toMatch(/in template "User=\$\{name}"/);
		}
	});
});

describe('TemplateBuilder - 基础链式用法', () => {
	it('add（对象重载）+ build', () => {
		const b = new TemplateBuilder();
		const s = b.add('Hello ${name}', { name: 'World' }).build();
		expect(s).toBe('Hello World');
	});

	it('add（数组重载）+ 多段拼接', () => {
		const b = new TemplateBuilder();
		const s = b
			.add('A${0}', 'X')
			.add('|B${0}', 'Y')
			.build();
		expect(s).toBe('AX|BY');
	});

	it('pushRaw 直接插入原始文本', () => {
		const b = new TemplateBuilder();
		const s = b
			.pushRaw('HEAD:')
			.add(' ${0}', 'X')
			.pushRaw(' :TAIL')
			.build();
		expect(s).toBe('HEAD: X :TAIL');
	});

	it('toString 与 build 一致', () => {
		const b = new TemplateBuilder();
		b.add('Hi ${name}', { name: 'Alice' });
		expect(String(b)).toBe('Hi Alice');
		expect(b.toString()).toBe('Hi Alice');
	});
});

describe('TemplateBuilder - 条件与 when', () => {
	it('conditional(true) 应添加；conditional(false) 不添加', () => {
		const b = new TemplateBuilder();
		const s = b
			.add('Hello')
			.conditional(true, ' ${0}', 'A')
			.conditional(false, ' ${0}', 'B')
			.build();
		expect(s).toBe('Hello A');
	});

	it('when(condition, fn) 为真执行闭包，为假不执行', () => {
		const user = { name: 'Bob', isAdmin: true };
		const b = new TemplateBuilder();
		b.when(user, (bb, u) => {
			bb.add('Hello ${name}', { name: u.name }).conditional(u.isAdmin, ' (Admin)');
		});
		b.when(null as any, (bb) => {
			bb.add('触发则应看到这段'); // 不应执行
		});
		expect(b.build()).toBe('Hello Bob (Admin)');
	});
});

describe('TemplateBuilder - addWith 与策略/转换器覆盖', () => {
	it('addWith 应覆盖当前 builder 的默认选项', () => {
		const b = new TemplateBuilder({ onMissing: 'keep' });
		const s = b
			.add('A=${name}', { name: 'X' }) // 使用 keep 不影响
			.addWith('B=${age}', { /* age 缺失 */ } as any, { onMissing: 'empty' })
			.build();
		expect(s).toBe('A=XB=');
	});

	it('addWith transform：按需转义 HTML', () => {
		const b = new TemplateBuilder();
		const s = b
			.addWith('<p>${text}</p>', { text: '<b>&</b>' }, {
				transform: (v) => escapeHTML(String(v ?? '')),
			})
			.build();
		expect(s).toBe('<p>&lt;b&gt;&amp;&lt;/b&gt;</p>');
	});
});

describe('TemplateBuilder - reset / setOptions / getOptions', () => {
	it('reset 清空当前内容', () => {
		const b = new TemplateBuilder();
		b.add('X=${0}', '1');
		expect(b.build()).toBe('X=1');
		b.reset();
		b.add('Y=${0}', '2');
		expect(b.build()).toBe('Y=2');
	});

	it('setOptions 更新默认策略；getOptions 返回当前设置', () => {
		const b = new TemplateBuilder();
		expect(b.getOptions().onMissing).toBe('error');

		b.setOptions({ onMissing: 'keep' });
		expect(b.getOptions().onMissing).toBe('keep');

		// 验证生效
		const s = b.add('Z=${name}', {} as any).build();
		expect(s).toBe('Z=${name}');
	});
});

describe('边界与兼容性', () => {
	it('冗余值应被忽略，不影响渲染', () => {
		expect(interpolate('X=${0}', ['A', 'EXTRA', 'MORE'])).toBe('X=A');
	});

	it('连续占位符应正确替换', () => {
		expect(interpolate('${0}${1}${2}', ['A', 'B', 'C'])).toBe('ABC');
	});

	it('负数索引或非数字字符串不应被识别为数字索引（当作命名键处理）', () => {
		// pickValue 中 /^\d+$/ 才视为数字索引，'-1' 不匹配，将按命名键处理 -> 缺省
		expect(() =>
			interpolate('X=${-1}', []),
		).toThrowError(/Missing value for placeholder \$\{-1}/);

		// 使用 keep 保留原样
		expect(
			interpolate('X=${-1}', [], { onMissing: 'keep' }),
		).toBe('X=${-1}');
	});

	it('错误信息中应包含缺失的具体占位符及模板片段', () => {
		try {
			interpolate('A=${0}, B=${name}', ['X']); // name 缺失
			expect(false).toBe(true);
		} catch (e: any) {
			const msg = String(e.message);
			expect(msg).toMatch(/Missing value for placeholder \$\{name}/);
			expect(msg).toMatch(/in template "A=\$\{0}, B=\$\{name}"/);
		}
	});
});

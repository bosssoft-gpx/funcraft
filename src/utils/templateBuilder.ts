/**
 * 缺省值策略类型
 *
 * @description
 *
 * - 'error'：抛出错误
 * - 'empty'：替换为空字符串
 * - 'keep'：保留原占位符
 */
export type MissingStrategy = 'error' | 'empty' | 'keep';

export type InterpolateOptions = {
	/**
	 * 缺省值策略
	 *
	 * @default 'error'
	 */
	onMissing?: MissingStrategy;

	/**
	 * 转换函数：将值转换为字符串
	 *
	 * @default (v) => (v == null ? '' : String(v))
	 */
	transform?: (value: unknown) => string;
};

export type RequiredInterpolateOptions = Required<InterpolateOptions>;

export type ValueBag = unknown[] | Record<string, unknown>;

const defaultOptions: RequiredInterpolateOptions = {
	onMissing: 'error',
	transform: (v) => (v == null ? '' : String(v)),
};

/**
 * 简单 HTML 转义，可按需传入 transform 使用
 */
export const escapeHTML = (input: string): string => input
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/"/g, '&quot;')
	.replace(/'/g, '&#39;');

/** 占位符 Token */
type Token =
	| { kind: 'text'; value: string }
	| { kind: 'placeholder'; key: string; raw: string };

/**
 * 将模板字符串分解为令牌列表
 *
 * @description 解析模板 -> 令牌流（一次性解析，便于预编译和复用）
 */
const tokenize = (template: string): Token[] => {
	const tokens: Token[] = [];
	const re = /\$\{([^}]+)}/g;
	let lastIndex = 0;
	let m: RegExpExecArray | null;

	while ((m = re.exec(template))) {
		const start = m.index;
		const end = re.lastIndex;

		if (start > lastIndex) {
			tokens.push({ kind: 'text', value: template.slice(lastIndex, start) });
		}
		const raw = m[0];
		const key = m[1].trim();
		tokens.push({ kind: 'placeholder', key, raw });

		lastIndex = end;
	}

	if (lastIndex < template.length) {
		tokens.push({ kind: 'text', value: template.slice(lastIndex) });
	}
	return tokens;
}

/**
 * 支持数组或对象的值提取
 *
 * @param values 值集合（数组或对象）
 * @param key 键（可以是数字索引或命名键）
 *
 * @returns { ok: boolean; value?: unknown }
 */
const pickValue = (values: ValueBag, key: string): { ok: boolean; value?: unknown } => {
	// 纯数字 / 整数索引
	if (/^\d+$/.test(key)) {
		const i = Number(key);
		if (Array.isArray(values) && i >= 0 && i < values.length) {
			return { ok: true, value: values[i] };
		}
		return { ok: false };
	}
	// 命名键
	if (values && typeof values === 'object' && !Array.isArray(values) && key in values) {
		return { ok: true, value: values[key] };
	}
	return { ok: false };
}

/**
 * 渲染令牌列表为字符串
 *
 * @param tokens 令牌列表
 * @param values 值集合（数组或对象）
 * @param options 插值选项
 * @param templateForError 模板字符串（用于错误信息提示）
 *
 * @returns 渲染后的字符串
 */
const renderTokens = (
	tokens: Token[],
	values: ValueBag,
	options: RequiredInterpolateOptions,
	templateForError?: string,
): string => {
	let out = '';
	for (const t of tokens) {
		if (t.kind === 'text') {
			out += t.value;
			continue;
		}
		const { ok, value } = pickValue(values, t.key);
		if (!ok) {
			switch (options.onMissing) {
				case 'error':
					throw new Error(
						`Missing value for placeholder ${t.raw} ` +
						(templateForError ? `in template "${templateForError}"` : ''),
					);
				case 'keep':
					out += t.raw;
					break;
				case 'empty':
					// 空串
					break;
			}
			continue;
		}
		out += options.transform(value);
	}
	return out;
}

/**
 * 预编译模板字符串为函数
 *
 * @param template 模板字符串
 * @param baseOptions 基础插值选项（可选）
 *
 * @description 高频使用场景：预编译模板以提高性能
 *
 * @returns 返回一个函数，接受值集合和可选的插值选项，返回渲染后的字符串
 */
export const compileTemplate = (
	template: string,
	baseOptions?: InterpolateOptions,
): (values: ValueBag, optionsOverride?: InterpolateOptions) => string => {
	const tokens = tokenize(template);
	const baked = { ...defaultOptions, ...baseOptions };
	return (values: ValueBag, optionsOverride?: InterpolateOptions) => {
		const opts = { ...baked, ...optionsOverride } as RequiredInterpolateOptions;
		return renderTokens(tokens, values, opts, template);
	};
}

/**
 * 单次插值函数
 *
 * @param template 模板字符串
 * @param values 值集合（数组或对象）
 * @param options 插值选项（可选）
 *
 * @description 无需预编译，直接插值
 */
export const interpolate = (
	template: string,
	values: ValueBag,
	options?: InterpolateOptions,
): string => {
	const tokens = tokenize(template);
	const opts = { ...defaultOptions, ...options } as RequiredInterpolateOptions;
	return renderTokens(tokens, values, opts, template);
}

/**
 * 模板字符串构建器
 *
 * @description 用于动态构建复杂字符串模板，支持条件添加、预编译等功能
 *
 * @example
 *
 * ```ts
 * // 简单用法
 * const builder = new TemplateBuilder();
 * builder.add('Hello ${name}', { name: 'World' })
 *   .add('! Today is ${day}', { day: 'Monday' });
 * console.log(builder.build()); // 输出：Hello World! Today is Monday
 *
 * // 条件添加
 * const user = { name: 'Alice', isAdmin: true };
 * const builder = new TemplateBuilder();
 * builder
 *   .add('Welcome ${name}', { name: user.name })
 *   .conditional(user.isAdmin, ' (Admin)')
 *   .pushRaw('!');
 * console.log(builder.build()); // 输出：Welcome Alice (Admin)!
 *
 * // 带特定策略的添加
 * builder.addWith('Hello ${name}', { name: null }, { onMissing: 'empty' });
 * console.log(builder.build()); // 输出：Hello
 *
 * // 使用 when 方法进行复杂逻辑
 * builder.when(user, (b, u) => {
 *   b.add('Hi ${name}', { name: u.name })
 *     .conditional(u.isAdmin, ' (Admin)')
 *     .pushRaw('!');
 * });
 * console.log(builder.build()); // 输出：Hi Alice (Admin)!
 * ```
 */
export class TemplateBuilder {
	private parts: string[] = [];
	private options: RequiredInterpolateOptions;

	constructor(options?: InterpolateOptions) {
		this.options = { ...defaultOptions, ...options };
	}

	/**
	 * 添加模板字符串和对应值
	 *
	 * @example
	 *
	 * ```ts
	 * const builder = new TemplateBuilder();
	 * builder.add('Hello ${name}', { name: 'World' });
	 * console.log(builder.build()); // 输出：Hello World
	 * ```
	 */
	add(template: string, ...values: unknown[]): this;
	add(template: string, values: Record<string, unknown>): this;
	add(template: string, ...args: any[]): this {
		const isNamed = args.length === 1 && !Array.isArray(args[0]) && typeof args[0] === 'object';
		const values: ValueBag = isNamed ? (args[0] as Record<string, unknown>) : (args as unknown[]);
		this.parts.push(interpolate(template, values, this.options));
		return this;
	}

	/**
	 * 带特定策略/转化器的添加
	 *
	 * @description 用于处理缺省值或自定义转换逻辑
	 *
	 * @example
	 *
	 * ```ts
	 * const builder = new TemplateBuilder();
	 * builder.addWith('Hello ${name}', { name: null }, { onMissing: 'empty' });
	 * console.log(builder.build()); // 输出：Hello
	 * ```
	 */
	addWith(
		template: string,
		values: ValueBag,
		options?: InterpolateOptions,
	): this {
		this.parts.push(interpolate(template, values, { ...this.options, ...options }));
		return this;
	}

	/**
	 * 条件添加：如果 condition 为 true，则添加模板字符串
	 *
	 * @description 适用于简单条件逻辑
	 *
	 * @example
	 *
	 * ```ts
	 * const builder = new TemplateBuilder();
	 * builder.conditional(true, 'Hello ${name}', { name: 'World' });
	 * console.log(builder.build()); // 输出：Hello World
	 */
	conditional(condition: boolean, template: string, ...values: unknown[]): this;
	conditional(condition: boolean, template: string, values: Record<string, unknown>): this;
	conditional(condition: boolean, template: string, ...args: any[]): this {
		if (condition) {
			// 复用 add 的重载判断
			// @ts-ignore
			this.add(template, ...args);
		}
		return this;
	}

	/**
	 * 条件执行：如果 condition 为真，则执行 fn
	 *
	 * @description 适用于更复杂的逻辑处理，如：
	 * - 条件拼接多个模板
	 * - 条件执行复杂逻辑
	 *
	 * @example
	 *
	 * ```ts
	 * const user = {
	 * 	name: 'Alice',
	 * 	isAdmin: true,
	 * };
	 *
	 * const builder = new TemplateBuilder();
	 * builder.when(user, (b, u) => {
	 *   b.add('Hello ${name}', { name: u.name })
	 *     .conditional(u.isAdmin, ' (Admin)')
	 *     .pushRaw('!');
	 * });
	 * console.log(builder.build()); // 输出：Hello Alice (Admin)!
	 */
	when<T>(condition: T, fn: (builder: this, value: T) => void): this {
		if (condition) fn(this, condition);
		return this;
	}

	/**
	 * 直接推入原始文本
	 *
	 * @description 用于添加不需要插值的静态文本
	 *
	 * @example
	 *
	 * ```ts
	 * const builder = new TemplateBuilder();
	 * builder.pushRaw('This is a static text.');
	 * console.log(builder.build()); // 输出：This is a static text.
	 * ```
	 */
	pushRaw(text: string): this {
		this.parts.push(text);
		return this;
	}

	/**
	 * 重置构建器
	 *
	 * @description 清空当前所有部分，便于重用同一个构建器实例
	 *
	 * @example
	 * ```ts
	 * const builder = new TemplateBuilder();
	 * builder.add('Hello ${name}', { name: 'World' });
	 * console.log(builder.build()); // 输出：Hello World
	 *
	 * builder.reset(); // 清空
	 *
	 * builder.add('Goodbye ${name}', { name: 'World' });
	 * console.log(builder.build()); // 输出：Goodbye World
	 * ```
	 */
	reset(): this {
		this.parts.length = 0;
		return this;
	}

	/**
	 * 构建最终字符串
	 *
	 * @description 将所有添加的部分合并为一个字符串
	 *
	 * @example
	 * ```ts
	 * const builder = new TemplateBuilder();
	 * builder.add('Hello ${name}', { name: 'World' });
	 * console.log(builder.build()); // 输出：Hello World
	 * ```
	 */
	build(): string {
		return this.parts.join('');
	}

	/**
	 * 将构建器转换为字符串
	 *
	 * @description 便于直接使用模板字符串
	 *
	 * @example
	 * ```ts
	 * const builder = new TemplateBuilder();
	 * builder.add('Hello ${name}', { name: 'World' });
	 * console.log(String(builder)); // 输出：Hello World
	 * ```
	 */
	toString(): string {
		return this.build();
	}

	/**
	 * 更新当前默认插值选项
	 *
	 * @description 用于动态调整缺省值策略或转换函数
	 *
	 * @example
	 * ```ts
	 * const builder = new TemplateBuilder();
	 *
	 * builder.setOptions({ onMissing: 'empty' });
	 * builder.add('Hello ${name}', { name: null });
	 *
	 * console.log(builder.build()); // 输出：Hello
	 * ```
	 */
	setOptions(options: InterpolateOptions): this {
		this.options = { ...this.options, ...options };
		return this;
	}

	/**
	 * 获取当前插值选项
	 *
	 * @description 用于查看当前的缺省值策略和转换函数
	 *
	 * @example
	 * ```ts
	 * const builder = new TemplateBuilder();
	 * builder.setOptions({ onMissing: 'empty' });
	 * console.log(builder.getOptions()); // 输出当前选项
	 *
	 * // 输出：{ onMissing: 'empty', transform: [Function: transform] }
	 * ```
	 */
	getOptions(): RequiredInterpolateOptions {
		return this.options;
	}
}

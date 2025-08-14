📦 更新日志
该项目的更新日志遵循 Keep a Changelog 格式，并遵循 语义化版本控制 规范。

[0.1.4-beta.0] - 2025-08-14
✨ 新增
新增 模板字符串构建工具 TemplateBuilder 及相关方法：

支持 数字占位符（${0}）和 命名占位符（${name}）两种插值模式；

支持缺省值策略：error（缺值抛错）、empty（缺值置空）、keep（保留占位符）；

支持 transform 转换器，仅处理占位符值，可用于 HTML 转义、格式化等场景；

支持 compileTemplate 预编译模板，提高高频渲染性能；

支持链式 API：add / addWith / conditional / when / pushRaw / reset / build；

提供 escapeHTML 工具函数，方便在 transform 中做安全处理；

类型安全，兼容数组与对象值输入，支持泛型推导；

纯函数与可链式调用设计，不修改原始数据，便于组合与复用；

已提供详细文档与完整 Vitest 测试用例。

[0.1.3-beta.0] - 2025-06-14
✨ 新增
`formatFileSize` 函数拓展“省略小数位”的选项: `{options: { omitDecimal: true }}`，用于格式化文件大小时省略小数位。

同时为其提供了完整 Vitest 测试用例。

[0.1.2-beta.0] - 2025-06-11
✨ 新增
新增工具函数 omit(obj, fields)：

支持从对象中排除一个或多个字段，返回新对象；

保持类型安全，支持泛型推导；

支持只读字段数组作为输入；

遵循纯函数设计，原对象不会被修改；

已提供完整的文档与 Vitest 测试用例。


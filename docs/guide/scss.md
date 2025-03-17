# 🎨 SCSS 变量与 Mixins 使用说明

`@gpx/common-funcraft` 工具库内置了一系列符合 **Fusion Design 风格** 的 SCSS 变量和实用 Mixins，帮助开发者快速实现统一的
UI 样式风格、减少样式代码重复。

## 🚀 特性

- ✅ **主题变量统一**：内置 Fusion Design 风格的 SCSS 变量，确保风格统一
- 🎯 **便捷 Mixins**：提供常用样式效果（如滚动条优化、加载动画优化等）
- ⚙️ **可扩展性强**：所有变量使用 `!default`，支持自定义覆盖

---

## 📌 如何引用

推荐使用 `@use` 语法引用，避免全局污染：

```scss
@use "@gpx/common-funcraft/es/styles/variables" as *;
@use "@gpx/common-funcraft/es/styles/mixins" as mixins;

// 使用示例：
.button {
  background-color: $c-primary;
  color: white;

  @include mixins.full-content;
}
```

---

## 🎨 内置变量说明

以下展示了常用 SCSS 变量及其含义。

### 📌 色彩变量

| 变量名                | 默认值                       | 描述      |
|--------------------|---------------------------|---------|
| `$c-primary`       | `#0a82e5`                 | 主题主色    |
| `$c-primary-hover` | `rgba($c-primary, 0.8)`   | 主题主色悬浮色 |
| `$c-secondary`     | `rgba(59, 155, 234, 0.5)` | 辅助色     |
| `$c-success`       | `#67c23a`                 | 成功提示色   |
| `$c-warning`       | `#e6a23c`                 | 警告提示色   |
| `$c-danger`        | `#f56c6c`                 | 危险提示色   |
| `$c-info`          | `#909399`                 | 信息提示色   |
| `$c-error`         | `#f56c6c`                 | 错误提示色   |

### 📌 文本颜色变量

| 变量名             | 默认值       | 描述    |
|-----------------|-----------|-------|
| `$c-text`       | `#333333` | 主文本颜色 |
| `$c-text-light` | `#999999` | 次文本颜色 |

### 📌 边框与阴影变量

| 变量名                       | 默认值                                                                                               | 描述     |
|---------------------------|---------------------------------------------------------------------------------------------------|--------|
| `$c-border`               | `#cccccc`                                                                                         | 默认边框色  |
| `$c-box-shadow`           | `rgba(0, 0, 0, 0.15)`                                                                             | 默认阴影   |
| `$c-box-shadow-hover`     | `rgba(0, 0, 0, 0.3)`                                                                              | 悬浮阴影效果 |
| `$c-box-shadow-secondary` | `0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)` | 次级阴影   |

### 📌 尺寸与布局变量

| 变量名                     | 默认值    | 描述       |
|-------------------------|--------|----------|
| `$c-font-size`          | `14px` | 默认字体大小   |
| `$c-line-height`        | `1.6`  | 默认行高     |
| `$c-text-align`         | `left` | 默认文本对齐方式 |
| `$c-z-index-popup-base` | `1000` | 弹出层基础层级  |

### 📌 控件尺寸变量

| 变量名                    | 默认值    | 描述     |
|------------------------|--------|--------|
| `$c-control-height-xs` | `16px` | 极小控件高度 |
| `$c-control-height-sm` | `24px` | 小型控件高度 |
| `$c-control-height-lg` | `40px` | 大型控件高度 |

### 📌 圆角变量

| 变量名                   | 默认值   | 描述   |
|-----------------------|-------|------|
| `$c-border-radius-xx` | `2px` | 极小圆角 |
| `$c-border-radius-sm` | `4px` | 小圆角  |
| `$c-border-radius-lg` | `8px` | 大圆角  |

### 📌 间距变量

| 变量名             | 默认值    | 描述   |
|-----------------|--------|------|
| `$c-margin-xxs` | `4px`  | 极小间距 |
| `$c-margin-xs`  | `8px`  | 小间距  |
| `$c-margin-sm`  | `12px` | 小型间距 |
| `$c-margin`     | `16px` | 默认间距 |
| `$c-margin-md`  | `20px` | 中等间距 |
| `$c-margin-lg`  | `24px` | 较大间距 |
| `$c-margin-xl`  | `32px` | 大间距  |
| `$c-margin-xxl` | `48px` | 超大间距 |

---

## 🛠️ 常用 Mixins 说明

### 📌 滚动条优化 (`scroll-bar`)

> 用于统一美化滚动条样式，支持 Webkit 和 Firefox 浏览器，提升用户体验。

**示例：**

```scss
.scroll-container {
  @include mixins.scroll-bar;
}
```

---

### 📌 Fusion 加载动画优化 (`gpx-loading`)

> 修复 Fusion Design 加载动画在 flex 布局等情况下的显示问题。

**示例：**

```scss
.loading-container {
  @include mixins.gpx-loading;
}
```

---

### 📌 白色背景加载动画 (`white-loading`)

> 设置 Fusion Design 加载动画的遮罩背景为纯白，提供统一的视觉效果。

**示例：**

```scss
.loading-mask {
  @include mixins.white-loading;
}
```

---

### 📌 全屏内容占位 (`full-content`)

> 快速设置元素占满父容器空间（宽高100%）。

**示例：**

```scss
.full-screen-container {
  @include mixins.full-content;
}
```

---

## 🔗 其他文档索引

- 📌 [React Hook 使用指南](hook.md)
- 🛠️ [工具函数使用指南](function.md)
- 📜 [类型声明说明](type.md)
- 📆 [更新日志](../CHANGELOG.md)

---

📚 返回 [README](../../README.md) 查看完整文档索引。
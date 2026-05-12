# 📜 类型声明使用说明

本工具库提供了一组通用的辅助类型声明，旨在帮助开发者提升代码的可读性、增强类型安全性，并更轻松地处理网络请求相关场景。

> **注意**：以下类型声明已迁移至 [`@gpx/ca-core`](http://192.168.8.48/yangjunhao/ca-core) 维护，建议新项目直接使用该包中的类型定义。
> 本项目将不再提供该部分的更新与维护。以下内容仅供参考。
>
> **当前公共导出说明**：本包当前没有为这些请求相关类型提供稳定 public entrypoint。若你还能在源码或构建目录中看到对应文件，请将其视为迁移残留，而不是建议依赖的 API 面。

## 🚀 辅助类型列表

| 类型                                                      | 说明                |
|---------------------------------------------------------|-------------------|
| [`ResponseData`](#responsedata)                         | 标准化的 API 响应结构定义   |
| [`TResponsePromise`](#tresponsepromise)                 | API 响应 Promise 类型 |
| [`TRequestFunction`](#trequestfunction)                 | 通用请求方法类型定义        |
| [`TPossibleResponse`](#tpossibleresponse)               | 可兼容多种响应格式的联合类型声明  |
| [`TPossibleRequestFunction`](#tpossiblerequestfunction) | 请求函数的标准类型定义       |

---

### 📌 `ResponseData`

标准化的 API 响应结构，便于统一处理服务端响应数据。

```typescript
interface ResponseData<T> {
    /** 响应数据 */
    data?: T;

    /** 响应提示信息 */
    message?: string;

    /** 响应编码或状态（一般后端业务状态码）*/
    success?: boolean;

    /** 响应 UUID，用于请求追踪 */
    requestId?: string;

    /** 响应是否成功 */
    success?: boolean;
}
```

#### 🌰 示例

```typescript
const response: ResponseData<User> = {
    code: '200',
    data: { name: 'Alice', age: 25 },
    message: '获取成功',
    requestId: 'uuid-12345678',
    success: true
};
```

---

### 📌 `TResponsePromise`

基于 `ResponseData<T>` 定义的 API 请求返回的 Promise 类型，便于统一处理异步响应的类型约定。

```typescript
type TResponsePromise<T> = Promise<ResponseData<T>>;
```

#### 使用示例

```typescript
// 请求用户信息的函数
const getUserInfo = (): TResponsePromise<User> => {
    return axios.get('/api/user');
};

// 使用
getUser().then((res) => {
    if (res.success) {
        console.log(res.data);
    }
});
```

---

### 📌 `TRequestFunction`

定义了一个标准的 API 请求方法类型。

```typescript
type TRequestFunction<T = any> = (params: AxiosRequestConfig) => Promise<TResponsePromise<T>>;
```

#### 使用示例：

```typescript
const fetchUser: TRequestFunction<User> = (params) => {
    return axios.request({ method: 'GET', url: '/api/user', ...params });
};

// 使用
fetchUser({ params: { id: 123 } }).then((res) => {
    if (res.success && res.data) {
        console.log(res.data.name);
    }
});
```

---

### 📌 `TPossibleResponse`

定义 API 响应的可能类型，兼容多种响应格式的情况。

```typescript
type TPossibleResponse<T> =
    | AxiosResponse<ResponseData<T>>
    | Required<ResponseData<T>>['data']
    | ResponseData<T>;
```

#### 🌰 示例说明

```typescript
function handleResponse<T>(response: TPossibleResponse<T>): T | undefined {
    if ('data' in response) {
        return response.data;
    } else {
        return response;
    }
}
```

---

### 📌 `TPossibleRequestFunction`

适用于处理响应数据类型不统一的请求函数类型声明：

```typescript
type TPossibleRequestFunction<T> = (params: AxiosRequestConfig) => Promise<TPossibleResponse<T>>;
```

**使用示例：**

```typescript
const getUserInfo: TPossibleRequestFunction<User> = async (config) => {
    const response = await axios.request(config);
    return response.data;
};
```

---

## 🔗 其他文档索引

- 📌 [React Hook 使用指南](hook.md)
- 🎨 [SCSS 变量 & Mixin 说明](scss.md)
- 🛠️ [工具函数使用指南](function.md)
- 📆 [更新日志](../CHANGELOG.md)

---
📌 若你仍在迁移历史项目，请结合 `docs/recipes/migrate-request-types-to-ca-core.md` 制定收口步骤，而不是继续扩散深路径依赖。

📚 返回 [README](../../README.md) 查看完整文档索引。

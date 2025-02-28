/**
 * 判断传入的值是否为 Email 地址。
 *
 * 使用正则表达式检测传入字符串是否符合常见的 Email 格式。
 *
 * @param value 需要判断的值。
 * @returns 如果是 Email 地址，则返回 `true`，否则返回 `false`。
 *
 * @example
 * ```ts
 * const result = isEmail("example@example.com"); // 返回 true
 * const result2 = isEmail("not-an-email"); // 返回 false
 * ```
 */
export const isEmail = (value: string): boolean => {
    if (typeof value !== 'string') return false;
    const emailReg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    return emailReg.test(value);
};

/**
 * 判断传入的值是否为手机号码。
 *
 * 使用正则表达式检测传入字符串是否符合中国大陆常用的手机号码格式（11 位数字，首位为1，第二位为 3-9）。
 *
 * @param value 需要判断的值。
 * @returns 如果是手机号码，则返回 `true`，否则返回 `false`。
 *
 * @example
 * ```ts
 * const result = isMobile("13800138000"); // 返回 true
 * const result2 = isMobile("1234567890");  // 返回 false
 * ```
 */
export const isMobile = (value: string): boolean => {
    if (typeof value !== 'string') return false;
    const mobileReg = /^1[3456789]\d{9}$/;
    return mobileReg.test(value);
};

/**
 * 判断传入的值是否为固定电话。
 *
 * 使用正则表达式检测传入字符串是否符合常见的固定电话号码格式（区号-号码，如 010-12345678）。
 *
 * @param value 需要判断的值。
 * @returns 如果是固定电话，则返回 `true`，否则返回 `false`。
 *
 * @example
 * ```ts
 * const result = isPhone("010-12345678"); // 返回 true
 * const result2 = isPhone("12345678");      // 返回 false
 * ```
 */
export const isPhone = (value: string): boolean => {
    if (typeof value !== 'string') return false;
    const phoneReg = /^0\d{2,3}-\d{7,8}$/;
    return phoneReg.test(value);
};


/**
 * 判断传入的值是否为空。
 *
 * 空值包括：
 * - `null`
 * - `undefined`
 * - 空字符串 `""`
 * - 空数组 `[]`
 * - 空对象 `{}`
 *
 * @param value 需要判断的值。
 * @returns 如果值为空，则返回 `true`，否则返回 `false`。
 *
 * @example
 * isEmpty(null); // true
 * isEmpty(undefined); // true
 * isEmpty(""); // true
 * isEmpty([]); // true
 * isEmpty({}); // true
 * isEmpty(0); // false
 * isEmpty("Hello"); // false
 * isEmpty([1, 2, 3]); // false
 * isEmpty({ key: "value" }); // false
 */
export const isEmpty = (value: any): boolean => {
    if (value == null) return true; // 处理 null 和 undefined
    if (typeof value === 'string' && value.trim() === '') return true; // 空字符串
    if (Array.isArray(value) && value.length === 0) return true; // 空数组
    if (typeof value === 'object' && Object.keys(value).length === 0) return true; // 空对象

    return false;
};


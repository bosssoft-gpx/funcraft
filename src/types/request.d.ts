import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ResponseData<T> {
    /** 编码 :200成功，其他都是异常 */
    code: string;

    /** 响应数据 */
    data?: T;

    /** 响应提示信息 */
    message?: string;

    /** 响应UUID */
    requestId?: string;

    /** 响应是否成功 */
    success?: boolean;
}

export type TResponsePromise<T> = Promise<ResponseData<T>>;

export type TRequestFunction<T = any> = (params: AxiosRequestConfig) => TResponsePromise<T>;

export type ExtractResponseType<T> = T extends TResponsePromise<infer R> ? R : never;

/**
 * 项目中可能存在的响应类型
 */
export type TPossibleResponse<T> =
    | AxiosResponse<ResponseData<T>, any>
    | Required<ResponseData<T>>['data']
    | ResponseData<T>;

export type TPossibleRequestFunction<T> = (params: AxiosRequestConfig) => Promise<TPossibleResponse<T>>;
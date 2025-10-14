/**
 * 统一请求封装（基于 uni.request）
 * - baseURL、headers、错误码处理
 * - get/post 简化方法
 */
const BASE_URL = ''; // TODO: 配置你的后端地址

function mergeUrl(url) {
  if (!url.startsWith('http')) return `${BASE_URL}${url}`;
  return url;
}

export async function http(opts) {
  const { url, method = 'GET', data, headers } = opts;
  const token = tryGetToken();

  const finalHeaders = {
    'Content-Type': 'application/json',
    ...(headers || {}),
  };
  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    uni.request({
      url: mergeUrl(url),
      method,
      data,
      header: finalHeaders,
      timeout: opts.timeout ?? 15000,
      success(res) {
        const status = res.statusCode || 0;
        const body = res.data;
        if (status >= 200 && status < 300) {
          resolve({ ok: true, status, data: body });
        } else {
          handleError(status, body);
          resolve({ ok: false, status, error: body });
        }
      },
      fail(err) {
        handleError(-1, err);
        reject({ ok: false, status: -1, error: err });
      },
      complete() {
        // 可在此做统一 loading 结束处理
      },
    });
  });
}

export const get = (url, params, headers) =>
  http({ url, method: 'GET', data: params, headers });

export const post = (url, data, headers) =>
  http({ url, method: 'POST', data, headers });

function tryGetToken() {
  try {
    const v = uni.getStorageSync('app:token');
    return typeof v === 'string' ? v : null;
  } catch {
    return null;
  }
}

function handleError(status, payload) {
  const msg = normalizeErrorMessage(status, payload);
  try {
    uni.showToast({ title: msg, icon: 'none' });
  } catch {}
  // TODO: 将错误上报到日志系统
}

function normalizeErrorMessage(status, payload) {
  if (status === -1) return '网络连接失败，请稍后重试';
  if (status === 401) return '登录已过期，请重新登录';
  if (status >= 500) return '服务器异常，请稍后再试';
  if (payload && typeof payload === 'object' && payload.message) return String(payload.message);
  return `请求失败(${status})`;
}
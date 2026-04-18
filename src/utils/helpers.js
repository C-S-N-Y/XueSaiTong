let showToastFn = () => {};
export const setToastFunction = (fn) => { showToastFn = fn; };
export const showToast = (message, type = 'success') => { showToastFn(message, type); };

export const runAction = async (asyncFn, options = {}) => {
  const { loadingMessage, successMessage, errorMessage } = options;
  try {
    if (loadingMessage) showToast(loadingMessage, 'info');
    const result = await asyncFn();
    if (successMessage) showToast(successMessage, 'success');
    return result;
  } catch (error) {
    const msg = errorMessage || error.message || '操作失败';
    showToast(msg, 'error');
    throw error;
  }
};
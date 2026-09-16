// 表单验证工具
import { useState } from 'react';

/**
 * 表单验证工具类
 */
export class FormValidator {
  /**
   * 验证必填字段
   */
  static required(value, fieldName = '此字段') {
    if (value === null || value === undefined || value === '') {
      return {
        valid: false,
        message: `${fieldName}不能为空`
      };
    }
    return { valid: true };
  }

  /**
   * 验证邮箱格式
   */
  static email(value, fieldName = '邮箱') {
    if (!value) {
      return { valid: true }; // 如果不是必填，空值通过
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return {
        valid: false,
        message: `${fieldName}格式不正确`
      };
    }
    return { valid: true };
  }

  /**
   * 验证手机号格式
   */
  static phone(value, fieldName = '手机号') {
    if (!value) {
      return { valid: true };
    }

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(value)) {
      return {
        valid: false,
        message: `${fieldName}格式不正确`
      };
    }
    return { valid: true };
  }

  /**
   * 验证最小长度
   */
  static minLength(value, min, fieldName = '此字段') {
    if (!value) {
      return { valid: true };
    }

    if (value.length < min) {
      return {
        valid: false,
        message: `${fieldName}至少需要${min}个字符`
      };
    }
    return { valid: true };
  }

  /**
   * 验证最大长度
   */
  static maxLength(value, max, fieldName = '此字段') {
    if (!value) {
      return { valid: true };
    }

    if (value.length > max) {
      return {
        valid: false,
        message: `${fieldName}不能超过${max}个字符`
      };
    }
    return { valid: true };
  }

  /**
   * 验证数字范围
   */
  static range(value, min, max, fieldName = '此字段') {
    if (value === null || value === undefined || value === '') {
      return { valid: true };
    }

    const num = Number(value);
    if (isNaN(num)) {
      return {
        valid: false,
        message: `${fieldName}必须是数字`
      };
    }

    if (num < min || num > max) {
      return {
        valid: false,
        message: `${fieldName}必须在${min}到${max}之间`
      };
    }
    return { valid: true };
  }

  /**
   * 验证URL格式
   */
  static url(value, fieldName = 'URL') {
    if (!value) {
      return { valid: true };
    }

    try {
      new URL(value);
      return { valid: true };
    } catch {
      return {
        valid: false,
        message: `${fieldName}格式不正确`
      };
    }
  }

  /**
   * 批量验证
   */
  static validateAll(validations) {
    const errors = [];
    
    for (const validation of validations) {
      const result = validation();
      if (!result.valid) {
        errors.push(result.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * 错误处理工具类
 */
export class ErrorHandler {
  /**
   * 处理API错误
   */
  static handleApiError(error) {
    console.error('API Error:', error);

    if (error.response) {
      // 服务器返回的错误
      return {
        type: 'api_error',
        message: error.response.data?.message || '服务器错误',
        status: error.response.status
      };
    } else if (error.request) {
      // 请求发送但没有收到响应
      return {
        type: 'network_error',
        message: '网络连接失败，请检查网络设置'
      };
    } else {
      // 其他错误
      return {
        type: 'unknown_error',
        message: error.message || '未知错误'
      };
    }
  }

  /**
   * 处理表单错误
   */
  static handleFormError(error) {
    console.error('Form Error:', error);

    if (error instanceof TypeError) {
      return {
        type: 'type_error',
        message: '数据类型错误'
      };
    } else if (error instanceof SyntaxError) {
      return {
        type: 'syntax_error',
        message: '数据格式错误'
      };
    } else {
      return {
        type: 'form_error',
        message: error.message || '表单处理错误'
      };
    }
  }

  /**
   * 处理存储错误
   */
  static handleStorageError(error) {
    console.error('Storage Error:', error);

    if (error.name === 'QuotaExceededError') {
      return {
        type: 'quota_exceeded',
        message: '存储空间不足，请清理一些数据'
      };
    } else if (error.name === 'SecurityError') {
      return {
        type: 'security_error',
        message: '存储访问被拒绝'
      };
    } else {
      return {
        type: 'storage_error',
        message: '存储操作失败'
      };
    }
  }

  /**
   * 用户友好的错误消息
   */
  static getUserFriendlyMessage(error) {
    const errorHandlers = {
      api_error: this.handleApiError,
      form_error: this.handleFormError,
      storage_error: this.handleStorageError
    };

    const handler = errorHandlers[error.type] || (() => ({
      type: 'unknown_error',
      message: '操作失败，请稍后重试'
    }));

    return handler(error);
  }
}

/**
 * React Hook: 表单验证
 */
export function useFormValidation(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const fieldRules = validationRules[name];
    if (!fieldRules) {
      return null;
    }

    for (const rule of fieldRules) {
      const result = rule(value, name);
      if (!result.valid) {
        return result.message;
      }
    }

    return null;
  };

  const handleChange = (name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, values[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    for (const fieldName in validationRules) {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    setTouched(
      Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    return isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: Object.keys(errors).every(key => !errors[key])
  };
}
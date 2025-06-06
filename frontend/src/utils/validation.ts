const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const PHONE_REGEX = /^[1-9]\d{6,10}$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

export const validate = {
  email: (email: string) => {
    if (!email) return '请输入邮箱地址';
    if (!EMAIL_REGEX.test(email)) return '请输入有效的邮箱地址';
    return '';
  },
  
  password: (password: string) => {
    if (!password) return '请输入密码';
    if (!STRONG_PASSWORD_REGEX.test(password)) return '密码至少包含大小写字母和数字，且长度至少为8位';
    return '';
  },
  
  phone: (phone: string) => {
    if (!phone) return '请输入电话号码';
    if (!PHONE_REGEX.test(phone)) return '请输入有效的电话号码';
    return '';
  },
  
  name: (name: string) => {
    if (!name) return '请输入姓名';
    return '';
  },
  
  username: (username: string) => {
    if (!username) return '请输入用户名';
    if (username.length < 4) return '用户名至少为4位';
    return '';
  },
  
  company: (company: string) => {
    if (!company) return '请输入公司名称';
    return '';
  }
};
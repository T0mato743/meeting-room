import pool from '../config/db';

export const safeExecute = async (query: string, params: any[] = []) => {
    try {
        const [result] = await pool.execute(query, params);
        return result;
    } catch (error) {
        console.error('数据库执行错误:', error);
        throw new Error('数据库操作失败');
    }
};
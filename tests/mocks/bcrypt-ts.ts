export const genSaltSync = () => 'salt';
export const hashSync = (password: string, _salt?: string) => `hashed:${password}`;
export const compareSync = (password: string, hash: string) => hash === `hashed:${password}`;
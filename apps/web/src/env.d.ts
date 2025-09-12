/// <reference types="vite/client" />

// Если вдруг где-то ещё импортируешь *.json нестандартно,
// эта декларация снимет подчёркивания.
declare module "*.json" {
  const value: any;
  export default value;
}

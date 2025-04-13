// Declare missing module types to ensure TypeScript compatibility

declare module 'stylis-plugin-rtl' {
  import { Plugin } from 'stylis';
  const plugin: Plugin;
  export default plugin;
}

declare module 'jss-rtl' {
  import { JssPlugin } from 'jss';
  export default function rtl(): JssPlugin;
}

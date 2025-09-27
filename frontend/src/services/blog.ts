import { moduleLoaded } from '@/utils/debug';

moduleLoaded('blog.ts')

// Facade for backward compatibility: re-export dedicated blog-related service modules
export * from './authors';
export * from './categories';
export * from './comments';
export * from './newsletter';
export * from './pages';
export * from './posts';
export * from './settings';
export * from './tags';

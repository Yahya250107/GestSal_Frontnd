import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Client },
  { path: 'employes', renderMode: RenderMode.Client },
  { path: 'salaires', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Client },
];
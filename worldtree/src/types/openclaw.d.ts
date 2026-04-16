declare module '@openclaw/types' {
  export interface Plugin {
    name: string;
    version: string;
    [key: string]: any;
  }

  export interface Context {
    [key: string]: any;
  }

  export interface LifecycleEvent {
    type: string;
    [key: string]: any;
  }

  export interface MessageEvent {
    content: string;
    [key: string]: any;
  }
}

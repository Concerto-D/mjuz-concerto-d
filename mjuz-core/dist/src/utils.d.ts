/// <reference types="node" />
import { Future, Stream } from '@funkia/hareactive';
import Timeout = NodeJS.Timeout;
export declare const sigint: () => Future<void>;
export declare const sigquit: () => Future<void>;
export declare const sigterm: () => Future<void>;
export declare const keepAlive: () => Timeout;
export declare const intervalStream: (intervalMs: number) => Stream<void>;
export declare const showDictWithoutProvider: (dict: any) => void;

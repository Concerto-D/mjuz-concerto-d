import * as grpc from '@grpc/grpc-js';
import { Logger } from 'pino';
export declare const startService: <D extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation>>(name: string, definition: D, impl: grpc.UntypedServiceImplementation, host: string, port: number, logger: Logger) => Promise<() => Promise<void>>;

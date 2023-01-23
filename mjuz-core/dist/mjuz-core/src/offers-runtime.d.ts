import { Behavior, Future, Stream } from '@funkia/hareactive';
import { IO } from '@funkia/io';
import * as rpc from '@mjuz/grpc-protos';
import { Offer, Remote, ResourcesService } from './resources-service';
import { DeploymentService } from './deployment-service';
import { Logger } from 'pino';
declare type Remotes = Record<string, [Remote, rpc.DeploymentClient]>;
export declare const accumRemotes: (upsert: Stream<Remote>, remove: Stream<Remote>) => Behavior<Behavior<Remotes>>;
declare type Offers = Record<string, Offer<unknown>>;
export declare const resendOffersOnConnect: (offers: Behavior<Offers>, connects: Stream<Remotes>, deploymentName: string, logger: Logger) => Stream<IO<void>>;
export declare type OffersRuntime = {
    inboundOfferUpdates: Stream<void>;
    stop: () => Promise<void>;
};
export declare const startOffersRuntime: (deployment: DeploymentService, resources: ResourcesService, initialized: Future<void>, deploymentName: string, heartbeatInterval: number, logger: Logger) => Promise<OffersRuntime>;
export {};

import { Stream } from '@funkia/hareactive';
import * as rpc from '@mjuz/grpc-protos';
import { Logger } from 'pino';
export declare const toDeploymentOffer: <O>(offer: rpc.DeploymentOffer) => DeploymentOffer<O>;
export declare type DeploymentOffer<O> = Omit<rpc.DeploymentOffer.AsObject, 'offer'> & {
    offer?: O;
};
export declare type DeploymentService = {
    offerUpdated: Stream<DeploymentOffer<unknown>>;
    offerWithdrawn: Stream<[DeploymentOffer<unknown>, () => void]>;
    stop: () => Promise<void>;
};
export declare const startDeploymentService: (host: string, port: number, logger: Logger) => Promise<DeploymentService>;

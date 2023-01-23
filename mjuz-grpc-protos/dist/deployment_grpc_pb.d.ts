// package: mjuz
// file: deployment.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import {handleClientStreamingCall} from "@grpc/grpc-js/build/src/server-call";
import * as deployment_pb from "./deployment_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";
import * as google_protobuf_struct_pb from "google-protobuf/google/protobuf/struct_pb";

interface IDeploymentService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    offer: IDeploymentService_Ioffer;
    releaseOffer: IDeploymentService_IreleaseOffer;
    heartbeat: IDeploymentService_Iheartbeat;
}

interface IDeploymentService_Ioffer extends grpc.MethodDefinition<deployment_pb.DeploymentOffer, google_protobuf_empty_pb.Empty> {
    path: "/mjuz.Deployment/offer";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<deployment_pb.DeploymentOffer>;
    requestDeserialize: grpc.deserialize<deployment_pb.DeploymentOffer>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDeploymentService_IreleaseOffer extends grpc.MethodDefinition<deployment_pb.DeploymentOffer, google_protobuf_empty_pb.Empty> {
    path: "/mjuz.Deployment/releaseOffer";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<deployment_pb.DeploymentOffer>;
    requestDeserialize: grpc.deserialize<deployment_pb.DeploymentOffer>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDeploymentService_Iheartbeat extends grpc.MethodDefinition<google_protobuf_empty_pb.Empty, google_protobuf_empty_pb.Empty> {
    path: "/mjuz.Deployment/heartbeat";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    requestDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}

export const DeploymentService: IDeploymentService;

export interface IDeploymentServer extends grpc.UntypedServiceImplementation {
    offer: grpc.handleUnaryCall<deployment_pb.DeploymentOffer, google_protobuf_empty_pb.Empty>;
    releaseOffer: grpc.handleUnaryCall<deployment_pb.DeploymentOffer, google_protobuf_empty_pb.Empty>;
    heartbeat: grpc.handleUnaryCall<google_protobuf_empty_pb.Empty, google_protobuf_empty_pb.Empty>;
}

export interface IDeploymentClient {
    offer(request: deployment_pb.DeploymentOffer, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    offer(request: deployment_pb.DeploymentOffer, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    offer(request: deployment_pb.DeploymentOffer, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    releaseOffer(request: deployment_pb.DeploymentOffer, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    releaseOffer(request: deployment_pb.DeploymentOffer, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    releaseOffer(request: deployment_pb.DeploymentOffer, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    heartbeat(request: google_protobuf_empty_pb.Empty, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    heartbeat(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    heartbeat(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
}

export class DeploymentClient extends grpc.Client implements IDeploymentClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public offer(request: deployment_pb.DeploymentOffer, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public offer(request: deployment_pb.DeploymentOffer, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public offer(request: deployment_pb.DeploymentOffer, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public releaseOffer(request: deployment_pb.DeploymentOffer, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public releaseOffer(request: deployment_pb.DeploymentOffer, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public releaseOffer(request: deployment_pb.DeploymentOffer, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public heartbeat(request: google_protobuf_empty_pb.Empty, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public heartbeat(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public heartbeat(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
}

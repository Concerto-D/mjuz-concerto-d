// package: mjuz
// file: resources.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import {handleClientStreamingCall} from "@grpc/grpc-js/build/src/server-call";
import * as resources_pb from "./resources_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";
import * as google_protobuf_struct_pb from "google-protobuf/google/protobuf/struct_pb";

interface IResourcesService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    updateRemote: IResourcesService_IupdateRemote;
    refreshRemote: IResourcesService_IrefreshRemote;
    deleteRemote: IResourcesService_IdeleteRemote;
    updateOffer: IResourcesService_IupdateOffer;
    refreshOffer: IResourcesService_IrefreshOffer;
    deleteOffer: IResourcesService_IdeleteOffer;
    getWish: IResourcesService_IgetWish;
    wishDeleted: IResourcesService_IwishDeleted;
}

interface IResourcesService_IupdateRemote extends grpc.MethodDefinition<resources_pb.Remote, google_protobuf_empty_pb.Empty> {
    path: "/mjuz.Resources/updateRemote";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<resources_pb.Remote>;
    requestDeserialize: grpc.deserialize<resources_pb.Remote>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IResourcesService_IrefreshRemote extends grpc.MethodDefinition<resources_pb.Remote, google_protobuf_empty_pb.Empty> {
    path: "/mjuz.Resources/refreshRemote";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<resources_pb.Remote>;
    requestDeserialize: grpc.deserialize<resources_pb.Remote>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IResourcesService_IdeleteRemote extends grpc.MethodDefinition<resources_pb.Remote, google_protobuf_empty_pb.Empty> {
    path: "/mjuz.Resources/deleteRemote";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<resources_pb.Remote>;
    requestDeserialize: grpc.deserialize<resources_pb.Remote>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IResourcesService_IupdateOffer extends grpc.MethodDefinition<resources_pb.Offer, google_protobuf_empty_pb.Empty> {
    path: "/mjuz.Resources/updateOffer";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<resources_pb.Offer>;
    requestDeserialize: grpc.deserialize<resources_pb.Offer>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IResourcesService_IrefreshOffer extends grpc.MethodDefinition<resources_pb.Offer, google_protobuf_empty_pb.Empty> {
    path: "/mjuz.Resources/refreshOffer";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<resources_pb.Offer>;
    requestDeserialize: grpc.deserialize<resources_pb.Offer>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IResourcesService_IdeleteOffer extends grpc.MethodDefinition<resources_pb.Offer, google_protobuf_empty_pb.Empty> {
    path: "/mjuz.Resources/deleteOffer";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<resources_pb.Offer>;
    requestDeserialize: grpc.deserialize<resources_pb.Offer>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IResourcesService_IgetWish extends grpc.MethodDefinition<resources_pb.Wish, resources_pb.RemoteOffer> {
    path: "/mjuz.Resources/getWish";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<resources_pb.Wish>;
    requestDeserialize: grpc.deserialize<resources_pb.Wish>;
    responseSerialize: grpc.serialize<resources_pb.RemoteOffer>;
    responseDeserialize: grpc.deserialize<resources_pb.RemoteOffer>;
}
interface IResourcesService_IwishDeleted extends grpc.MethodDefinition<resources_pb.Wish, google_protobuf_empty_pb.Empty> {
    path: "/mjuz.Resources/wishDeleted";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<resources_pb.Wish>;
    requestDeserialize: grpc.deserialize<resources_pb.Wish>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}

export const ResourcesService: IResourcesService;

export interface IResourcesServer extends grpc.UntypedServiceImplementation {
    updateRemote: grpc.handleUnaryCall<resources_pb.Remote, google_protobuf_empty_pb.Empty>;
    refreshRemote: grpc.handleUnaryCall<resources_pb.Remote, google_protobuf_empty_pb.Empty>;
    deleteRemote: grpc.handleUnaryCall<resources_pb.Remote, google_protobuf_empty_pb.Empty>;
    updateOffer: grpc.handleUnaryCall<resources_pb.Offer, google_protobuf_empty_pb.Empty>;
    refreshOffer: grpc.handleUnaryCall<resources_pb.Offer, google_protobuf_empty_pb.Empty>;
    deleteOffer: grpc.handleUnaryCall<resources_pb.Offer, google_protobuf_empty_pb.Empty>;
    getWish: grpc.handleUnaryCall<resources_pb.Wish, resources_pb.RemoteOffer>;
    wishDeleted: grpc.handleUnaryCall<resources_pb.Wish, google_protobuf_empty_pb.Empty>;
}

export interface IResourcesClient {
    updateRemote(request: resources_pb.Remote, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    updateRemote(request: resources_pb.Remote, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    updateRemote(request: resources_pb.Remote, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    refreshRemote(request: resources_pb.Remote, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    refreshRemote(request: resources_pb.Remote, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    refreshRemote(request: resources_pb.Remote, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteRemote(request: resources_pb.Remote, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteRemote(request: resources_pb.Remote, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteRemote(request: resources_pb.Remote, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    updateOffer(request: resources_pb.Offer, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    updateOffer(request: resources_pb.Offer, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    updateOffer(request: resources_pb.Offer, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    refreshOffer(request: resources_pb.Offer, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    refreshOffer(request: resources_pb.Offer, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    refreshOffer(request: resources_pb.Offer, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteOffer(request: resources_pb.Offer, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteOffer(request: resources_pb.Offer, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteOffer(request: resources_pb.Offer, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    getWish(request: resources_pb.Wish, callback: (error: grpc.ServiceError | null, response: resources_pb.RemoteOffer) => void): grpc.ClientUnaryCall;
    getWish(request: resources_pb.Wish, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: resources_pb.RemoteOffer) => void): grpc.ClientUnaryCall;
    getWish(request: resources_pb.Wish, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: resources_pb.RemoteOffer) => void): grpc.ClientUnaryCall;
    wishDeleted(request: resources_pb.Wish, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    wishDeleted(request: resources_pb.Wish, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    wishDeleted(request: resources_pb.Wish, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
}

export class ResourcesClient extends grpc.Client implements IResourcesClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public updateRemote(request: resources_pb.Remote, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public updateRemote(request: resources_pb.Remote, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public updateRemote(request: resources_pb.Remote, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public refreshRemote(request: resources_pb.Remote, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public refreshRemote(request: resources_pb.Remote, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public refreshRemote(request: resources_pb.Remote, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteRemote(request: resources_pb.Remote, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteRemote(request: resources_pb.Remote, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteRemote(request: resources_pb.Remote, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public updateOffer(request: resources_pb.Offer, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public updateOffer(request: resources_pb.Offer, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public updateOffer(request: resources_pb.Offer, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public refreshOffer(request: resources_pb.Offer, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public refreshOffer(request: resources_pb.Offer, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public refreshOffer(request: resources_pb.Offer, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteOffer(request: resources_pb.Offer, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteOffer(request: resources_pb.Offer, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteOffer(request: resources_pb.Offer, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public getWish(request: resources_pb.Wish, callback: (error: grpc.ServiceError | null, response: resources_pb.RemoteOffer) => void): grpc.ClientUnaryCall;
    public getWish(request: resources_pb.Wish, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: resources_pb.RemoteOffer) => void): grpc.ClientUnaryCall;
    public getWish(request: resources_pb.Wish, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: resources_pb.RemoteOffer) => void): grpc.ClientUnaryCall;
    public wishDeleted(request: resources_pb.Wish, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public wishDeleted(request: resources_pb.Wish, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public wishDeleted(request: resources_pb.Wish, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
}

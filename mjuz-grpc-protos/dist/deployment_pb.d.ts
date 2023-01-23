// package: mjuz
// file: deployment.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";
import * as google_protobuf_struct_pb from "google-protobuf/google/protobuf/struct_pb";

export class DeploymentOffer extends jspb.Message { 
    getOrigin(): string;
    setOrigin(value: string): DeploymentOffer;
    getName(): string;
    setName(value: string): DeploymentOffer;

    hasOffer(): boolean;
    clearOffer(): void;
    getOffer(): google_protobuf_struct_pb.Value | undefined;
    setOffer(value?: google_protobuf_struct_pb.Value): DeploymentOffer;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeploymentOffer.AsObject;
    static toObject(includeInstance: boolean, msg: DeploymentOffer): DeploymentOffer.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeploymentOffer, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeploymentOffer;
    static deserializeBinaryFromReader(message: DeploymentOffer, reader: jspb.BinaryReader): DeploymentOffer;
}

export namespace DeploymentOffer {
    export type AsObject = {
        origin: string,
        name: string,
        offer?: google_protobuf_struct_pb.Value.AsObject,
    }
}

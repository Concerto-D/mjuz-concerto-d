// package: mjuz
// file: resources.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";
import * as google_protobuf_struct_pb from "google-protobuf/google/protobuf/struct_pb";

export class Remote extends jspb.Message { 
    getId(): string;
    setId(value: string): Remote;
    getHost(): string;
    setHost(value: string): Remote;
    getPort(): number;
    setPort(value: number): Remote;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Remote.AsObject;
    static toObject(includeInstance: boolean, msg: Remote): Remote.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Remote, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Remote;
    static deserializeBinaryFromReader(message: Remote, reader: jspb.BinaryReader): Remote;
}

export namespace Remote {
    export type AsObject = {
        id: string,
        host: string,
        port: number,
    }
}

export class Offer extends jspb.Message { 
    getName(): string;
    setName(value: string): Offer;
    getBeneficiaryid(): string;
    setBeneficiaryid(value: string): Offer;

    hasOffer(): boolean;
    clearOffer(): void;
    getOffer(): google_protobuf_struct_pb.Value | undefined;
    setOffer(value?: google_protobuf_struct_pb.Value): Offer;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Offer.AsObject;
    static toObject(includeInstance: boolean, msg: Offer): Offer.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Offer, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Offer;
    static deserializeBinaryFromReader(message: Offer, reader: jspb.BinaryReader): Offer;
}

export namespace Offer {
    export type AsObject = {
        name: string,
        beneficiaryid: string,
        offer?: google_protobuf_struct_pb.Value.AsObject,
    }
}

export class Wish extends jspb.Message { 
    getName(): string;
    setName(value: string): Wish;
    getTargetid(): string;
    setTargetid(value: string): Wish;
    getIsdeployed(): boolean;
    setIsdeployed(value: boolean): Wish;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Wish.AsObject;
    static toObject(includeInstance: boolean, msg: Wish): Wish.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Wish, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Wish;
    static deserializeBinaryFromReader(message: Wish, reader: jspb.BinaryReader): Wish;
}

export namespace Wish {
    export type AsObject = {
        name: string,
        targetid: string,
        isdeployed: boolean,
    }
}

export class RemoteOffer extends jspb.Message { 

    hasIswithdrawn(): boolean;
    clearIswithdrawn(): void;
    getIswithdrawn(): boolean;
    setIswithdrawn(value: boolean): RemoteOffer;

    hasOffer(): boolean;
    clearOffer(): void;
    getOffer(): google_protobuf_struct_pb.Value | undefined;
    setOffer(value?: google_protobuf_struct_pb.Value): RemoteOffer;

    getValCase(): RemoteOffer.ValCase;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RemoteOffer.AsObject;
    static toObject(includeInstance: boolean, msg: RemoteOffer): RemoteOffer.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RemoteOffer, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RemoteOffer;
    static deserializeBinaryFromReader(message: RemoteOffer, reader: jspb.BinaryReader): RemoteOffer;
}

export namespace RemoteOffer {
    export type AsObject = {
        iswithdrawn: boolean,
        offer?: google_protobuf_struct_pb.Value.AsObject,
    }

    export enum ValCase {
        VAL_NOT_SET = 0,
        ISWITHDRAWN = 1,
        OFFER = 2,
    }

}

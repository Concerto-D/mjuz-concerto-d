// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var resources_pb = require('./resources_pb.js');
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');
var google_protobuf_struct_pb = require('google-protobuf/google/protobuf/struct_pb.js');

function serialize_google_protobuf_Empty(arg) {
  if (!(arg instanceof google_protobuf_empty_pb.Empty)) {
    throw new Error('Expected argument of type google.protobuf.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_google_protobuf_Empty(buffer_arg) {
  return google_protobuf_empty_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_mjuz_Offer(arg) {
  if (!(arg instanceof resources_pb.Offer)) {
    throw new Error('Expected argument of type mjuz.Offer');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_mjuz_Offer(buffer_arg) {
  return resources_pb.Offer.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_mjuz_Remote(arg) {
  if (!(arg instanceof resources_pb.Remote)) {
    throw new Error('Expected argument of type mjuz.Remote');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_mjuz_Remote(buffer_arg) {
  return resources_pb.Remote.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_mjuz_RemoteOffer(arg) {
  if (!(arg instanceof resources_pb.RemoteOffer)) {
    throw new Error('Expected argument of type mjuz.RemoteOffer');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_mjuz_RemoteOffer(buffer_arg) {
  return resources_pb.RemoteOffer.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_mjuz_Wish(arg) {
  if (!(arg instanceof resources_pb.Wish)) {
    throw new Error('Expected argument of type mjuz.Wish');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_mjuz_Wish(buffer_arg) {
  return resources_pb.Wish.deserializeBinary(new Uint8Array(buffer_arg));
}


var ResourcesService = exports.ResourcesService = {
  // Creates or updates a remote.
updateRemote: {
    path: '/mjuz.Resources/updateRemote',
    requestStream: false,
    responseStream: false,
    requestType: resources_pb.Remote,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_mjuz_Remote,
    requestDeserialize: deserialize_mjuz_Remote,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  // Resends an already registered remote.
refreshRemote: {
    path: '/mjuz.Resources/refreshRemote',
    requestStream: false,
    responseStream: false,
    requestType: resources_pb.Remote,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_mjuz_Remote,
    requestDeserialize: deserialize_mjuz_Remote,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  // Deletes a remote. Assumes that no resource, e.g., offer or wish, depend on the remote.
deleteRemote: {
    path: '/mjuz.Resources/deleteRemote',
    requestStream: false,
    responseStream: false,
    requestType: resources_pb.Remote,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_mjuz_Remote,
    requestDeserialize: deserialize_mjuz_Remote,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  // Creates or updates an offer. Assumes a remote is registered for the provided beneficiary id.
updateOffer: {
    path: '/mjuz.Resources/updateOffer',
    requestStream: false,
    responseStream: false,
    requestType: resources_pb.Offer,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_mjuz_Offer,
    requestDeserialize: deserialize_mjuz_Offer,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  // Resends the currently deployed offer state. Assumes a remote is registered for the provided beneficiary id.
refreshOffer: {
    path: '/mjuz.Resources/refreshOffer',
    requestStream: false,
    responseStream: false,
    requestType: resources_pb.Offer,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_mjuz_Offer,
    requestDeserialize: deserialize_mjuz_Offer,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  // Withdraws an offer. On response, we assume no wish for the offer is deployed anymore or will be deployed.
deleteOffer: {
    path: '/mjuz.Resources/deleteOffer',
    requestStream: false,
    responseStream: false,
    requestType: resources_pb.Offer,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_mjuz_Offer,
    requestDeserialize: deserialize_mjuz_Offer,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  // Polls for satisfaction of a wish. If offer is returned, the wish is satisfied with it. If isWithdrawn is `true`,
// the offer was withdrawn. If `isWithdrawn` is `false` the offer state is unknown and assumed to be unchanged.
getWish: {
    path: '/mjuz.Resources/getWish',
    requestStream: false,
    responseStream: false,
    requestType: resources_pb.Wish,
    responseType: resources_pb.RemoteOffer,
    requestSerialize: serialize_mjuz_Wish,
    requestDeserialize: deserialize_mjuz_Wish,
    responseSerialize: serialize_mjuz_RemoteOffer,
    responseDeserialize: deserialize_mjuz_RemoteOffer,
  },
  // Indicates that wish is not longer deployed.
wishDeleted: {
    path: '/mjuz.Resources/wishDeleted',
    requestStream: false,
    responseStream: false,
    requestType: resources_pb.Wish,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_mjuz_Wish,
    requestDeserialize: deserialize_mjuz_Wish,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
};

exports.ResourcesClient = grpc.makeGenericClientConstructor(ResourcesService);

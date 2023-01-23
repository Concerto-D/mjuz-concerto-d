// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var deployment_pb = require('./deployment_pb.js');
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

function serialize_mjuz_DeploymentOffer(arg) {
  if (!(arg instanceof deployment_pb.DeploymentOffer)) {
    throw new Error('Expected argument of type mjuz.DeploymentOffer');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_mjuz_DeploymentOffer(buffer_arg) {
  return deployment_pb.DeploymentOffer.deserializeBinary(new Uint8Array(buffer_arg));
}


var DeploymentService = exports.DeploymentService = {
  // Initializes or updates an offer. Idempotent. Response does not imply deployment of a wish for the offer.
// Assumes all offer properties are set.
offer: {
    path: '/mjuz.Deployment/offer',
    requestStream: false,
    responseStream: false,
    requestType: deployment_pb.DeploymentOffer,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_mjuz_DeploymentOffer,
    requestDeserialize: deserialize_mjuz_DeploymentOffer,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  // Withdraws an offer and demands to release it. On response, we assume no wish for the offer
// is deployed anymore or will be deployed.
// Assumes `origin` and `name` are set.
releaseOffer: {
    path: '/mjuz.Deployment/releaseOffer',
    requestStream: false,
    responseStream: false,
    requestType: deployment_pb.DeploymentOffer,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_mjuz_DeploymentOffer,
    requestDeserialize: deserialize_mjuz_DeploymentOffer,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  heartbeat: {
    path: '/mjuz.Deployment/heartbeat',
    requestStream: false,
    responseStream: false,
    requestType: google_protobuf_empty_pb.Empty,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_google_protobuf_Empty,
    requestDeserialize: deserialize_google_protobuf_Empty,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
};

exports.DeploymentClient = grpc.makeGenericClientConstructor(DeploymentService);

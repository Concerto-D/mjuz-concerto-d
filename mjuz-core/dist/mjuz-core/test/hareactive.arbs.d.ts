import { Future, Stream, Time } from '@funkia/hareactive';
import * as fc from 'fast-check';
export declare type OccurringFutureArbConstraints = {
    minTime?: number;
    maxTime?: number;
};
export declare const occurringFutureArb: <T>(valueArb: fc.Arbitrary<T>, constraints?: OccurringFutureArbConstraints) => fc.Arbitrary<Future<T>>;
export declare type FutureArbConstraints = OccurringFutureArbConstraints & {
    freq?: number | false;
};
export declare const futureArb: <T>(value: fc.Arbitrary<T>, constraints?: FutureArbConstraints) => fc.Arbitrary<Future<T>>;
export declare type StreamArbConstraints<T> = {
    minEvents?: number;
    maxEvents?: number;
    minTime?: number;
    maxTime?: number;
    filterEvents?: ([t, v]: [Time, T]) => boolean;
};
export declare const streamArb: <T>(valueArb: fc.Arbitrary<T>, constraints?: StreamArbConstraints<T>) => fc.Arbitrary<Stream<T>>;

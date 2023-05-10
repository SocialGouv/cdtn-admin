declare module "p-map" {
  interface Options {
    /**
     Number of concurrently pending promises returned by `mapper`.

     Must be an integer from 1 and up or `Infinity`.

     @default Infinity
     */
    readonly concurrency?: number;

    /**
     When `true`, the first mapper rejection will be rejected back to the consumer.

     When `false`, instead of stopping when a promise rejects, it will wait for all the promises to settle and then reject with an [aggregated error](https://github.com/sindresorhus/aggregate-error) containing all the errors from the rejected promises.

     Caveat: When `true`, any already-started async mappers will continue to run until they resolve or reject. In the case of infinite concurrency with sync iterables, *all* mappers are invoked on startup and will continue after the first rejection. [Issue #51](https://github.com/sindresorhus/p-map/issues/51) can be implemented for abort control.

     @default true
     */
    readonly stopOnError?: boolean;
  }

  /**
   Function which is called for every item in `input`. Expected to return a `Promise` or value.

   @param element - Iterated element.
   @param index - Index of the element in the source array.
   */
  type Mapper<Element = any, NewElement = unknown> = (
    element: Element,
    index: number
  ) => NewElement | Promise<NewElement>;

  /**
   @param input - Synchronous or asynchronous iterable that is iterated over concurrently, calling the `mapper` function for each element. Each iterated item is `await`'d before the `mapper` is invoked so the iterable may return a `Promise` that resolves to an item. Asynchronous iterables (different from synchronous iterables that return `Promise` that resolves to an item) can be used when the next item may not be ready without waiting for an asynchronous process to complete and/or the end of the iterable may be reached after the asynchronous process completes. For example, reading from a remote queue when the queue has reached empty, or reading lines from a stream.
   @param mapper - Function which is called for every item in `input`. Expected to return a `Promise` or value.
   @returns A `Promise` that is fulfilled when all promises in `input` and ones returned from `mapper` are fulfilled, or rejects if any of the promises reject. The fulfilled value is an `Array` of the fulfilled values returned from `mapper` in `input` order.

   @example
   ```
   import pMap from 'p-map';
   import got from 'got';

   const sites = [
   getWebsiteFromUsername('sindresorhus'), //=> Promise
   'https://avajs.dev',
   'https://github.com'
   ];

   const mapper = async site => {
	const {requestUrl} = await got.head(site);
	return requestUrl;
};

   const result = await pMap(sites, mapper, {concurrency: 2});

   console.log(result);
   //=> ['https://sindresorhus.com/', 'https://avajs.dev/', 'https://github.com/']
   ```
   */
  export default function pMap<Element, NewElement>(
    input:
      | AsyncIterable<Element | Promise<Element>>
      | Iterable<Element | Promise<Element>>,
    mapper: Mapper<Element, NewElement>,
    options?: Options
  ): Promise<Array<Exclude<NewElement, typeof pMapSkip>>>;
}

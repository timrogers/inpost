# InPost

This JavaScript package allows you to interact with [InPost parcel lockers](https://inpost.eu) in the [UK](https://inpost.co.uk) using InPost's undocumented APIs. 

With this driver, you can:

* Find InPost locations near to a given UK postcode
* Discover how many lockers, if any, are available at any given location

## Installation

Install the `inpost` package from the npm package registry:

```bash
# If you're using npm
npm install --save inpost

# If you're using Yarn
yarn add inpost
```

## Usage

This package includes:

* support for ESM and CommonJS modules - so no matter how your project is set up, you should be able to use it with either `import` or `require` ✨
* Typescript types for a 10/10 developer experience 🌟

### Finding InPost locations near to a given UK postcode

To find InPost locations near to a given UK postcode, use the `findLocationsByPostcode` function:

```ts
import { findLocationsByPostcode } from 'inpost';

const locations = await findLocationsByPostcode('SW1A 1AA');

for (const location of locations) {
  console.log(`Found nearby location "${location.name}" ${location.id}`);
}
```

See the [`Location` type](https://github.com/timrogers/inpost/blob/main/src/types.ts) for details on the data available for each location.

Each location includes an `id` which can be used to get locker availability for that location.

### Getting locker availability for an InPost location

To get availability for a locker, use the `getAvailabilityForLocation` function:

```ts
import { getAvailabilityForLocation, LockerSize } from 'inpost';

const availability = await getAvailabilityForLocation('UK00058679');

for (const size of [LockerSize.SMALL, LockerSize.MEDIUM, LockerSize.LARGE]) {
  const available = availability.availabilityByLockerSize[size].availableCount;
  const total = availability.availabilityByLockerSize[size].totalCount;
  console.log(`${available}/${total} ${size} lockers are available`);
}

console.log(`Locker availability last updated at ${availability.lastUpdatedAt}`);
```

See the [`LocationAvailability` type](https://github.com/timrogers/inpost/blob/main/src/types.ts) for full details how availability is represented.

### Error handling

If InPost returns an error, then a [`ResponseError`](https://github.com/timrogers/inpost/blob/main/src/errors.ts#L1) will be thrown.

The error's message will include the error message returned by InPost - or if no error message can be found, then it'll use something fairly generic (`Got status code 404, expected 200`).

`ResponseError`s expose the full `fetch` `Response` - see [MDN web docs](https://developer.mozilla.org/en-US/docs/Web/API/Response) for details on that interface.
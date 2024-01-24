# InPost

This JavaScript package allows you to interact with [InPost parcel lockers](https://inpost.eu) in the [UK](https://inpost.co.uk) using InPost's undocumented APIs.

With this client library, you can __access the name, address, coordinates and current locker availability__ at InPost parcel lockers near a given UK postcode or set of latitude and longitude coordinates.

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
  console.log(`Found nearby location "${location.name}" (${location.id})`);
  console.log(`Current availability: S: ${location.smallLockerAvailability}, M: ${location.mediumLockerAvailability}, L: ${location.largeLockerAvailability}`);
}
```

See the [`ListedLocation` type](https://github.com/timrogers/inpost/blob/main/src/types.ts) for details on the data available for each location.

Each location includes an `id` which can be used to get locker availability for that location and to fetch the location by its ID in the future.

### Finding InPost locations near to a set of latitude and longitude coordinates

To find InPost locations near to a specific set of latitude and longitude coordinates, use the `findLocationsByCoordinates` function:

```ts
import { findLocationsByCoordinates } from 'inpost';

const locations = await findLocationsByCoordinates(51.463, -0.0987);

for (const location of locations) {
  console.log(`Found nearby location "${location.name}" (${location.id})`);
  console.log(`Current availability: S: ${location.smallLockerAvailability}, M: ${location.mediumLockerAvailability}, L: ${location.largeLockerAvailability}`);
}
```

See the [`ListedLocation` type](https://github.com/timrogers/inpost/blob/main/src/types.ts) for details on the data available for each location.

Each location includes an `id` which can be used to get locker availability for that location and to fetch the location by its ID in the future.

### Fetching a location by its ID

To fetch an InPost location by its ID - returned by `findLocationsByPostcode` or `findLocationsByCoordinates` - use the `getLocation` function:

```ts
import { getLocation } from 'inpost';

const location = await getLocation('UK00000756');

console.log(`Loaded location "${location.name}"`);
console.log(`Current availability: S: ${location.smallLockerAvailability}, M: ${location.mediumLockerAvailability}, L: ${location.largeLockerAvailability}`);
```

See the [`Location` type](https://github.com/timrogers/inpost/blob/main/src/types.ts) for details on the data available for a location. __Note that the `lastUpdatedAt` data, indicating when locker availability was last updated, is not available in this type, and can only be accessed through `findLocationsByPostcode` and `findLocationsByCoordinates`.__

### Error handling

If InPost returns an error, then a [`ResponseError`](https://github.com/timrogers/inpost/blob/main/src/errors.ts#L1) will be thrown.

The error's message will include the error message returned by InPost - or if no error message can be found, then it'll use something fairly generic (`Got status code 404, expected 200`).

`ResponseError`s expose the full `fetch` `Response` - see [MDN web docs](https://developer.mozilla.org/en-US/docs/Web/API/Response) for details on that interface.
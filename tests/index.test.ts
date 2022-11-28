import nock from 'nock';

import {
  findLocationsByPostcode,
  getAvailabilityForLocation,
  getLocation,
} from '../src/index';
import pointsFixture from './fixtures/points.json';
import pointsErrorFixture from './fixtures/points-error.json';
import pointFixture from './fixtures/point.json';
import pointErrorFixture from './fixtures/point-error.json';
import availabilityFixture from './fixtures/availability.json';
import availabilityErrorFixture from './fixtures/availability-error.json';

describe('findLocationsByPostcode', () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  test('returns a list of locations', async () => {
    nock('https://api-uk-points.easypack24.net')
      .get('/v1/points')
      .query({
        relative_post_code: 'SW1A 1AA',
        max_distance: '16000',
        status: 'Operating',
        limit: '10',
      })
      .reply(200, pointsFixture);

    const locations = await findLocationsByPostcode('SW1A 1AA');

    expect(locations).toMatchSnapshot();
  });

  test('throws an error for a non-200 response', async () => {
    nock('https://api-uk-points.easypack24.net')
      .get('/v1/points')
      .query({
        relative_post_code: 'SW1A',
        max_distance: '16000',
        status: 'Operating',
        limit: '10',
      })
      .reply(400, pointsErrorFixture);

    expect.assertions(1);
    return expect(findLocationsByPostcode('SW1A')).rejects.toMatchSnapshot();
  });
});

describe('getLocation', () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  test('returns the location', async () => {
    nock('https://api-uk-points.easypack24.net')
      .get('/v1/points/UK00000756')
      .reply(200, pointFixture);

    const location = await getLocation('UK00000756');

    expect(location).toMatchSnapshot();
  });

  test('throws an error for a non-200 response', async () => {
    nock('https://api-uk-points.easypack24.net')
      .get('/v1/points/UK0000075')
      .reply(400, pointErrorFixture);

    expect.assertions(1);
    return expect(getLocation('UK0000075')).rejects.toMatchSnapshot();
  });
});

describe('getAvailabilityForLocation', () => {
  test('returns availability data for a location', async () => {
    nock('https://api.inpost247.uk')
      .get('/locker-capacity')
      .query({
        apm: 'UK00058679',
      })
      .reply(200, availabilityFixture);

    const locations = await getAvailabilityForLocation('UK00058679');

    expect(locations).toMatchSnapshot();
  });

  test('throws an error for a non-200 response', async () => {
    nock('https://api.inpost247.uk')
      .get('/locker-capacity')
      .query({
        apm: 'UK000586',
      })
      .reply(404, availabilityErrorFixture);

    expect.assertions(1);
    return expect(getAvailabilityForLocation('UK000586')).rejects.toMatchSnapshot();
  });
});

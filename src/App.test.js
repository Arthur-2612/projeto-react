import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('nominatim')) {
      return Promise.resolve({
        ok: true,
        json: async () => [
          {
            lat: '-23.5505',
            lon: '-46.6333',
            display_name: 'São Paulo, São Paulo, Brasil'
          }
        ]
      });
    }

    return Promise.resolve({
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 28,
          apparent_temperature: 30,
          relative_humidity_2m: 68,
          wind_speed_10m: 12,
          weather_code: 1
        },
        hourly: {
          time: ['2026-08-12T12:00', '2026-08-12T13:00', '2026-08-12T14:00', '2026-08-12T15:00', '2026-08-12T16:00', '2026-08-12T17:00'],
          temperature_2m: [28, 29, 30, 31, 30, 28],
          weather_code: [1, 1, 2, 3, 0, 0]
        },
        daily: {
          time: ['2026-08-12', '2026-08-13', '2026-08-14', '2026-08-15', '2026-08-16', '2026-08-17'],
          weather_code: [1, 2, 3, 0, 1, 2],
          temperature_2m_max: [29, 28, 27, 26, 30, 31],
          temperature_2m_min: [20, 19, 18, 17, 20, 21],
          sunrise: ['2026-08-12T06:00', '2026-08-13T06:00', '2026-08-14T06:00', '2026-08-15T06:00', '2026-08-16T06:00', '2026-08-17T06:00'],
          sunset: ['2026-08-12T18:00', '2026-08-13T18:00', '2026-08-14T18:00', '2026-08-15T18:00', '2026-08-16T18:00', '2026-08-17T18:00']
        }
      })
    });
  });
});

test('renders weather dashboard', async () => {
  render(<App />);

  expect(await screen.findByText(/clima agora/i)).toBeInTheDocument();
  expect(await screen.findByText(/são paulo/i)).toBeInTheDocument();
  expect(await screen.findByText(/próximas 24h/i)).toBeInTheDocument();
});

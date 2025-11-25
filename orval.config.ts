import { defineConfig } from 'orval';

export default defineConfig({
  client: {
    input: {
        target: "http://localhost:8000/openapi.json"
    },
    output: {
        mode: 'tags',
        target: './src/http/gen/api.ts',
        client: 'react-query',
        httpClient: 'axios',
        clean: true,
        biome: true,
        override: {
          query: {
            useSuspenseQuery: true,
            useInfiniteQueryParam: 'page'
          },
          mutator: {
            path: './src/http/customInstance.ts',
            name: 'customInstance',
          },
          operations: {
            list_users: {
              query: {
                useInfinite: true,
              }
            },
            list_shifts: {
              query: {
                useInfinite: true,
              }
            },
            list_attendances: {
              query: {
                useInfinite: true,
              }
            },
            list_roles: {
              query: {
                useInfinite: true,
              }
            },
            list_days_off: {
              query: {
                useInfinite: true,
              }
            },
          }
        }
    }
  },
});
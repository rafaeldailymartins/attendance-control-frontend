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
          mutator: {
            path: './src/http/customInstance.ts',
            name: 'customInstance',
          },
        }
    }
  },
});
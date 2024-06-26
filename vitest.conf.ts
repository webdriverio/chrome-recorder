/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
    test: {
        include: ['test/**/*.test.ts'],
        /**
         * not to ESM ported packages
         */
        exclude: [
            'dist', '.idea', '.git', '.cache',
            '**/node_modules/**'
        ],
        coverage: {
            enabled: true,
            exclude: ['**/build/**', '**/__fixtures__/**', '**/*.test.ts'],
            thresholds: {
                lines: 100,
                functions: 100,
                branches: 100,
                statements: 100
            }
        }
    }
})

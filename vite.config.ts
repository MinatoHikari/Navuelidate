import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import dts from 'vite-plugin-dts';

import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '~/': `${path.resolve(__dirname, 'package')}/`,
        },
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, './package/index.ts'),
            name: 'navuelidate',
            fileName: 'index',
        },
        rollupOptions: {
            external: ['vue', '@vuelidate/core', 'naive-ui', '@vueuse/core'],
            output: {
                // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                globals: {
                    vue: 'Vue',
                    'naive-ui': 'NaiveUI',
                    '@vuelidate/core': 'Vuelidate',
                    '@vueuse/core': 'Vueuse',
                },
            },
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
            },
        },
    },
    plugins: [
        Vue({
            reactivityTransform: true,
        }),

        vueJsx({
            // options are passed on to @vue/babel-plugin-jsx
        }),

        dts({
            tsconfigPath: 'tsconfig.build.json',
            insertTypesEntry: true,
            outDir: 'dist/types',
        }),
    ],
});

import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],
	server:{
		port: 8080,
		strictPort: false,
	},
};

export default config;

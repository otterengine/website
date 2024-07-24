import starlight from '@astrojs/starlight';
import {defineConfig, passthroughImageService} from 'astro/config';

// https://astro.build/config
export default defineConfig({
  image: {service: passthroughImageService()},
  integrations: [
    starlight({
      title: 'Otter Engine',
      social: {
        github: 'https://github.com/otterengine/otter',
      },
      sidebar: [
        {
          label: 'Guides',
          items: [
            // Each item here is one entry in the navigation menu.
            {label: 'Getting Started', slug: 'guides/getting_started'},
          ],
        },
        {
          label: 'Reference',
          autogenerate: {directory: 'reference'},
        },
      ],
    }),
  ],
});

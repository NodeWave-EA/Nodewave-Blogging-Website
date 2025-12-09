import { mergeConfig, type UserConfig } from 'vite'

export default (config: UserConfig) => {
  return mergeConfig(config, {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      host: true,
      allowedHosts: ['localhost', '127.0.0.1', 'vps-e5e8d3b4.vps.ovh.net'],
    },
  })
}

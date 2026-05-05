module.exports = {
  apps: [
    {
      name: 'kino75',
      cwd: '/var/www/kino75',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 3000',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '700M',
    },
  ],
};

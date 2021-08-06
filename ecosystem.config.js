module.exports = {
  apps: [
    {
      name: 'happy-hog',
      script: './dist/main.js',
      merge_logs: true,
      max_restarts: 100,
      restart_delay: 3 * 60 * 1000,
      instances: 1,
      max_memory_restart: '800M',
      env: {
        PORT: '8000',
      },
    },
  ],
};

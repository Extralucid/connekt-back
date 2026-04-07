module.exports = {
  apps: [{
    name: 'youth-platform-api',
    script: './server.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2/err.log',
    out_file: './logs/pm2/out.log',
    log_file: './logs/pm2/combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto-restart settings
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Kill timeout
    kill_timeout: 5000,
    
    // Listen timeout
    listen_timeout: 3000,
    
    // Graceful shutdown
    shutdown_with_message: true,
    
    // Instance-specific environment variables
    instance_var: 'INSTANCE_ID',
    
    // Monitoring
    metrics: true,
    trace: true,
    deep_metrics: true,
    
    // Cron jobs (if needed)
    cron_restart: '0 3 * * *', // Restart at 3 AM daily
  }],
  
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/youth-platform-api.git',
      path: '/var/www/youth-platform-api',
      'post-deploy': 'npm install --production && npx prisma generate && npx prisma migrate deploy && pm2 reload ecosystem.config.js --env production',
      'pre-deploy': 'git fetch --all',
      'post-setup': 'npm install && npx prisma generate',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
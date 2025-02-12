Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "http://localhost:5173", "http://127.0.0.1:5173"

    resource "*",
      headers: %w[Authorization],
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
      expose: %w[Authorization],
      credentials: true,
      max_age: 86400
  end
end

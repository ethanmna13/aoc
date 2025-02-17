class JwtService
  def self.decode(token)
    secret_key = ENV["DEVISE_JWT_SECRET_KEY"]

    decoded = JWT.decode(token, secret_key).first

    {
      id: decoded["sub"],
      role: decoded["role"],
      name: decoded["name"],
      account_status: decoded["account_status"]
    }
  rescue JWT::DecodeError => e
    raise "Invalid or expired token"
  end
end

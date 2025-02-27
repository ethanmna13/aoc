class ApplicationController < ActionController::Base
  protect_from_forgery unless: -> { request.format.json? }
  before_action :authenticate_user!
  skip_before_action :authenticate_user!, only: [ :new, :create ], if: -> { controller_name == "sessions" }

  private

  def authenticate_user!
    token = request.headers["Authorization"]&.split(" ")&.last

    if token
      begin
        decoded = JwtService.decode(token)
        @current_user = User.find(decoded[:id])
      rescue JWT::DecodeError
        render json: { error: "Invalid or expired token" }, status: :unauthorized
      end
    else
      render json: { error: "Token missing" }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end
end

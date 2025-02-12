class Api::V1::Users::SessionsController < Devise::SessionsController
  respond_to :json

  def create
    user = User.find_by(email: params[:user][:email])

    if user && user.valid_password?(params[:user][:password])
      sign_in(user)
      token = user.generate_jwt
      render json: {
        message: "Logged in successfully",
        user: user.slice(:id, :email, :name, :role, :account_status),
        token: token
      }, status: :ok
      Rails.logger.debug("current_user: #{current_user.inspect}")
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  def index
    render json: current_user.slice(:id, :name, :role, :account_status), status: :ok
  end

  def destroy
    sign_out(current_user)
    render json: { message: "Logged out successfully" }, status: :ok
  end
end

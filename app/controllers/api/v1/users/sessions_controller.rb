class Api::V1::Users::SessionsController < Devise::SessionsController
  respond_to :json
  skip_before_action :verify_signed_out_user, only: [ :destroy ]

  def create
    user = User.find_by(email: params[:user][:email])

    if user && user.valid_password?(params[:user][:password])
      sign_in(user)
      if user.account_status == "inactive"
        user.update(account_status: "active")
      end
      token = user.generate_jwt
      render json: {
        message: "Logged in successfully",
        user: SessionBlueprint.render_as_hash(user),
        token: token
      }, status: :ok
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  def destroy
    sign_out(current_user)
    render json: { message: "Logged out successfully" }, status: :ok
  end
end

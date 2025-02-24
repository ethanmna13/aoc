class Api::V1::Users::SessionsController < Devise::SessionsController
  respond_to :json
  before_action :set_current_user, only: [ :index ]

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
        user: UserBlueprint.render_as_hash(user),
        token: token
      }, status: :ok
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  def index
    render json: UserBlueprint.render_as_hash(current_user), status: :ok
  end

  def destroy
    sign_out(current_user)
    render json: { message: "Logged out successfully" }, status: :ok
  end
end

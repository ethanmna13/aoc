# frozen_string_literal: true

class Api::V1::Users::SessionsController < Devise::SessionsController
  respond_to :json
  before_action :configure_sign_in_params, only: [ :create ]
  before_action :authenticate_user!, only: [ :current ]

  def create
    user = User.find_by(email: params[:user][:email])

    if user && user.valid_password?(params[:user][:password])
      sign_in(user)
      render json: { message: "Logged in successfully", user: user.slice(:id, :name, :role, :account_status) }, status: :ok
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  def current
      render json: current_user.slice(:id, :name, :role, :account_status)
  end

  def destroy
    sign_out(current_user)
    render json: { message: "Logged out successfully" }, status: :ok
  end

  protected

  def configure_sign_in_params
    devise_parameter_sanitizer.permit(:sign_in, keys: [ :email, :password ])
  end
end

class Api::V1::Admin::UsersController < ApplicationController
  respond_to :json
  before_action :set_user, only: [ :update, :destroy ]
  # before_action :check_admin_role, only: [ :create, :update, :destroy ]

  def index
    users = User.select(:id, :name, :role, :account_status)
    if users.empty?
      render json: { message: "No users found" }
    else
      render json: users
    end
  end

  def create
    password = SecureRandom.hex(10)
    user = User.new(user_params.merge(password: password, password_confirmation: password))

    if user.save
      UserMailer.welcome_email(user, password).deliver_now
      render json: user, status: :created
    else
      render json: { error: user.errors.full_messages }, status: :unprocessable_entity
    end
  end


  def update
    if @user.update(user_update_params)
      render json: @user.slice(:id, :name, :role, :account_status)
    else
      render json: { error: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    if @user.destroy
      render json: { message: "User deleted successfully" }
    else
      render json: { error: "Failed to delete user" }, status: :unprocessable_entity
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "User not found" }, status: :not_found
  end

  def user_params
    params.require(:user).permit(%i[email name role account_status])
  end

  def user_update_params
    params.require(:user).permit(:name, :role, :account_status)
  end

  def check_admin_role
    unless current_user&.admin?
      render json: { error: "Forbidden" }, status: :forbidden
    end
  end
end

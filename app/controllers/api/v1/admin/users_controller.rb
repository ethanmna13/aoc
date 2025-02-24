class Api::V1::Admin::UsersController < ApplicationController
  respond_to :json
  before_action :authenticate_user!
  before_action :set_user, only: [ :update, :destroy ]

  def index
    @q = User.ransack(params[:q])
    users = case params[:role]
    when "admin"
      @q.result.admins
    when "mentor"
      @q.result.mentors
    when "mentee"
      @q.result.mentees
    else
      @q.result
    end
    users = users.select(:id, :email, :name, :role, :account_status).paginate(page: params[:page], per_page: 10)
    render json: {
      users: users,
      total_pages: users.total_pages
    }
  end
  def mentors
    mentors = User.mentors
    render json: mentors
  end

  def mentees
    mentees = User.mentees
    render json: mentees
  end

  def admins
    admins = User.admins
    render json: admins
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
    params.require(:user).permit(%i[name role account_status])
  end
end

class Api::V1::CurrentUserController < ApplicationController
  def show
    render json: {
      id: current_user.id,
      name: current_user.name,
      role: current_user.role
    }, status: :ok
  end
end

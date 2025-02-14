class Api::V1::Admin::MainTasksController < ApplicationController
  before_action :set_main_task, only: [ :show, :update, :destroy ]
  respond_to :json

  def index
    main_tasks = MainTask.includes(:user).all
    tasks_with_user_names = main_tasks.map do |task|
      {
        id: task.id,
        name: task.name,
        description: task.description,
        deadline: task.deadline,
        users_id: task.users_id,
        user_name: task.user&.name
      }
    end
    render json: tasks_with_user_names
  end

  def show
    render json: @main_task
  end

  def create
    main_task = MainTask.new(main_task_params)
    if main_task.save
      render json: main_task, status: :created
    else
      render json: { error: main_task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @main_task.update(main_task_params)
      render json: @main_task
    else
      render json: { error: @main_task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    if @main_task.destroy
      render json: { message: "Main task deleted successfully" }
    else
      render json: { error: "Failed to delete main task" }, status: :unprocessable_entity
    end
  end

  private

  def set_main_task
    @main_task = MainTask.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Main task not found" }, status: :not_found
  end

  def main_task_params
    params.require(:main_task).permit(:name, :description, :deadline, :users_id)
  end
end

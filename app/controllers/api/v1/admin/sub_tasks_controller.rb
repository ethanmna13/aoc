class Api::V1::Admin::SubTasksController < ApplicationController
  # before_action :authenticate_user!

  def index
    @main_task = MainTask.find(params[:main_task_id])
    @sub_tasks = @main_task.sub_tasks

    render json: @sub_tasks
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Main task not found" }, status: :not_found
  end

  def create
    sub_task = SubTask.new(sub_task_params)
    if sub_task.save
      render json: sub_task, status: :created
    else
      render json: { error: sub_task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_sub_task
    @sub_task = SubTask.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Sub task not found" }, status: :not_found
  end

  def sub_task_params
    params.require(:main_task).permit(:name, :description, :duration)
  end
end

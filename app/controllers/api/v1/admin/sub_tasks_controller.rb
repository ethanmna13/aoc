class Api::V1::Admin::SubTasksController < ApplicationController
  before_action :set_main_task
  before_action :set_sub_task, only: [ :update, :destroy ]

  def index
    @sub_tasks = @main_task.sub_tasks
    render json: @sub_tasks
  end

  def create
    @sub_task = @main_task.sub_tasks.new(sub_task_params)
    if @sub_task.save
      render json: @sub_task, status: :created
    else
      render json: @sub_task.errors, status: :unprocessable_entity
    end
  end

  def update
    if @sub_task.update(sub_task_params)
      render json: @sub_task
    else
      render json: @sub_task.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @sub_task.destroy
    head :no_content
  end

  private

  def set_main_task
    @main_task = MainTask.find(params[:main_task_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Main task not found" }, status: :not_found
  end

  def set_sub_task
    @sub_task = @main_task.sub_tasks.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Sub task not found" }, status: :not_found
  end

  def sub_task_params
    params.require(:sub_task).permit(:name, :description, :duration)
  end
end

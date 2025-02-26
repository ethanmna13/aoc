class Api::V1::Admin::MainTasksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_main_task, only: [ :show, :update, :destroy,  :remove_attachment ]
  respond_to :json

  def index
    @q = MainTask.includes(:user).ransack(params[:q])
    main_tasks = @q.result(distinct: true).paginate(page: params[:page], per_page: params[:per_page] || 10)

    tasks_with_user_names = main_tasks.map do |task|
      {
        id: task.id,
        name: task.name,
        description: task.description,
        deadline: task.deadline,
        users_id: task.users_id,
        user_name: task.user&.name,
        attachments: task.attachments.map { |attachment| { id: attachment.id, url: rails_blob_url(attachment), filename: attachment.filename } }
      }
    end

    render json: {
      main_tasks: tasks_with_user_names,
      total_pages: main_tasks.total_pages,
      current_page: main_tasks.current_page
    }
  end


  def show
    render json: {
      id: @main_task.id,
      name: @main_task.name,
      description: @main_task.description,
      deadline: @main_task.deadline,
      users_id: @main_task.users_id,
      user_name: @main_task.user&.name,
      attachments: @main_task.attachments.map { |attachment| { id: attachment.id, url: rails_blob_url(attachment), filename: attachment.filename } }
    }
  end
  def create
    main_task = MainTask.new(main_task_params.merge(users_id: current_user.id))

    if main_task.save
      if params[:main_task][:attachments]
        params[:main_task][:attachments].each do |attachment|
          main_task.attachments.attach(attachment)
        end
      end

      render json: {
        id: main_task.id,
        name: main_task.name,
        description: main_task.description,
        deadline: main_task.deadline,
        users_id: main_task.users_id,
        user_name: main_task.user&.name,
        attachments: main_task.attachments.map { |attachment| { id: attachment.id, url: rails_blob_url(attachment), filename: attachment.filename } }
      }, status: :created
    else
      render json: { error: main_task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @main_task.update(main_task_params)
      if params[:main_task][:remove_attachment_ids]
        params[:main_task][:remove_attachment_ids].each do |attachment_id|
          attachment = @main_task.attachments.find_by(id: attachment_id)
          attachment.purge if attachment
        end
      end

      render json: {
        id: @main_task.id,
        name: @main_task.name,
        description: @main_task.description,
        deadline: @main_task.deadline,
        users_id: @main_task.users_id,
        user_name: @main_task.user&.name,
        attachments: @main_task.attachments.map { |attachment| { id: attachment.id, url: rails_blob_url(attachment), filename: attachment.filename.to_s } }
      }
    else
      render json: { error: @main_task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def remove_attachment
    attachment = @main_task.attachments.find(params[:attachment_id])
    attachment.purge
    render json: { message: "Attachment removed successfully" }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Attachment not found" }, status: :not_found
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
    params.require(:main_task).permit(:name, :description, :deadline, attachments: [], remove_attachment_ids: [])
  end
end

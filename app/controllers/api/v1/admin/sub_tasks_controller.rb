class Api::V1::Admin::SubTasksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_main_task
  before_action :set_sub_task, only: [ :update, :destroy, :remove_attachment ]

  def remove_attachment
    attachment = @sub_task.attachments.find(params[:attachment_id])
    attachment.purge
    render json: { message: "Attachment removed successfully" }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Attachment not found" }, status: :not_found
  end

  def index
    @sub_tasks = @main_task.sub_tasks.includes(:user, :attachments_attachments)
    sub_tasks_with_attachments = @sub_tasks.map do |sub_task|
      {
        id: sub_task.id,
        name: sub_task.name,
        description: sub_task.description,
        deadline: sub_task.deadline,
        users_id: sub_task.users_id,
        user_name: sub_task.user&.name,
        attachments: sub_task.attachments.map do |attachment|
          {
            id: attachment.id,
            url: rails_blob_url(attachment),
            filename: attachment.filename.to_s
          }
        end
      }
    end
    render json: sub_tasks_with_attachments
  end

  def create
    @sub_task = @main_task.sub_tasks.new(sub_task_params)
    @sub_task.users_id = current_user.id

    if @sub_task.save
      sub_task_with_attachments = {
        id: @sub_task.id,
        name: @sub_task.name,
        description: @sub_task.description,
        deadline: @sub_task.deadline,
        users_id: @sub_task.users_id,
        user_name: @sub_task.user&.name,
        attachments: @sub_task.attachments.map do |attachment|
          {
            id: attachment.id,
            url: rails_blob_url(attachment),
            filename: attachment.filename.to_s
          }
        end
      }
      render json: sub_task_with_attachments, status: :created
    else
      render json: @sub_task.errors, status: :unprocessable_entity
    end
  end

  def update
    @sub_task = @main_task.sub_tasks.find(params[:id])

    if params[:sub_task][:remove_attachment_ids]
      params[:sub_task][:remove_attachment_ids].each do |attachment_id|
        attachment = @sub_task.attachments.find_by(id: attachment_id)
        attachment.purge if attachment
      end
    end
    if @sub_task.update(sub_task_params)
      sub_task_with_attachments = {
        id: @sub_task.id,
        name: @sub_task.name,
        description: @sub_task.description,
        deadline: @sub_task.deadline,
        users_id: @sub_task.users_id,
        user_name: @sub_task.user&.name,
        attachments: @sub_task.attachments.map do |attachment|
          {
            id: attachment.id,
            url: rails_blob_url(attachment),
            filename: attachment.filename.to_s
          }
        end
      }
      render json: sub_task_with_attachments
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
    params.require(:sub_task).permit(:name, :description, :deadline, attachments: [])
  end
end

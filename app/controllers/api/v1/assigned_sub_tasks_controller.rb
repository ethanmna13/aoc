class Api::V1::AssignedSubTasksController < ApplicationController
  respond_to :json
  before_action :authenticate_user!
  before_action :set_mentorship, only: [ :create ]

  def index
    assigned_main_task_id = params[:assigned_main_task_id]
    assigned_sub_tasks = AssignedSubTask.includes(:sub_task)
                                        .where(assigned_main_tasks_id: assigned_main_task_id)

    assigned_sub_tasks_with_details = assigned_sub_tasks.map do |task|
      {
        id: task.id,
        mentorships_id: task.mentorships_id,
        mentorship_name: "#{task.mentorship.mentor.name} & #{task.mentorship.mentee.name}",
        assigned_main_tasks_id: task.assigned_main_tasks_id,
        sub_task_id: task.sub_task_id,
        sub_task_name: task.sub_task.name,
        sub_task_description: task.sub_task.description,
        sub_task_deadline: task.sub_task.deadline,
        sub_task_attachments: task.sub_task.attachments.map do |attachment|
          {
            url: url_for(attachment),
            filename: attachment.filename.to_s
          }
        end,
        status: task.status,
        submissions: task.submissions.map do |submission|
          {
            url: url_for(submission),
            filename: submission.filename.to_s
          }
        end
      }
    end

    render json: assigned_sub_tasks_with_details, status: :ok
  end
  def create
    sub_task_ids = params[:sub_task_ids]
    assigned_main_task_id = params[:assigned_main_task_id]

    existing_assignments = AssignedSubTask.where(mentorships_id: @mentorship.id, sub_task_id: sub_task_ids)
    if existing_assignments.any?
      render json: { error: "One or more sub-tasks are already assigned to this mentorship" }, status: :unprocessable_entity
      return
    end

    assigned_sub_tasks = []
    sub_task_ids.each do |sub_task_id|
      assigned_sub_task = AssignedSubTask.create!(
        mentorships_id: @mentorship.id,
        sub_task_id: sub_task_id,
        assigned_main_tasks_id: assigned_main_task_id,
        status: :in_progress
      )
      assigned_sub_tasks << assigned_sub_task
    end

    render json: { message: "Sub tasks assigned successfully", assigned_sub_tasks: assigned_sub_tasks }, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def destroy
    assigned_sub_task = AssignedSubTask.find(params[:id])
    assigned_sub_task.destroy
    render json: { message: "Assigned sub task deleted successfully" }, status: :ok
  rescue ActiveRecord::RecordNotFound => e
    render json: { error: "Assigned sub task not found" }, status: :not_found
  end

  private

  def set_mentorship
    @mentorship = Mentorship.find_by(id: params[:mentorships_id])
    unless @mentorship
      render json: { error: "Mentorship with ID #{params[:mentorships_id]} does not exist" }, status: :not_found
    end
  end
end

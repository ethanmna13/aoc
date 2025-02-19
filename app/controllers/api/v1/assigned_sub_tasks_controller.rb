class Api::V1::AssignedSubTasksController < ApplicationController
  respond_to :json
  before_action :authenticate_user!
  before_action :set_mentorship, only: [ :create ]

  def index
    assigned_sub_tasks = AssignedSubTask.includes(:assigned_main_task, :sub_task, :mentorship).all
    render json: assigned_sub_tasks, include: [ :assigned_main_task, :sub_task, :mentorship ], status: :ok
  end

  def create
    sub_task_ids = params[:sub_task_ids]
    assigned_main_task_id = params[:assigned_main_task_id]

    existing_assignments = AssignedSubTask.where(mentorships_id: @mentorship.id, sub_tasks_id: sub_task_ids)
    if existing_assignments.any?
      render json: { error: "One or more sub-tasks are already assigned to this mentorship" }, status: :unprocessable_entity
      return
    end

    assigned_sub_tasks = []
    sub_task_ids.each do |sub_task_id|
      assigned_sub_task = AssignedSubTask.create!(
        mentorships_id: @mentorship.id,
        sub_tasks_id: sub_task_id,
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
    @mentorship = Mentorship.find(params[:mentorships_id])
  end
end

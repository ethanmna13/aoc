class Api::V1::AssignedMainTasksController < ApplicationController
  respond_to :json
  before_action :authenticate_user!
  before_action :set_mentorship, only: [ :create ]

  def index
    assigned_main_tasks = AssignedMainTask.includes(:mentorship, :main_task).all
    render json: assigned_main_tasks.map, include: [ :mentorship, :main_task ], status: :ok
  end

  def create
    main_tasks_ids = params[:main_tasks_ids]

        existing_assignments = AssignedMainTask.where(mentorships_id: @mentorship.id, main_tasks_id: main_tasks_ids)
    if existing_assignments.any?
      render json: { error: "One or more main tasks are already assigned to this mentorship" }, status: :unprocessable_entity
      return
    end

    assigned_main_tasks = []
    main_tasks_ids.each do |main_task_id|
      assigned_main_task = AssignedMainTask.create!(
        mentorships_id: @mentorship.id,
        main_tasks_id: main_task_id,
        status: :in_progress
      )
      assigned_main_tasks << assigned_main_task
    end

    render json: { message: "Main tasks assigned successfully", assigned_main_tasks: assigned_main_tasks }, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def destroy
    assigned_main_task = AssignedMainTask.find(params[:id])
    assigned_main_task.destroy
    render json: { message: "Assigned main task deleted successfully" }, status: :ok
  rescue ActiveRecord::RecordNotFound => e
    render json: { error: "Assigned main task not found" }, status: :not_found
  end

  private

  def set_mentorship
    @mentorship = Mentorship.find_by(id: params[:mentorships_id])
    unless @mentorship
      render json: { error: "Mentorship with ID #{params[:mentorships_id]} does not exist" }, status: :not_found
    end
  end
end

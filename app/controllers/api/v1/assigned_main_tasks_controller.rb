class Api::V1::AssignedMainTasksController < ApplicationController
  respond_to :json
  before_action :authenticate_user!
  before_action :set_mentorship, only: [ :create ]

  def index
    if params[:mentorships_id].present?
      assigned_main_tasks = AssignedMainTask.includes(mentorship: [ :mentor, :mentee ], main_task: :user)
                                            .where(mentorships_id: params[:mentorships_id])
    else
      assigned_main_tasks = AssignedMainTask.includes(mentorship: [ :mentor, :mentee ], main_task: :user).all
    end

    assigned_main_tasks_with_details = assigned_main_tasks.map do |task|
      {
        id: task.id,
        mentorships_id: task.mentorships_id,
        mentorship_name: "#{task.mentorship.mentor.name} & #{task.mentorship.mentee.name}",
        main_task_id: task.main_tasks_id,
        main_task_name: task.main_task.name,
        main_task_description: task.main_task.description,
        main_task_deadline: task.main_task.deadline,
        main_task_created_by: task.main_task.user.name,
        status: task.status
      }
    end

    render json: assigned_main_tasks_with_details, status: :ok
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

  def update
    assigned_main_task = AssignedMainTask.find(params[:id])

    if params[:status].present?
        assigned_main_task.update(status: params[:status])
    end

    render json: {
        id: assigned_main_task.id,
        mentorships_id: assigned_main_task.mentorships_id,
        mentorship_name: "#{assigned_main_task.mentorship.mentor.name} & #{assigned_main_task.mentorship.mentee.name}",
        main_task_id: assigned_main_task.main_tasks_id,
        main_task_name: assigned_main_task.main_task.name,
        status: assigned_main_task.status
    }, status: :ok
  rescue ActiveRecord::RecordNotFound
      render json: { error: "Assigned main task not found" }, status: :not_found
  rescue => e
      render json: { error: e.message }, status: :unprocessable_entity
  end

  def destroy
    assigned_main_task = AssignedMainTask.find(params[:id])
    assigned_main_task.destroy
    render json: { message: "Assigned main task and its sub tasks deleted successfully" }, status: :ok
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

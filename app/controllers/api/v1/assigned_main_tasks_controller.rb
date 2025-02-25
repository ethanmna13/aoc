class Api::V1::AssignedMainTasksController < ApplicationController
  respond_to :json
  before_action :authenticate_user!
  before_action :set_mentorship, only: [ :create ]

  def index
    if params[:q] && params[:q][:status_eq]
      status_value = AssignedMainTask.statuses[params[:q][:status_eq]]
      params[:q][:status_eq] = status_value if status_value
    end
    @q = AssignedMainTask.includes(mentorship: [ :mentor, :mentee ], main_task: :user).ransack(params[:q])
    assigned_main_tasks = @q.result(distinct: true).paginate(page: params[:page], per_page: params[:per_page] || 10)

    assigned_main_tasks_with_details = assigned_main_tasks.map do |task|
      {
        id: task.id,
        mentorships_id: task.mentorships_id,
        mentor_name: task.mentorship.mentor.name,
        mentee_name: task.mentorship.mentee.name,
        mentorship_name: "#{task.mentorship.mentor.name} & #{task.mentorship.mentee.name}",
        main_task_id: task.main_tasks_id,
        main_task_name: task.main_task.name,
        main_task_description: task.main_task.description,
        main_task_deadline: task.main_task.deadline,
        main_task_created_by: task.main_task.user.name,
        status: task.status,
        main_task_attachments: task.main_task.attachments.map do |attachment|
          {
            url: url_for(attachment),
            filename: attachment.filename.to_s
          }
        end,
        submissions: task.submissions.map do |submission|
          {
            id: submission.id,
            url: url_for(submission),
            filename: submission.filename.to_s
          }
        end
      }
    end

    render json: {
      assigned_main_tasks: assigned_main_tasks_with_details,
      total_pages: assigned_main_tasks.total_pages,
      current_page: assigned_main_tasks.current_page,
      total_entries: assigned_main_tasks.total_entries
    }, status: :ok
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

    if params[:assigned_main_task][:status]
      assigned_main_task.update!(status: params[:assigned_main_task][:status])
    end

    if params[:assigned_main_task][:submissions]
      params[:assigned_main_task][:submissions].each do |submission|
        assigned_main_task.submissions.attach(submission)
      end
    end

    if params[:assigned_main_task][:remove_submission_ids]
      params[:assigned_main_task][:remove_submission_ids].each do |id|
        submission = assigned_main_task.submissions.find_by(id: id)
        submission.purge if submission
      end
    end

    render json: { message: "Submissions updated successfully", assigned_main_task: assigned_main_task }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Assigned main-task not found" }, status: :not_found
  end

  def destroy
    assigned_main_task = AssignedMainTask.find(params[:id])
    assigned_main_task.destroy
    render json: { message: "Assigned main task and its sub tasks deleted successfully" }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Assigned main task not found" }, status: :not_found
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  def set_mentorship
    @mentorship = Mentorship.find_by(id: params[:mentorships_id])
    unless @mentorship
      render json: { error: "Mentorship with ID #{params[:mentorships_id]} does not exist" }, status: :not_found
    end
  end
end

class Api::V1::MentorshipsController < ApplicationController
  before_action :authenticate_user!

  def index
    mentorships = Mentorship.includes(:mentor, :mentee, :assigned_main_tasks, :assigned_sub_tasks).all

    render json: mentorships.as_json(include: {
      mentor: { only: [ :name ] },
      mentee: { only: [ :name ] }
    }).map do |mentorship|
      assigned_main_tasks = mentorship.assigned_main_tasks.present? ? mentorship.assigned_main_tasks.map(&:main_task_name).join(", ") : "N/A"
      submissions = mentorship.assigned_sub_tasks.present? ? mentorship.assigned_sub_tasks.map(&:sub_task_name).join(", ") : "N/A"

      mentorship.merge({
        mentors_name: mentorship[:mentor][:name],
        mentees_name: mentorship[:mentee][:name],
        assigned_main_tasks: assigned_main_tasks,
        submissions: submissions
      }).except(:mentor, :mentee)
    end
  end

  def create
    mentor = User.find_by(id: params[:mentor_id])
    mentee = User.find_by(id: params[:mentee_id])

    if mentor.nil? || mentee.nil?
      render json: { error: "Mentor or Mentee not found" }, status: :not_found
      return
    elsif mentor.role != "mentor"
      render json: { error: "The selected user is not a valid mentor" }, status: :unprocessable_entity
      return
    elsif mentee.role != "mentee"
      render json: { error: "The selected user is not a valid mentee" }, status: :unprocessable_entity
      return
    end

    main_task_id = params[:main_task_id].present? ? params[:main_task_id] : nil
    sub_task_id = params[:sub_task_id].present? ? params[:sub_task_id] : nil

    mentorship = Mentorship.new(
      mentors_id: mentors.id,
      mentees_id: mentees.id,
      main_task_id: main_task_id,
      sub_task_id: sub_task_id,
      status: "Pending"
    )

    if mentorship.save
      render json: mentorship, status: :created
    else
      render json: { error: mentorship.errors.full_messages }, status: :unprocessable_entity
    end
  end
end

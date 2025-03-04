class Api::V1::MentorshipsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_mentorship, only: [ :update, :destroy ]

  def index
    @q = Mentorship.includes(:mentor, :mentee).ransack(params[:q])
    mentorships = @q.result(distinct: true)

    if params[:mentee_id].present?
      mentorships = mentorships.where(mentee_id: params[:mentee_id])
    end

    mentorships = mentorships.paginate(page: params[:page], per_page: 10)


    render json: {
      mentorships: mentorships.map { |mentorship|
        {
          id: mentorship.id,
          mentor_id: mentorship.mentor.id,
          mentee_id: mentorship.mentee.id,
          mentor_name: mentorship.mentor.name,
          mentor_email: mentorship.mentor.email,
          mentee_name: mentorship.mentee.name,
          mentee_email: mentorship.mentee.email
        }
      },
      pagination: {
        current_page: mentorships.current_page,
        total_pages: mentorships.total_pages,
        total_entries: mentorships.total_entries
      }
    }
  end



  def create
    @mentorship = Mentorship.new(mentorship_params)
    if @mentorship.save
      render json: @mentorship, status: :created
    else
      render json: { error: @mentorship.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @mentorship.update(mentor_id: params[:mentor_id], mentee_id: params[:mentee_id])
      render json: {
        id: @mentorship.id,
        mentor_id: @mentorship.mentor_id,
        mentee_id: @mentorship.mentee_id,
        mentor_name: @mentorship.mentor.name,
        mentor_email: @mentorship.mentor.email,
        mentee_name: @mentorship.mentee.name,
        mentee_email: @mentorship.mentee.email
      }
    else
      render json: { error: @mentorship.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    if @mentorship.destroy
      render json: { message: "Mentorship deleted successfully" }
    else
      render json: { error: "Failed to delete mentorship" }, status: :unprocessable_entity
    end
  end

  private

  def set_mentorship
    @mentorship = Mentorship.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Mentorship not found" }, status: :not_found
  end

  def mentorship_params
    params.require(:mentorship).permit(:mentor_id, :mentee_id)
  end
end

class Api::V1::Admin::MentorshipsController < ApplicationController
  respond_to :json
  before_action :authenticate_user!

  def index
    mentorships = Mentorships.all
    render json: mentorships
  end

  def create
    mentorships = Mentorships.new(mentorship_params)
    if mentorships.save
      render json: mentorships, status: :created
    else
      render json: { error: mentorships.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
  end

  def delete
  end

  private

  def mentorship_params
    params.require(:mentorships).permit(:mentors_id, :mentees_id, :status, :main_tasks_id, :sub_tasks_id)
  end
end

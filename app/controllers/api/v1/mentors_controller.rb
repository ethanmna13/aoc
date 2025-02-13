class Api::V1::MentorsController < ApplicationController
  respond_to :json
  def index
    mentors = User.mentors
    render json: mentors
  end
end

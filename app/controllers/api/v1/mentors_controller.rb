class Api::V1::MentorsController < ApplicationController
  respond_to :json
  before_action :authenticate_user!
  def index
    mentors = User.mentors
    render json: mentors
  end
end

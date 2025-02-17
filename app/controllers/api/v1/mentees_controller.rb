class Api::V1::MenteesController < ApplicationController
  respond_to :json
  before_action :authenticate_user!
  def index
    mentees = User.mentees
    render json: mentees
  end
end

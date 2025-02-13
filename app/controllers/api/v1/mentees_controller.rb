class Api::V1::MenteesController < ApplicationController
  respond_to :json
  def index
    mentees = User.mentees
    render json: mentees
  end
end
